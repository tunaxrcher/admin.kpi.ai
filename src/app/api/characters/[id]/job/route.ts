import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { characterService } from '../../../../../features/characters/service/server'

export const PUT = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    console.log(
      `[API] PUT Update Character Job - ID: ${(await context.params).id}`,
    )

    const { id } = await context.params
    const characterId = parseInt(id)
    if (isNaN(characterId)) {
      return NextResponse.json(
        { message: 'Invalid character ID' },
        { status: 400 },
      )
    }

    const body = await request.json()
    const result = await characterService.updateJob(characterId, body)

    return NextResponse.json(result)
  },
)
