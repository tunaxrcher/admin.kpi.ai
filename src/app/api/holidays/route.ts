import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../lib/withErrorHandling'
import { prisma } from '@/lib/db'
import { startOfYear, endOfYear } from 'date-fns'
import { Prisma } from '@prisma/client'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get('year')

  let whereClause: Prisma.HolidayWhereInput = { isActive: true }

  // ถ้าระบุปี ให้กรองตามปีนั้น
  if (year) {
    const targetYear = parseInt(year)
    const yearStart = startOfYear(new Date(targetYear, 0, 1))
    const yearEnd = endOfYear(new Date(targetYear, 0, 1))

    whereClause = {
      ...whereClause,
      date: {
        gte: yearStart,
        lte: yearEnd,
      },
    }
  }

  const holidays = await prisma.holiday.findMany({
    where: whereClause,
    orderBy: {
      date: 'asc',
    },
  })

  return NextResponse.json({
    success: true,
    data: holidays,
  })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()
  const { name, description, date, isRecurring } = body

  if (!name || !date) {
    return NextResponse.json(
      { error: 'กรุณาระบุชื่อและวันที่วันหยุด' },
      { status: 400 },
    )
  }

  const holiday = await prisma.holiday.create({
    data: {
      name,
      description: description || null,
      date: new Date(date),
      isRecurring: isRecurring || false,
    },
  })

  return NextResponse.json({
    success: true,
    data: holiday,
  })
})
