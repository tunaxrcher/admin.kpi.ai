import { Character, User, JobClass, JobLevel } from '@prisma/client'

export interface CharacterWithRelations extends Character {
  user: User & {
    userXeny?: {
      id: number
      userId: number
      currentXeny: number
      totalEarnedXeny: number
      totalSpentXeny: number
      createdAt: Date
      updatedAt: Date
    } | null
  }
  jobClass: JobClass
  currentJobLevel: JobLevel
}

export interface UpdateCharacterWorkSettingsRequest {
  workStartTime?: string | null
  workEndTime?: string | null
  salary?: number | null
}

export interface UpdateCharacterJobRequest {
  jobClassId: number
  jobLevelId: number
}

export interface DeductXenyRequest {
  amount: number
  description: string
}

export interface CharacterFilters {
  jobClassId?: number
  search?: string
}

export interface CharacterListResponse {
  characters: CharacterWithRelations[]
  total: number
}
