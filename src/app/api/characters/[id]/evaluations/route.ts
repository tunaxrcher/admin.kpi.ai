import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { prisma } from '@/lib/db'

export const GET = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params
    console.log(`[API] GET Character Evaluations - Character ID: ${id}`)

    const characterId = parseInt(id)

    if (isNaN(characterId)) {
      return NextResponse.json(
        { error: 'Character ID ไม่ถูกต้อง' },
        { status: 400 },
      )
    }

    // Get query parameters for filtering by year/month if needed
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    let whereClause: any = {
      characterId: characterId,
    }

    if (year) {
      whereClause.year = parseInt(year)
    }

    if (month) {
      whereClause.month = parseInt(month)
    }

    const evaluations = await prisma.monthlyEvaluation.findMany({
      where: whereClause,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })

    return NextResponse.json({
      success: true,
      data: evaluations,
    })
  },
)
