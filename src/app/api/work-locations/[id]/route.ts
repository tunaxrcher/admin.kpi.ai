import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../lib/withErrorHandling'
import { prisma } from '@/lib/db'

export const GET = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params
    const workLocationId = parseInt(id)

    const workLocation = await prisma.workLocation.findUnique({
      where: { id: workLocationId },
    })

    if (!workLocation) {
      return NextResponse.json({ error: 'ไม่พบสถานที่ทำงาน' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: workLocation,
    })
  },
)

export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params
    const workLocationId = parseInt(id)
    const body = await request.json()
    const { name, address, latitude, longitude, radius, isActive } = body

    const workLocation = await prisma.workLocation.update({
      where: { id: workLocationId },
      data: {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseFloat(radius),
        isActive,
      },
    })

    return NextResponse.json({
      success: true,
      data: workLocation,
    })
  },
)

export const DELETE = withErrorHandling(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params
    const workLocationId = parseInt(id)

    await prisma.workLocation.delete({
      where: { id: workLocationId },
    })

    return NextResponse.json({
      success: true,
      message: 'ลบสถานที่ทำงานเรียบร้อยแล้ว',
    })
  },
)
