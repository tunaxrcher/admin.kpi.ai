// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../lib/withErrorHandling'
import { jobClassService } from '../../../features/jobs/service/server'

export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] GET All Job Class`)

  const jobClasses = await jobClassService.getAllJobClasses()

  return NextResponse.json(jobClasses)
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] CREATE Job Class`)

  const formData = await request.formData()
  const dataString = formData.get('data') as string
  const imageFile = formData.get('imageFile') as File | null

  if (!dataString) {
    return NextResponse.json(
      { message: 'ไม่พบข้อมูลที่จำเป็น' },
      { status: 400 },
    )
  }

  const data = JSON.parse(dataString)

  // ตรวจสอบรูปภาพถ้ามี
  if (imageFile) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { message: 'รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP)' },
        { status: 400 },
      )
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { message: 'ขนาดไฟล์ต้องไม่เกิน 5MB' },
        { status: 400 },
      )
    }
  }

  const jobClass = await jobClassService.createJobClass({
    ...data,
    imageFile,
  })

  return NextResponse.json(jobClass)
})
