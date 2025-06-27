import { Character, User, JobClass, JobLevel } from '@prisma/client'

export interface CharacterWithRelations extends Character {
  user: User
  jobClass: JobClass
  currentJobLevel: JobLevel
}

export interface UpdateCharacterWorkSettingsRequest {
  workStartTime?: string | null
  workEndTime?: string | null
  salary?: number | null
}

export interface CharacterFilters {
  jobClassId?: number
  search?: string
}

export interface CharacterListResponse {
  characters: CharacterWithRelations[]
  total: number
} 