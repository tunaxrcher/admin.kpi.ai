import { BaseService } from '../../../lib/services/client/baseService'
import {
  CharacterFilters,
  UpdateCharacterWorkSettingsRequest,
  UpdateCharacterJobRequest,
  DeductXenyRequest,
} from '../types'

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
    const params = new URLSearchParams()

    if (filters?.jobClassId) {
      params.append('jobClassId', filters.jobClassId.toString())
    }

    if (filters?.search) {
      params.append('search', filters.search)
    }

    const queryString = params.toString()
    const url = `/api/characters${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch characters')
    return response.json()
  }

  async getCharacterById(id: number) {
    const response = await fetch(`/api/characters/${id}`)
    if (!response.ok) throw new Error('Failed to fetch character')
    return response.json()
  }

  async updateWorkSettings(
    id: number,
    data: UpdateCharacterWorkSettingsRequest,
  ) {
    const response = await fetch(`/api/characters/${id}/work-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update work settings')
    }

    return response.json()
  }

  async updateJob(id: number, data: UpdateCharacterJobRequest) {
    const response = await fetch(`/api/characters/${id}/job`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update character job')
    }

    return response.json()
  }

  async deductXeny(id: number, data: DeductXenyRequest) {
    const response = await fetch(`/api/characters/${id}/deduct-xeny`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to deduct Xeny')
    }

    return response.json()
  }

  async deleteCharacter(id: number) {
    const response = await fetch(`/api/characters/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete character')
    }

    return response.json()
  }

  async bulkDeleteCharacters(characterIds: number[]) {
    const response = await fetch('/api/characters/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterIds }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to bulk delete characters')
    }

    return response.json()
  }
}

export const characterService = CharacterService.getInstance()
