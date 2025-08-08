import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const workLocations = await prisma.workLocation.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: workLocations
    })
  } catch (error: any) {
    console.error('Error fetching work locations:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานที่ทำงาน' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, latitude, longitude, radius = 100 } = body

    if (!name || !address || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    const workLocation = await prisma.workLocation.create({
      data: {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseFloat(radius)
      }
    })

    return NextResponse.json({
      success: true,
      data: workLocation
    })
  } catch (error: any) {
    console.error('Error creating work location:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างสถานที่ทำงาน' },
      { status: 500 }
    )
  }
}
