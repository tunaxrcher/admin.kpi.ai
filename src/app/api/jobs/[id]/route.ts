import { jobClassService } from '../../../../features/jobs/service/server'
import { withErrorHandling } from '../../../../lib/withErrorHandling'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withErrorHandling(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    console.log(`[API] GET Job Class By id`)

    const { id } = await context.params
    const jobClass = await jobClassService.getJobClassById(Number(id))

    if (!jobClass) {
      return NextResponse.json(
        { message: 'ไม่พบอาชีพที่ระบุ' },
        { status: 404 },
      )
    }

    return NextResponse.json(jobClass)
  },
)

export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    console.log(`[API] UPDATE Job Class By id`)

    const { id } = await context.params

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
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ]
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

    const jobClass = await jobClassService.updateJobClass(Number(id), {
      ...data,
      imageFile,
    })

    return NextResponse.json(jobClass)
  },
)

export const DELETE = withErrorHandling(
  async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    console.log(`[API] DELETE Job Class By id`)

    const { id } = await context.params

    await jobClassService.deleteJobClass(Number(id))

    return NextResponse.json({ message: 'ลบอาชีพเรียบร้อยแล้ว' })
  },
)
