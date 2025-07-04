import { BaseService } from '../../../lib/services/server/baseService'
import { characterRepository } from '../repository'
import { CharacterFilters, UpdateCharacterWorkSettingsRequest, UpdateCharacterJobRequest, DeductXenyRequest } from '../types'

export class CharacterService extends BaseService {
  private static instance: CharacterService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!CharacterService.instance) {
      CharacterService.instance = new CharacterService()
    }
    return CharacterService.instance
  }

  async getAllCharacters(filters?: CharacterFilters) {
    return await characterRepository.getAllCharactersWithRelations(filters)
  }

  async getCharacterById(id: number) {
    return await characterRepository.getCharacterById(id)
  }

  async updateWorkSettings(
    id: number,
    data: UpdateCharacterWorkSettingsRequest,
  ) {
    // Validate time format if provided
    if (data.workStartTime && !this.isValidTimeFormat(data.workStartTime)) {
      throw new Error('รูปแบบเวลาเข้างานไม่ถูกต้อง (ต้องเป็น HH:mm)')
    }
    
    if (data.workEndTime && !this.isValidTimeFormat(data.workEndTime)) {
      throw new Error('รูปแบบเวลาออกงานไม่ถูกต้อง (ต้องเป็น HH:mm)')
    }

    // Validate salary if provided
    if (data.salary !== undefined && data.salary !== null && data.salary < 0) {
      throw new Error('เงินเดือนต้องมากกว่าหรือเท่ากับ 0')
    }

    return await characterRepository.updateWorkSettings(id, data)
  }

  async updateJob(
    id: number,
    data: UpdateCharacterJobRequest,
  ) {
    // Get character first to validate character level
    const character = await characterRepository.getCharacterById(id)
    if (!character) {
      throw new Error('ไม่พบข้อมูลบุคลากร')
    }

    // Get job level details to validate requirements
    const jobLevel = await characterRepository.getJobLevelById(data.jobLevelId)

    if (!jobLevel) {
      throw new Error('ไม่พบข้อมูลระดับอาชีพ')
    }

    // Validate if job level belongs to the selected job class
    if (jobLevel.jobClassId !== data.jobClassId) {
      throw new Error('ระดับอาชีพไม่ตรงกับอาชีพที่เลือก')
    }

    // Validate if character level meets job level requirements
    if (character.level < jobLevel.requiredCharacterLevel) {
      throw new Error(`ต้องมีระดับตัวละครอย่างน้อย ${jobLevel.requiredCharacterLevel} เพื่อใช้งานระดับอาชีพนี้`)
    }

    return await characterRepository.updateJob(id, data)
  }

  async deductXeny(
    characterId: number,
    data: DeductXenyRequest,
  ) {
    // Validate inputs
    if (data.amount <= 0) {
      throw new Error('จำนวน Xeny ที่จะหักต้องมากกว่า 0')
    }

    if (!data.description?.trim()) {
      throw new Error('กรุณาระบุเหตุผลในการหัก Xeny')
    }

    // Get character info
    const character = await characterRepository.getCharacterById(characterId)
    if (!character) {
      throw new Error('ไม่พบข้อมูลบุคลากร')
    }

    return await characterRepository.deductXeny(characterId, character.userId, data)
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/
    return timeRegex.test(time)
  }
}

export const characterService = CharacterService.getInstance() 