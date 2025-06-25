// src/features/jobs/hooks/api.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreateJobClassRequest,
  UpdateJobClassRequest,
  GenerateLevelsRequest,
} from '../types'
import { jobClassService, jobLevelService } from '../service/client'

export const useJobClasses = () => {
  return useQuery({
    queryKey: ['job-classes'],
    queryFn: () => jobClassService.getAllJobClasses(),
  })
}

export const useJobClass = (id: number) => {
  return useQuery({
    queryKey: ['job-class', id],
    queryFn: () => jobClassService.getJobClassById(id),
    enabled: !!id,
  })
}

export const useCreateJobClass = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateJobClassRequest & { imageFile?: File }) =>
      jobClassService.createJobClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-classes'] })
    },
  })
}

export const useUpdateJobClass = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateJobClassRequest & { imageFile?: File }
    }) => jobClassService.updateJobClass(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['job-classes'] })
      queryClient.invalidateQueries({ queryKey: ['job-class', id] })
    },
  })
}

export const useUpdateJobLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ levelId, data }: { levelId: number; data: any }) =>
      jobLevelService.updateJobLevel(levelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-classes'] })
    },
  })
}

export const useDeleteJobClass = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => jobLevelService.deleteJobClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-classes'] })
    },
  })
}

export const useGenerateJobLevels = () => {
  return useMutation({
    mutationFn: (data: GenerateLevelsRequest) =>
      jobLevelService.generateJobLevels(data),
  })
}
