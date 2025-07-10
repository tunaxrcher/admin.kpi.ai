import { BaseRepository } from '../../lib/repository/baseRepository'
import { GachaHistory } from '@prisma/client'
import {
  RewardReportData,
  RewardFilters,
  GachaHistoryWithDetails,
  CharacterGachaStats,
} from './types'

export class RewardRepository extends BaseRepository<GachaHistory> {
  private static instance: RewardRepository

  public static getInstance() {
    if (!RewardRepository.instance) {
      RewardRepository.instance = new RewardRepository()
    }
    return RewardRepository.instance
  }

  async findAll() {
    return this.prisma.gachaHistory.findMany()
  }

  async findById(id: number) {
    return this.prisma.gachaHistory.findUnique({
      where: { id },
    })
  }

  async create(data: Omit<GachaHistory, 'id' | 'createdAt'>) {
    return this.prisma.gachaHistory.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<GachaHistory, 'id' | 'createdAt'>>,
  ) {
    return this.prisma.gachaHistory.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.gachaHistory.delete({
      where: { id },
    })
  }

  async getRewardReportData(
    filters?: RewardFilters,
  ): Promise<RewardReportData> {
    const where: Record<string, unknown> = {}

    // Apply filters
    if (filters?.characterId) {
      where.characterId = filters.characterId
    }

    if (filters?.search) {
      where.OR = [
        { character: { name: { contains: filters.search } } },
        { character: { user: { name: { contains: filters.search } } } },
        { character: { user: { username: { contains: filters.search } } } },
        { rewardItem: { name: { contains: filters.search } } },
        { rewardItem: { category: { contains: filters.search } } },
      ]
    }

    // Handle date range filters
    if (filters?.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      let startDate: Date
      let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
          break
        case 'week':
          const dayOfWeek = now.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday, 0, 0, 0, 0)
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - daysToMonday), 23, 59, 59, 999)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
          break
        default:
          startDate = new Date(0)
      }

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      }
    } else if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        ;(where.createdAt as Record<string, unknown>).gte = new Date(
          filters.startDate,
        )
      }
      if (filters.endDate) {
        ;(where.createdAt as Record<string, unknown>).lte = new Date(
          filters.endDate,
        )
      }
    }

    // Get summary statistics with same filters
    const [gachaStats, xenyStats] = await Promise.all([
      this.prisma.gachaHistory.aggregate({
        _sum: { tokenSpent: true },
        _count: { id: true },
        where,
      }),
      this.prisma.gachaHistory.aggregate({
        _sum: { xeny: true },
        where,
      }),
    ])

    // Get character statistics
    const characterStats = await this.prisma.gachaHistory.groupBy({
      by: ['characterId'],
      _sum: { tokenSpent: true },
      _count: { id: true, isWin: true },
      where: { isWin: true },
    })

    // Get characters with gacha history
    const charactersWithGacha = await this.prisma.character.findMany({
      where: {
        id: { in: characterStats.map((stat) => stat.characterId) },
      },
      include: {
        user: {
          select: { name: true, username: true },
        },
        currentJobLevel: {
          include: { jobClass: true },
        },
        rewardStats: true,
      },
    })

    // Build character summary
    const characterSummary: CharacterGachaStats[] = charactersWithGacha.map(
      (character) => {
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
          winRate:
            totalPulls > 0
              ? ((totalWins / totalPulls) * 100).toFixed(2)
              : '0.00',
          lastGachaAt: character.rewardStats?.lastGachaAt,
        }
      },
    )

    // Get gacha history with pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const [gachaHistory, totalGachaHistory] = await Promise.all([
      this.prisma.gachaHistory.findMany({
        where,
        include: {
          character: {
            include: {
              user: {
                select: { name: true, username: true },
              },
              currentJobLevel: {
                include: { jobClass: true },
              },
            },
          },
          rewardItem: {
            select: {
              name: true,
              category: true,
              imageUrl: true,
              metadata: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.gachaHistory.count({ where }),
    ])

    // Add Xeny earned to gacha history
    const gachaHistoryWithXeny: GachaHistoryWithDetails[] = gachaHistory.map(
      (gacha) => {
        return {
          ...gacha,
          xenyEarned: gacha.xeny || 0,
        }
      },
    )

    return {
      summary: {
        totalTokensSpent: gachaStats._sum.tokenSpent || 0,
        totalGachaPulls: gachaStats._count.id || 0,
        totalXenyDistributed: xenyStats._sum.xeny || 0,
      },
      characterSummary,
      gachaHistory: gachaHistoryWithXeny,
      totalGachaHistory,
    }
  }
}

export const rewardRepository = RewardRepository.getInstance()
