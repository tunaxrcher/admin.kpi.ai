import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const holidayId = parseInt(params.id)
    const body = await request.json()
    
    const { name, description, date, isRecurring, isActive } = body

    const holiday = await prisma.holiday.update({
      where: { id: holidayId },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        date: date ? new Date(date) : undefined,
        isRecurring: isRecurring !== undefined ? isRecurring : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    })

    return NextResponse.json({
      success: true,
      data: holiday
    })

  } catch (error) {
    console.error('Error updating holiday:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตวันหยุด' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const holidayId = parseInt(params.id)

    await prisma.holiday.delete({
      where: { id: holidayId }
    })

    return NextResponse.json({
      success: true,
      message: 'ลบวันหยุดเรียบร้อยแล้ว'
    })

  } catch (error) {
    console.error('Error deleting holiday:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบวันหยุด' },
      { status: 500 }
    )
  }
}