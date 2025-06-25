// src/app/api/jobs/generate-levels/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../lib/withErrorHandling'
import { jobLevelService } from '../../../../features/jobs/service/server'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] POST Generate Level`)

  const data = await request.json()

  if (!data.jobName || typeof data.jobName !== 'string') {
    return NextResponse.json(
      { message: 'ชื่ออาชีพไม่ถูกต้อง' },
      { status: 400 },
    )
  }

  const levels = await jobLevelService.generateJobLevels(data)

  // ตรวจสอบว่า levels เป็น array
  if (!Array.isArray(levels)) {
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการสร้าง level tree' },
      { status: 500 },
    )
  }

  return NextResponse.json(levels)
})
