import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const workLocation = await prisma.workLocation.findUnique({
      where: { id }
    })

    if (!workLocation) {
      return NextResponse.json(
        { error: 'ไม่พบสถานที่ทำงาน' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: workLocation
    })
  } catch (error: any) {
    console.error('Error fetching work location:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่ทำงาน' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name, address, latitude, longitude, radius, isActive } = body

    const workLocation = await prisma.workLocation.update({
      where: { id },
      data: {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseFloat(radius),
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: workLocation
    })
  } catch (error: any) {
    console.error('Error updating work location:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตสถานที่ทำงาน' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    await prisma.workLocation.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'ลบสถานที่ทำงานเรียบร้อยแล้ว'
    })
  } catch (error: any) {
    console.error('Error deleting work location:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบสถานที่ทำงาน' },
      { status: 500 }
    )
  }
}
