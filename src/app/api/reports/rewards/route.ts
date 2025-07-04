import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'

export async function GET() {
    try {
        // ดึงข้อมูลสถิติรวมของกาชา
        const gachaStats = await prisma.gachaHistory.aggregate({
            _sum: {
                tokenSpent: true
            },
            _count: {
                id: true
            }
        })

        // ดึงข้อมูล Xeny ที่แจกไปแล้วทั้งหมด (ใช้ RewardPurchase แทน)
        const xenyStats = await prisma.rewardPurchase.aggregate({
            _sum: {
                tokenSpent: true
            },
            where: {
                purchaseType: 'gacha'
            }
        })

        // ดึงข้อมูลประวัติกาชาของแต่ละ Character
        const characterGachaHistory = await prisma.gachaHistory.findMany({
            include: {
                character: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                username: true
                            }
                        },
                        currentJobLevel: {
                            include: {
                                jobClass: true
                            }
                        }
                    }
                },
                rewardItem: {
                    select: {
                        name: true,
                        category: true,
                        imageUrl: true,
                        metadata: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })





        // จัดกลุ่มข้อมูลตาม Character
        const characterStats = await prisma.gachaHistory.groupBy({
            by: ['characterId'],
            _sum: {
                tokenSpent: true
            },
            _count: {
                id: true,
                isWin: true
            },
            where: {
                isWin: true
            }
        })

        // ดึงข้อมูล Character ทั้งหมดที่มีประวัติกาชา
        const charactersWithGacha = await prisma.character.findMany({
            where: {
                id: {
                    in: characterStats.map(stat => stat.characterId)
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        username: true
                    }
                },
                currentJobLevel: {
                    include: {
                        jobClass: true
                    }
                },
                rewardStats: true
            }
        })

        // รวมข้อมูลสถิติของแต่ละ Character
        const characterSummary = charactersWithGacha.map(character => {
            const totalPulls = character.rewardStats?.totalGachaPulls || 0
            const totalWins = character.rewardStats?.totalGachaWins || 0
            const totalSpent = character.rewardStats?.totalTokensSpent || 0

            return {
                characterId: character.id,
                characterName: character.name,
                userName: character.user.name,
                username: character.user.username,
                jobClass: character.currentJobLevel.jobClass.name,
                jobLevel: character.currentJobLevel.title,
                totalPulls,
                totalWins,
                totalSpent,
                winRate: totalPulls > 0 ? (totalWins / totalPulls * 100).toFixed(2) : '0.00',
                lastGachaAt: character.rewardStats?.lastGachaAt
            }
        })

        // เพิ่มข้อมูล Xeny ที่ได้ให้กับ gacha history
        const gachaHistoryWithXeny = characterGachaHistory.map(gacha => {
            let xenyEarned = 0
            
            // ถ้าได้รางวัลและมี rewardItem ให้ดึง Xeny จาก metadata
            if (gacha.isWin && gacha.rewardItem && gacha.rewardItem.metadata) {
                try {
                    const metadata = gacha.rewardItem.metadata as { value?: number; currency?: string }
                    if (metadata.value && metadata.currency === 'THB') {
                        xenyEarned = metadata.value
                    }
                } catch (error) {
                    console.error('Error parsing metadata:', error)
                }
            }
            
            return {
                ...gacha,
                xenyEarned
            }
        })



        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalTokensSpent: gachaStats._sum.tokenSpent || 0,
                    totalGachaPulls: gachaStats._count.id || 0,
                    totalXenyDistributed: xenyStats._sum.tokenSpent || 0
                },
                characterSummary,
                gachaHistory: gachaHistoryWithXeny
            }
        })
    } catch (error) {
        console.error('Error fetching reward report:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reward report' },
            { status: 500 }
        )
    }
} 