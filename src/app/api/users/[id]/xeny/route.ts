import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling } from '../../../../../lib/withErrorHandling'
import { prisma } from '../../../../../lib/db'

export const GET = withErrorHandling(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    console.log(`[API] GET User Xeny - User ID: ${(await context.params).id}`)

    const { id } = await context.params
    const userId = parseInt(id)
    if (isNaN(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 })
    }

    // Get user Xeny or create if not exists
    const userXeny = (await prisma.$queryRaw`
      SELECT currentXeny FROM UserXeny WHERE userId = ${userId}
    `) as { currentXeny: number }[]

    if (userXeny.length === 0) {
      // Create UserXeny if not exists
      await prisma.$executeRaw`
        INSERT INTO UserXeny (userId, currentXeny, totalEarnedXeny, totalSpentXeny, createdAt, updatedAt)
        VALUES (${userId}, 0, 0, 0, NOW(), NOW())
      `
      return NextResponse.json({ currentXeny: 0 })
    }

    return NextResponse.json({ currentXeny: userXeny[0].currentXeny })
  },
)
