import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../lib/withErrorHandling'
import { prisma } from '@/lib/db'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const workLocations = await prisma.workLocation.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return NextResponse.json({
    success: true,
    data: workLocations,
  })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()
  const { name, address, latitude, longitude, radius = 100 } = body

  if (!name || !address || latitude === undefined || longitude === undefined) {
    return NextResponse.json(
      { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
      { status: 400 },
    )
  }

  const workLocation = await prisma.workLocation.create({
    data: {
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseFloat(radius),
    },
  })

  return NextResponse.json({
    success: true,
    data: workLocation,
  })
})
