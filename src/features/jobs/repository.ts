import { JobClass, JobLevel } from '@prisma/client'
import { CreateJobClassRequest, UpdateJobClassRequest } from './types'
import { BaseRepository } from '../../lib/repository/baseRepository'

export class JobClassRepository extends BaseRepository<JobClass> {
  private static instance: JobClassRepository

  public static getInstance() {
    if (!JobClassRepository.instance) {
      JobClassRepository.instance = new JobClassRepository()
    }
    return JobClassRepository.instance
  }

  async findAll() {
    return this.prisma.jobClass.findMany()
  }

  async findById(id: number) {
    return this.prisma.jobClass.findUnique({
      where: { id },
    })
  }

  async create(data: Omit<JobClass, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.jobClass.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<JobClass, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    return this.prisma.jobClass.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.jobClass.delete({
      where: { id },
    })
  }

  async getAllJobClasses() {
    return await this.prisma.jobClass.findMany({
      include: {
        levels: {
          orderBy: { level: 'asc' },
        },
        _count: {
          select: { characters: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getJobClassById(id: number) {
    return await this.prisma.jobClass.findUnique({
      where: { id },
      include: {
        levels: {
          orderBy: { level: 'asc' },
        },
      },
    })
  }

  async checkJobNameExists(name: string, excludeId?: number) {
    const where = excludeId ? { name, NOT: { id: excludeId } } : { name }

    const existing = await this.prisma.jobClass.findFirst({ where })
    return !!existing
  }

  async createJobClass(data: CreateJobClassRequest) {
    return await this.prisma.jobClass.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        levels: {
          create: data.levels,
        },
      },
      include: {
        levels: {
          orderBy: { level: 'asc' },
        },
      },
    })
  }

  async updateJobClass(id: number, data: UpdateJobClassRequest) {
    return await this.prisma.jobClass.update({
      where: { id },
      data,
      include: {
        levels: {
          orderBy: { level: 'asc' },
        },
      },
    })
  }
  async deleteJobClass(id: number) {
    // Check if any characters are using this job class
    const charactersCount = await this.prisma.character.count({
      where: { jobClassId: id },
    })

    if (charactersCount > 0) {
      throw new Error('ไม่สามารถลบอาชีพที่มีตัวละครใช้งานอยู่ได้')
    }

    return await this.prisma.jobClass.delete({
      where: { id },
    })
  }
}
export const jobClassRepository = JobClassRepository.getInstance()

export class JobLevelRepository extends BaseRepository<JobLevel> {
  private static instance: JobLevelRepository

  public static getInstance() {
    if (!JobLevelRepository.instance) {
      JobLevelRepository.instance = new JobLevelRepository()
    }
    return JobLevelRepository.instance
  }

  async findAll() {
    return this.prisma.jobLevel.findMany()
  }

  async findById(id: number) {
    return this.prisma.jobLevel.findUnique({
      where: { id },
    })
  }

  async create(data: Omit<JobLevel, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.jobLevel.create({
      data,
    })
  }

  async update(
    id: number,
    data: Partial<Omit<JobLevel, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    return this.prisma.jobLevel.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.jobLevel.delete({
      where: { id },
    })
  }

  async updateJobLevel(levelId: number, data: Partial<JobLevel>) {
    return await this.prisma.jobLevel.update({
      where: { id: levelId },
      data,
    })
  }
}
export const jobLevelRepository = JobLevelRepository.getInstance()
