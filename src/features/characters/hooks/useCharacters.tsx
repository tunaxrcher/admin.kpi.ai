import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { characterService } from '../service/client'
import {
  CharacterFilters,
  UpdateCharacterWorkSettingsRequest,
  UpdateCharacterJobRequest,
  DeductXenyRequest,
} from '../types'
import toast from '../../../components/ui/toast'
import Notification from '../../../components/ui/Notification'

// Query keys
const QUERY_KEYS = {
  all: ['characters'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters?: CharacterFilters) =>
    [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...QUERY_KEYS.details(), id] as const,
}

// Fetch all characters
export const useCharacters = (filters?: CharacterFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => characterService.getAllCharacters(filters),
  })
}

// Fetch character by ID
export const useCharacter = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => characterService.getCharacterById(id),
    enabled: !!id,
  })
}

// Update character work settings
export const useUpdateCharacterWorkSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateCharacterWorkSettingsRequest
    }) => characterService.updateWorkSettings(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      queryClient.setQueryData(QUERY_KEYS.detail(variables.id), data)

      toast.push(
        <Notification title="สำเร็จ" type="success">
          อัพเดทการตั้งค่าการทำงานเรียบร้อยแล้ว
        </Notification>,
      )
    },
    onError: (error: Error) => {
      toast.push(
        <Notification title="เกิดข้อผิดพลาด" type="danger">
          {error.message || 'ไม่สามารถอัพเดทการตั้งค่าการทำงานได้'}
        </Notification>,
      )
    },
  })
}

// Update character job
export const useUpdateCharacterJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateCharacterJobRequest
    }) => characterService.updateJob(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      queryClient.setQueryData(QUERY_KEYS.detail(variables.id), data)

      toast.push(
        <Notification title="สำเร็จ" type="success">
          อัพเดทอาชีพเรียบร้อยแล้ว
        </Notification>,
      )
    },
    onError: (error: Error) => {
      toast.push(
        <Notification title="เกิดข้อผิดพลาด" type="danger">
          {error.message || 'ไม่สามารถอัพเดทอาชีพได้'}
        </Notification>,
      )
    },
  })
}

// Deduct Xeny
export const useDeductXeny = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DeductXenyRequest }) =>
      characterService.deductXeny(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })
      queryClient.setQueryData(QUERY_KEYS.detail(variables.id), data)

      toast.push(
        <Notification title="สำเร็จ" type="success">
          หัก Xeny เรียบร้อยแล้ว
        </Notification>,
      )
    },
    onError: (error: Error) => {
      toast.push(
        <Notification title="เกิดข้อผิดพลาด" type="danger">
          {error.message || 'ไม่สามารถหัก Xeny ได้'}
        </Notification>,
      )
    },
  })
}

// Delete single character
export const useDeleteCharacter = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => characterService.deleteCharacter(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })

      toast.push(
        <Notification title="สำเร็จ" type="success">
          ลบบุคลากรเรียบร้อยแล้ว
        </Notification>,
      )
    },
    onError: (error: Error) => {
      toast.push(
        <Notification title="เกิดข้อผิดพลาด" type="danger">
          {error.message || 'ไม่สามารถลบบุคลากรได้'}
        </Notification>,
      )
    },
  })
}

// Bulk delete characters
export const useBulkDeleteCharacters = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (characterIds: number[]) =>
      characterService.bulkDeleteCharacters(characterIds),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all })

      toast.push(
        <Notification title="สำเร็จ" type="success">
          {data.message || 'ลบบุคลากรเรียบร้อยแล้ว'}
        </Notification>,
      )
    },
    onError: (error: Error) => {
      toast.push(
        <Notification title="เกิดข้อผิดพลาด" type="danger">
          {error.message || 'ไม่สามารถลบบุคลากรได้'}
        </Notification>,
      )
    },
  })
}