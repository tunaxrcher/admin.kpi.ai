// src/features/jobs/service/client.ts
import { BaseService } from '../../../lib/services/client/baseService'
import {
  CreateJobClassRequest,
  UpdateJobClassRequest,
  GenerateLevelsRequest,
} from '../types'

export class JobClassService extends BaseService {
  private static instance: JobClassService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!JobClassService.instance) {
      JobClassService.instance = new JobClassService()
    }

    return JobClassService.instance
  }

  async getAllJobClasses() {
    const response = await fetch('/api/jobs')
    if (!response.ok) throw new Error('Failed to fetch job classes')
    return response.json()
  }

  async getJobClassById(id: number) {
    const response = await fetch(`/api/jobs/${id}`)
    if (!response.ok) throw new Error('Failed to fetch job class')
    return response.json()
  }

  async createJobClass(data: CreateJobClassRequest & { imageFile?: File }) {
    const formData = new FormData()

    // สร้าง object สำหรับข้อมูลที่ไม่ใช่ไฟล์
    const jobData = {
      name: data.name,
      description: data.description,
      levels: data.levels,
    }

    formData.append('data', JSON.stringify(jobData))

    if (data.imageFile) {
      formData.append('imageFile', data.imageFile)
    }

    const response = await fetch('/api/jobs', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create job class')
    }
    return response.json()
  }

  async updateJobClass(
    id: number,
    data: UpdateJobClassRequest & { imageFile?: File },
  ) {
    const formData = new FormData()

    // สร้าง object สำหรับข้อมูลที่ไม่ใช่ไฟล์
    const jobData = {
      name: data.name,
      description: data.description,
    }

    formData.append('data', JSON.stringify(jobData))

    if (data.imageFile) {
      formData.append('imageFile', data.imageFile)
    }

    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update job class')
    }
    return response.json()
  }

  async updateJobLevel(levelId: number, data: any) {
    const response = await fetch(`/api/jobs/levels/${levelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update job level')
    }
    return response.json()
  }

  async deleteJobClass(id: number) {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete job class')
    }
    return response.json()
  }

  async generateJobLevels(data: GenerateLevelsRequest) {
    const response = await fetch('/api/jobs/generate-levels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to generate job levels')
    }
    return response.json()
  }
}
export const jobClassService = JobClassService.getInstance()

export class JobLevelService extends BaseService {
  private static instance: JobLevelService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!JobLevelService.instance) {
      JobLevelService.instance = new JobLevelService()
    }

    return JobLevelService.instance
  }

  async getAllJobClasses() {
    const response = await fetch('/api/jobs')
    if (!response.ok) throw new Error('Failed to fetch job classes')
    return response.json()
  }

  async getJobClassById(id: number) {
    const response = await fetch(`/api/jobs/${id}`)
    if (!response.ok) throw new Error('Failed to fetch job class')
    return response.json()
  }

  async createJobClass(data: CreateJobClassRequest & { imageFile?: File }) {
    const formData = new FormData()

    // สร้าง object สำหรับข้อมูลที่ไม่ใช่ไฟล์
    const jobData = {
      name: data.name,
      description: data.description,
      levels: data.levels,
    }

    formData.append('data', JSON.stringify(jobData))

    if (data.imageFile) {
      formData.append('imageFile', data.imageFile)
    }

    const response = await fetch('/api/jobs', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create job class')
    }
    return response.json()
  }

  async updateJobClass(
    id: number,
    data: UpdateJobClassRequest & { imageFile?: File },
  ) {
    const formData = new FormData()

    // สร้าง object สำหรับข้อมูลที่ไม่ใช่ไฟล์
    const jobData = {
      name: data.name,
      description: data.description,
    }

    formData.append('data', JSON.stringify(jobData))

    if (data.imageFile) {
      formData.append('imageFile', data.imageFile)
    }

    const response = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update job class')
    }
    return response.json()
  }

  async updateJobLevel(levelId: number, data: any) {
    const response = await fetch(`/api/jobs/levels/${levelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update job level')
    }
    return response.json()
  }

  async deleteJobClass(id: number) {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete job class')
    }
    return response.json()
  }

  async generateJobLevels(data: GenerateLevelsRequest) {
    const response = await fetch('/api/jobs/generate-levels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to generate job levels')
    }
    return response.json()
  }
}

export const jobLevelService = JobLevelService.getInstance()
