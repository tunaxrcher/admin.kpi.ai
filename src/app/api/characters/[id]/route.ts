import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../lib/withErrorHandling'
import { characterService } from '../../../../features/characters/service/server'

export const GET = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    console.log(`[API] GET Character By id`)
    
    const { id } = await context.params
    const characterId = Number(id)
    
    const character = await characterService.getCharacterById(characterId)
    
    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 },
      )
    }
    
    return NextResponse.json(character)
  },
) 