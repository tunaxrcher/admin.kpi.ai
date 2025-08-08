import { Prisma } from '@prisma/client'
import { BaseRepository } from '../../lib/repository/baseRepository'
import {
  CharacterFilters,
  UpdateCharacterWorkSettingsRequest,
  UpdateCharacterJobRequest,
  DeductXenyRequest,
} from './types'

export class CharacterRepository extends BaseRepository<any> {
  private static instance: CharacterRepository

  public static getInstance() {
    if (!CharacterRepository.instance) {
      CharacterRepository.instance = new CharacterRepository()
    }
    return CharacterRepository.instance
  }

  async findAll() {
    return this.prisma.character.findMany()
  }

  async findById(id: number) {
    return this.prisma.character.findUnique({
      where: { id },
    })
  }

  async create(data: any) {
    return this.prisma.character.create({
      data,
    })
  }

  async update(id: number, data: any) {
    return this.prisma.character.update({
      where: { id },
      data,
    })
  }

  async delete(id: number) {
    return this.prisma.character.delete({
      where: { id },
    })
  }

  async getAllCharactersWithRelations(filters?: CharacterFilters) {
    const where: any = {}

    if (filters?.jobClassId) {
      where.jobClassId = filters.jobClassId
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { user: { name: { contains: filters.search } } },
        { user: { email: { contains: filters.search } } },
      ]
    }

    const [characters, total] = await Promise.all([
      this.prisma.character.findMany({
        where,
        include: {
          user: true,
          jobClass: true,
          currentJobLevel: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.character.count({ where }),
    ])

    return { characters, total }
  }

  async getCharacterById(id: number) {
    return await this.prisma.character.findUnique({
      where: { id },
      include: {
        user: true,
        jobClass: true,
        currentJobLevel: true,
      },
    })
  }

  async updateWorkSettings(
    id: number,
    data: UpdateCharacterWorkSettingsRequest,
  ) {
    return await this.prisma.character.update({
      where: { id },
      data: {
        workStartTime: data.workStartTime,
        workEndTime: data.workEndTime,
        salary: data.salary,
        workDays: data.workDays ?? Prisma.JsonNull, //
      },
      include: {
        user: true,
        jobClass: true,
        currentJobLevel: true,
      },
    })
  }

  async getJobLevelById(id: number) {
    return await this.prisma.jobLevel.findUnique({
      where: { id },
      include: { jobClass: true },
    })
  }

  async updateJob(id: number, data: UpdateCharacterJobRequest) {
    return await this.prisma.character.update({
      where: { id },
      data: {
        jobClassId: data.jobClassId,
        jobLevelId: data.jobLevelId,
      },
      include: {
        user: true,
        jobClass: true,
        currentJobLevel: true,
      },
    })
  }

  async deductXeny(
    characterId: number,
    userId: number,
    data: DeductXenyRequest,
  ) {
    // Use raw SQL to avoid type issues
    const result = await this.prisma.$executeRaw`
      UPDATE UserXeny 
      SET currentXeny = currentXeny - ${data.amount},
          totalSpentXeny = totalSpentXeny + ${data.amount},
          updatedAt = NOW()
      WHERE userId = ${userId} AND currentXeny >= ${data.amount}
    `

    if (result === 0) {
      // Check if user exists or has insufficient Xeny
      const userXeny = (await this.prisma.$queryRaw`
        SELECT currentXeny FROM UserXeny WHERE userId = ${userId}
      `) as any[]

      if (userXeny.length === 0) {
        // Create UserXeny if not exists
        await this.prisma.$executeRaw`
          INSERT INTO UserXeny (userId, currentXeny, totalEarnedXeny, totalSpentXeny, createdAt, updatedAt)
          VALUES (${userId}, 0, 0, 0, NOW(), NOW())
        `
        throw new Error('Xeny ไม่เพียงพอ (มีอยู่ 0 Xeny)')
      } else {
        throw new Error(
          `Xeny ไม่เพียงพอ (มีอยู่ ${userXeny[0].currentXeny} Xeny)`,
        )
      }
    }

    // Create transaction record
    await this.prisma.$executeRaw`
      INSERT INTO XenyTransaction (userId, characterId, amount, type, description, balanceBefore, balanceAfter, createdAt)
      SELECT ${userId}, ${characterId}, ${-data.amount}, 'admin_deduct', ${data.description}, 
             currentXeny + ${data.amount}, currentXeny, NOW()
      FROM UserXeny WHERE userId = ${userId}
    `

    // Return updated character
    return await this.getCharacterById(characterId)
  }
}

export const characterRepository = CharacterRepository.getInstance()
