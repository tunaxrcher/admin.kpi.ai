// src/features/jobs/types.ts
export interface JobClass {
  id: number
  name: string
  description?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
  levels: JobLevel[]
}

export interface JobLevel {
  id: number
  level: number
  requiredCharacterLevel: number
  title: string
  description?: string
  imageUrl?: string
  personaDescription?: string
  jobClassId: number
}

export interface CreateJobClassRequest {
  name: string
  description?: string
  imageUrl?: string
  levels: Omit<JobLevel, 'id' | 'jobClassId'>[]
}

export interface UpdateJobClassRequest {
  name?: string
  description?: string
  imageUrl?: string
}

export interface GenerateLevelsRequest {
  jobName: string
}

export interface GeneratedLevel {
  level: number
  requiredCharacterLevel: number
  title: string
  description?: string
  personaDescription?: string
}
