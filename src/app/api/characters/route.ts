import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../lib/withErrorHandling'
import { characterService } from '../../../features/characters/service/server'

export const GET = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] GET All Characters`)
  
  const searchParams = request.nextUrl.searchParams
  const filters = {
    jobClassId: searchParams.get('jobClassId')
      ? parseInt(searchParams.get('jobClassId')!)
      : undefined,
    search: searchParams.get('search') || undefined,
  }
  
  const result = await characterService.getAllCharacters(filters)
  return NextResponse.json(result)
}) 