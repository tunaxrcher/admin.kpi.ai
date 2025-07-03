import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { jobLevelRepository } from '../../../../../features/jobs/repository'

export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  console.log(`[API] GET Job Levels by Job Class ID: ${params.id}`)
  
  const jobClassId = parseInt(params.id)
  if (isNaN(jobClassId)) {
    return NextResponse.json({ message: 'Invalid job class ID' }, { status: 400 })
  }

  // Get character level from query parameter for filtering
  const searchParams = request.nextUrl.searchParams
  const characterLevel = searchParams.get('characterLevel') 
    ? parseInt(searchParams.get('characterLevel')!)
    : undefined
  
  const currentJobLevel = searchParams.get('currentJobLevel')
    ? parseInt(searchParams.get('currentJobLevel')!)
    : undefined

  const levels = await jobLevelRepository.getJobLevelsByJobClass(jobClassId, characterLevel, currentJobLevel)
  
  return NextResponse.json(levels)
}) 