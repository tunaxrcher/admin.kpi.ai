import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { characterService } from '../service/client'
import { CharacterFilters, UpdateCharacterWorkSettingsRequest } from '../types'
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
        </Notification>
      )
    },
    onError: (error: Error) => {
      toast.push(
        <Notification title="เกิดข้อผิดพลาด" type="danger">
          {error.message || 'ไม่สามารถอัพเดทการตั้งค่าการทำงานได้'}
        </Notification>
      )
    },
  })
} 