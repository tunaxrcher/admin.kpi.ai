import {
  Character,
  User,
  JobClass,
  JobLevel,
  GachaHistory,
} from '@prisma/client'

export interface CharacterWithUser extends Character {
  user: Pick<User, 'name' | 'username'>
  currentJobLevel: JobLevel & {
    jobClass: JobClass
  }
}

export interface GachaHistoryWithDetails extends GachaHistory {
  character: CharacterWithUser
  rewardItem?: {
    name: string
    category: string
    imageUrl: string | null
    metadata: unknown
  } | null
  xenyEarned: number
}

export interface CharacterGachaStats {
  characterId: number
  characterName: string
  userName: string
  username: string
  jobClass: string
  jobLevel: string
  totalPulls: number
  totalWins: number
  totalSpent: number
  winRate: string
  lastGachaAt?: Date | null
}

export interface RewardReportSummary {
  totalTokensSpent: number
  totalGachaPulls: number
  totalXenyDistributed: number
}

export interface RewardReportData {
  summary: RewardReportSummary
  characterSummary: CharacterGachaStats[]
  gachaHistory: GachaHistoryWithDetails[]
  totalGachaHistory: number
}

export interface RewardFilters {
  characterId?: number
  search?: string
  startDate?: string
  endDate?: string
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year'
  page?: number
  limit?: number
}
