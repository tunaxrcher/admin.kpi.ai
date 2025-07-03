import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { characterService } from '../../../../../features/characters/service/server'

export const PUT = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  console.log(`[API] PUT Update Character Job - ID: ${params.id}`)
  
  const id = parseInt(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid character ID' }, { status: 400 })
  }

  const body = await request.json()
  const result = await characterService.updateJob(id, body)
  
  return NextResponse.json(result)
}) 