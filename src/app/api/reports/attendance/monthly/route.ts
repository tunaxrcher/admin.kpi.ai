import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth, format, eachDayOfInterval, getDay } from 'date-fns'
import { th } from 'date-fns/locale'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const characterId = searchParams.get('characterId')

    if (!year || !month) {
      return NextResponse.json(
        { error: 'กรุณาระบุปีและเดือน' },
        { status: 400 }
      )
    }

    const targetDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const monthStart = startOfMonth(targetDate)
    const monthEnd = endOfMonth(targetDate)

    // สร้าง WHERE clause สำหรับกรองตัวละคร
    const whereClause = characterId 
      ? { characterId: parseInt(characterId) }
      : {}

    // ดึงข้อมูลตัวละครทั้งหมด (หรือแค่ตัวที่ระบุ)
    const characters = await prisma.character.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            avatar: true
          }
        },
        jobClass: {
          select: {
            name: true
          }
        },
        currentJobLevel: {
          select: {
            title: true
          }
        }
      }
    })

    // ดึงข้อมูลการเข้าออกงานในช่วงเวลาที่กำหนด
    const attendanceRecords = await prisma.checkinCheckout.findMany({
      where: {
        ...whereClause,
        checkinAt: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      include: {
        character: {
          select: {
            name: true,
            workStartTime: true,
            workEndTime: true,
            workDays: true
          }
        }
      },
      orderBy: {
        checkinAt: 'asc'
      }
    })

    // ดึงข้อมูลวันหยุดในเดือนนั้น
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd
        },
        isActive: true
      }
    })

    const holidayDates = new Set(
      holidays.map(h => format(h.date, 'yyyy-MM-dd'))
    )

    // สร้างรายงานสำหรับแต่ละตัวละคร
    const reports = characters.map(character => {
      // กรองข้อมูลการเข้างานของตัวละครนี้
      const characterAttendance = attendanceRecords.filter(
        record => record.characterId === character.id
      )

      // ดึงวันทำงานของตัวละคร (ถ้าไม่มีข้อมูล ใช้ค่าเริ่มต้น จันทร์-ศุกร์)
      const workDaysData = character.workDays as number[] || [1, 2, 3, 4, 5]
      const workDaysSet = new Set(workDaysData)

      // คำนวณสถิติการเข้างาน
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
      let workDaysCount = 0
      let checkinDays = 0
      let checkoutDays = 0
      let lateDays = 0
      let absentDays = 0

      // สร้าง Map สำหรับเช็คข้อมูลการเข้างานแต่ละวัน
      const attendanceByDate = new Map()
      characterAttendance.forEach(record => {
        const dateKey = format(record.checkinAt, 'yyyy-MM-dd')
        attendanceByDate.set(dateKey, record)
      })

      // ตรวจสอบแต่ละวันในเดือน
      daysInMonth.forEach(day => {
        const dayOfWeek = getDay(day) // 0 = Sunday, 1 = Monday, etc.
        const dateKey = format(day, 'yyyy-MM-dd')
        const isHoliday = holidayDates.has(dateKey)
        const isWorkDay = workDaysSet.has(dayOfWeek) && !isHoliday

        if (isWorkDay) {
          workDaysCount++
          
          const attendanceRecord = attendanceByDate.get(dateKey)
          if (attendanceRecord) {
            checkinDays++
            if (attendanceRecord.checkoutAt) {
              checkoutDays++
            }
            if (attendanceRecord.lateLevel && attendanceRecord.lateLevel > 0) {
              lateDays++
            }
          } else {
            absentDays++
          }
        }
      })

      return {
        character: {
          id: character.id,
          name: character.name,
          email: character.user.email,
          avatar: character.user.avatar,
          jobClass: character.jobClass.name,
          jobLevel: character.currentJobLevel.title,
          workStartTime: character.workStartTime,
          workEndTime: character.workEndTime,
          workDays: workDaysData
        },
        attendance: {
          workDaysInMonth: workDaysCount,
          checkinDays,
          checkoutDays,
          lateDays,
          absentDays,
          attendanceRate: workDaysCount > 0 ? (checkinDays / workDaysCount * 100).toFixed(1) : '0.0'
        },
        records: characterAttendance.map(record => ({
          id: record.id,
          checkinAt: record.checkinAt,
          checkoutAt: record.checkoutAt,
          totalHours: record.totalHours,
          lateLevel: record.lateLevel,
          lateMinutes: record.lateMinutes,
          checkinType: record.checkinType,
          notes: record.notes
        }))
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        period: {
          year: parseInt(year),
          month: parseInt(month),
          monthName: format(targetDate, 'MMMM yyyy', { locale: th }),
          startDate: monthStart,
          endDate: monthEnd
        },
        holidays: holidays.map(h => ({
          id: h.id,
          name: h.name,
          date: h.date,
          description: h.description
        })),
        reports
      }
    })

  } catch (error) {
    console.error('Error generating attendance report:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างรายงาน' },
      { status: 500 }
    )
  }
}