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
          user: {
            include: {
              userXeny: true,
            },
          },
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
        user: {
          include: {
            userXeny: true,
          },
        },
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
        user: {
          include: {
            userXeny: true,
          },
        },
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
        user: {
          include: {
            userXeny: true,
          },
        },
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

  async getCharactersByIds(ids: number[]) {
    return await this.prisma.character.findMany({
      where: { id: { in: ids } },
      include: {
        user: {
          include: {
            userXeny: true,
          },
        },
        jobClass: true,
        currentJobLevel: true,
      },
    })
  }

  async deleteCharacter(characterId: number, userId: number) {
    // Use transaction to ensure data consistency
    return await this.prisma.$transaction(async (tx) => {
      // Get character info before deletion
      const character = await tx.character.findUnique({
        where: { id: characterId },
        include: {
          user: {
            select: { id: true, email: true, name: true }
          }
        }
      })

      if (!character) {
        throw new Error('ไม่พบข้อมูลบุคลากร')
      }

      // Delete related records that don't have cascade delete
      // Order is important due to foreign key constraints
      
      // 1. Delete QuestSubmission records first (references AssignedQuest)
      await tx.questSubmission.deleteMany({
        where: { characterId }
      })

      // 2. Delete AssignedQuest records (now safe to delete)
      await tx.assignedQuest.deleteMany({
        where: { characterId }
      })

      // 3. Delete personal Quest records
      await tx.quest.deleteMany({
        where: { characterId }
      })

      // 4. Delete LevelHistory records
      await tx.levelHistory.deleteMany({
        where: { characterId }
      })

      // 5. Delete QuestToken records (has character reference without cascade)
      await tx.questToken.deleteMany({
        where: { characterId }
      })

      // 6. Delete TokenPurchase records (has character reference without cascade)
      await tx.tokenPurchase.deleteMany({
        where: { characterId }
      })

      // 7. Delete RewardPurchase records
      await tx.rewardPurchase.deleteMany({
        where: { characterId }
      })

      // 8. Delete GachaHistory records
      await tx.gachaHistory.deleteMany({
        where: { characterId }
      })

      // 9. Delete UserRewardStats
      await tx.userRewardStats.deleteMany({
        where: { characterId }
      })

      // 10. Delete CheckinCheckout records
      await tx.checkinCheckout.deleteMany({
        where: { characterId }
      })

      // 11. Delete MonthlyEvaluation records
      await tx.monthlyEvaluation.deleteMany({
        where: { characterId }
      })

      // 12. Delete CharacterAchievement records
      await tx.characterAchievement.deleteMany({
        where: { characterId }
      })

      // 13. Delete Ranking records
      await tx.ranking.deleteMany({
        where: { characterId }
      })

      // Now delete the user (this will cascade delete the character and other records with cascade delete)
      await tx.user.delete({
        where: { id: userId }
      })

      return {
        deletedCharacter: {
          id: character.id,
          name: character.name,
          userId: character.userId,
        },
        deletedUser: character.user,
      }
    })
  }

  async bulkDeleteCharacters(characters: any[]) {
    const userIds = characters.map(c => c.userId)
    const characterIds = characters.map(c => c.id)
    
    // Use transaction to ensure data consistency
    return await this.prisma.$transaction(async (tx) => {
      // Delete related records that don't have cascade delete for all characters
      // Order is important due to foreign key constraints
      
      // 1. Delete QuestSubmission records first (references AssignedQuest)
      await tx.questSubmission.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 2. Delete AssignedQuest records (now safe to delete)
      await tx.assignedQuest.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 3. Delete personal Quest records
      await tx.quest.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 4. Delete LevelHistory records
      await tx.levelHistory.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 5. Delete QuestToken records
      await tx.questToken.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 6. Delete TokenPurchase records
      await tx.tokenPurchase.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 7. Delete RewardPurchase records
      await tx.rewardPurchase.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 8. Delete GachaHistory records
      await tx.gachaHistory.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 9. Delete UserRewardStats
      await tx.userRewardStats.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 10. Delete CheckinCheckout records
      await tx.checkinCheckout.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 11. Delete MonthlyEvaluation records
      await tx.monthlyEvaluation.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 12. Delete CharacterAchievement records
      await tx.characterAchievement.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // 13. Delete Ranking records
      await tx.ranking.deleteMany({
        where: { characterId: { in: characterIds } }
      })

      // Now delete all users (this will cascade delete the characters and other records with cascade delete)
      const deletedUsers = await tx.user.deleteMany({
        where: { id: { in: userIds } },
      })

      return {
        deletedCount: deletedUsers.count,
        deletedCharacters: characters.map(c => ({
          id: c.id,
          name: c.name,
          userId: c.userId,
          userEmail: c.user.email,
        })),
      }
    })
  }
}

export const characterRepository = CharacterRepository.getInstance()
