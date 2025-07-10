import { BaseService } from '../../../lib/services/client/baseService'
import { RewardFilters, RewardReportData } from '../types'

export class RewardService extends BaseService {
  private static instance: RewardService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!RewardService.instance) {
      RewardService.instance = new RewardService()
    }
    return RewardService.instance
  }

  async getRewardReportData(
    filters?: RewardFilters,
  ): Promise<RewardReportData> {
    const params = new URLSearchParams()

    if (filters?.characterId) {
      params.append('characterId', filters.characterId.toString())
    }

    if (filters?.search) {
      params.append('search', filters.search)
    }

    if (filters?.startDate) {
      params.append('startDate', filters.startDate)
    }

    if (filters?.endDate) {
      params.append('endDate', filters.endDate)
    }

    if (filters?.dateRange) {
      params.append('dateRange', filters.dateRange)
    }

    if (filters?.page) {
      params.append('page', filters.page.toString())
    }

    if (filters?.limit) {
      params.append('limit', filters.limit.toString())
    }

    const queryString = params.toString()
    const url = `/api/reports/rewards${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch reward report data')
    }

    const result = await response.json()
    return result.data
  }
}

export const rewardService = RewardService.getInstance()
