import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../lib/withErrorHandling'
import { characterService } from '../../../../features/characters/service/server'

export const POST = withErrorHandling(async (request: NextRequest) => {
  console.log(`[API] POST Bulk Delete Characters`)

  const body = await request.json()
  const { characterIds } = body

  if (!Array.isArray(characterIds) || characterIds.length === 0) {
    return NextResponse.json(
      { error: 'กรุณาระบุรายการบุคลากรที่ต้องการลบ' },
      { status: 400 },
    )
  }

  // Validate all IDs are numbers
  const validIds = characterIds.filter((id) => typeof id === 'number' && !isNaN(id))
  if (validIds.length !== characterIds.length) {
    return NextResponse.json(
      { error: 'รายการ ID ไม่ถูกต้อง' },
      { status: 400 },
    )
  }

  const result = await characterService.bulkDeleteCharacters(validIds)

  return NextResponse.json({
    success: true,
    message: `ลบบุคลากร ${result.deletedCount} คนเรียบร้อยแล้ว`,
    data: result,
  })
})
