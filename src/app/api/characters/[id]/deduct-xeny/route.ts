import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { characterService } from '../../../../../features/characters/service/server'

export const POST = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  console.log(`[API] POST Deduct Xeny - Character ID: ${params.id}`)
  
  const characterId = parseInt(params.id)
  if (isNaN(characterId)) {
    return NextResponse.json({ message: 'Invalid character ID' }, { status: 400 })
  }

  const body = await request.json()
  const result = await characterService.deductXeny(characterId, body)
  
  return NextResponse.json(result)
}) 