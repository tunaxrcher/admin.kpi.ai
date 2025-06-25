// src/app/api/jobs/levels/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { jobLevelService } from '../../../../../features/jobs/service/server'

export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    console.log(`[API] UPDATE Job Level By id`)

    const { id } = await context.params
    const levelId = Number(id)
    const data = await request.json()
    const jobLevel = await jobLevelService.updateJobLevel(levelId, data)

    return NextResponse.json(jobLevel)
  },
)
