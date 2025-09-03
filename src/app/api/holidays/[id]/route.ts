import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../lib/withErrorHandling'
import { prisma } from '@/lib/db'

export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params
    console.log(`[API] PUT Update Holiday by ID: ${id}`)

    const holidayId = parseInt(id)
    const body = await request.json()

    const { name, description, date, isRecurring, isActive } = body

    const holiday = await prisma.holiday.update({
      where: { id: holidayId },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        date: date ? new Date(date) : undefined,
        isRecurring: isRecurring !== undefined ? isRecurring : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      data: holiday,
    })
  },
)

export const DELETE = withErrorHandling(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params
    console.log(`[API] DELETE Holiday by ID: ${id}`)

    const holidayId = parseInt(id)

    await prisma.holiday.delete({
      where: { id: holidayId },
    })

    return NextResponse.json({
      success: true,
      message: 'ลบวันหยุดเรียบร้อยแล้ว',
    })
  },
)
