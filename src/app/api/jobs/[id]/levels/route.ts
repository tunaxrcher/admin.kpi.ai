import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { jobLevelRepository } from '../../../../../features/jobs/repository'

export const GET = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    console.log(
      `[API] GET Job Levels by Job Class ID: ${(await context.params).id}`,
    )

    const { id } = await context.params
    const jobClassId = parseInt(id)
    if (isNaN(jobClassId)) {
      return NextResponse.json(
        { message: 'Invalid job class ID' },
        { status: 400 },
      )
    }

    // Get character level from query parameter for filtering
    const searchParams = request.nextUrl.searchParams
    const characterLevel = searchParams.get('characterLevel')
      ? parseInt(searchParams.get('characterLevel')!)
      : undefined

    const currentJobLevel = searchParams.get('currentJobLevel')
      ? parseInt(searchParams.get('currentJobLevel')!)
      : undefined

    const levels = await jobLevelRepository.getJobLevelsByJobClass(
      jobClassId,
      characterLevel,
      currentJobLevel,
    )

    return NextResponse.json(levels)
  },
)
