import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { chatHistoryData } from '../../../../../mock/data/aiData'

export const GET = withErrorHandling(async (request: NextRequest) => {
  return NextResponse.json(chatHistoryData)
})
