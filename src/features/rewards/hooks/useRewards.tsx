'use client'
import { useQuery } from '@tanstack/react-query'
import { rewardService } from '../service/client'
import { RewardFilters } from '../types'

// Query keys
const QUERY_KEYS = {
  all: ['rewards'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters?: RewardFilters) =>
    [...QUERY_KEYS.lists(), filters] as const,
}

// Fetch reward report data
export const useRewardReportData = (filters?: RewardFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => rewardService.getRewardReportData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
} 