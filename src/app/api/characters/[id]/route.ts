import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../lib/withErrorHandling'
import { characterService } from '../../../../features/characters/service/server'

export const GET = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await context.params
    console.log(`[API] GET Character by ID: ${id}`)

    const characterId = parseInt(id)

    if (isNaN(characterId)) {
      return NextResponse.json(
        { error: 'Character ID ไม่ถูกต้อง' },
        { status: 400 },
      )
    }

    const character = await characterService.getCharacterById(characterId)

    if (!character) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลบุคลากร' }, { status: 404 })
    }

    return NextResponse.json(character)
  },
)
