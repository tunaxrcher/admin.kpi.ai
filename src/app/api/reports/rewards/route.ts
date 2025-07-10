import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../lib/withErrorHandling'
import { rewardService } from '../../../../features/rewards/service/server'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)

  const filters = {
    characterId: searchParams.get('characterId')
      ? parseInt(searchParams.get('characterId')!)
      : undefined,
    search: searchParams.get('search') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    dateRange:
      (searchParams.get('dateRange') as
        | 'all'
        | 'today'
        | 'week'
        | 'month'
        | 'year') || undefined,
    page: searchParams.get('page')
      ? parseInt(searchParams.get('page')!)
      : undefined,
    limit: searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined,
  }

  const data = await rewardService.getRewardReportData(filters)

  return NextResponse.json({
    success: true,
    data,
  })
})
