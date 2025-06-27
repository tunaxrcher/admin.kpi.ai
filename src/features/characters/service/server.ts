import { BaseService } from '../../../lib/services/server/baseService'
import { characterRepository } from '../repository'
import { CharacterFilters, UpdateCharacterWorkSettingsRequest } from '../types'

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

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/
    return timeRegex.test(time)
  }
}

export const characterService = CharacterService.getInstance() 