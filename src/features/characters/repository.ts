import { BaseRepository } from '../../lib/repository/baseRepository'
import { CharacterFilters, UpdateCharacterWorkSettingsRequest } from './types'

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
    const where: Record<string, any> = {}
    
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
      },
      include: {
        user: true,
        jobClass: true,
        currentJobLevel: true,
      },
    })
  }
}

export const characterRepository = CharacterRepository.getInstance() 