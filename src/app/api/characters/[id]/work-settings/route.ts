import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { characterService } from '../../../../../features/characters/service/server'

export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    console.log(`[API] UPDATE Character Work Settings`)
    
    const { id } = await context.params
    const characterId = Number(id)
    const data = await request.json()
    
    const updatedCharacter = await characterService.updateWorkSettings(
      characterId,
      data,
    )
    
    return NextResponse.json(updatedCharacter)
  },
) 