import { NextRequest, NextResponse } from 'next/server'
import { rewardService } from '../../../../features/rewards/service/server'

export async function GET(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error fetching reward report:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch reward report' },
      { status: 500 },
    )
  }
}
