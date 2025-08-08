import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { prisma } from '@/lib/db'

export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params
    const characterId = parseInt(id)
    const body = await request.json()

    const { workStartTime, workEndTime, salary, workDays } = body

    // ตรวจสอบว่าตัวละครมีอยู่จริง
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    })

    if (!character) {
      return NextResponse.json(
        { error: 'ไม่พบตัวละครที่ระบุ' },
        { status: 404 },
      )
    }

    // อัปเดตข้อมูลการตั้งค่าการทำงาน
    const updatedCharacter = await prisma.character.update({
      where: { id: characterId },
      data: {
        workStartTime: workStartTime || null,
        workEndTime: workEndTime || null,
        salary: salary ? parseFloat(salary) : null,
        workDays: workDays || null,
      },
      include: {
        user: {
          select: {
            email: true,
            avatar: true,
          },
        },
        jobClass: {
          select: {
            name: true,
          },
        },
        currentJobLevel: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedCharacter,
    })
  },
)
