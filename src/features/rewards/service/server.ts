import { BaseService } from '../../../lib/services/server/baseService'
import { RewardFilters, RewardReportData } from '../types'
import { rewardRepository } from '../repository'

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

  async getRewardReportData(filters?: RewardFilters): Promise<RewardReportData> {
    // Validate date format if provided
    if (filters?.startDate && !this.isValidDateFormat(filters.startDate)) {
      throw new Error('รูปแบบวันที่เริ่มต้นไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)')
    }
    
    if (filters?.endDate && !this.isValidDateFormat(filters.endDate)) {
      throw new Error('รูปแบบวันที่สิ้นสุดไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)')
    }

    // Validate date range
    if (filters?.startDate && filters?.endDate) {
      const startDate = new Date(filters.startDate)
      const endDate = new Date(filters.endDate)
      
      if (startDate > endDate) {
        throw new Error('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด')
      }
    }

    // Validate pagination
    if (filters?.page && filters.page < 1) {
      throw new Error('หมายเลขหน้าต้องมากกว่าหรือเท่ากับ 1')
    }

    if (filters?.limit && (filters.limit < 1 || filters.limit > 100)) {
      throw new Error('จำนวนรายการต่อหน้าต้องอยู่ระหว่าง 1-100')
    }

    return await rewardRepository.getRewardReportData(filters)
  }

  private isValidDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) return false
    
    const dateObj = new Date(date)
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
  }
}

export const rewardService = RewardService.getInstance() 