import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const characterId = parseInt(params.id)
    
    if (isNaN(characterId)) {
      return NextResponse.json(
        { error: 'Character ID ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    // Get query parameters for filtering by year/month if needed
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    
    let whereClause: any = {
      characterId: characterId
    }
    
    if (year) {
      whereClause.year = parseInt(year)
    }
    
    if (month) {
      whereClause.month = parseInt(month)
    }

    const evaluations = await prisma.monthlyEvaluation.findMany({
      where: whereClause,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: evaluations
    })
  } catch (error) {
    console.error('Error fetching character evaluations:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการประเมิน' },
      { status: 500 }
    )
  }
}
