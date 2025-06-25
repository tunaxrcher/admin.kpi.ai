// src/features/jobs/components/EditJobModal.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Loader2, Upload } from 'lucide-react'
import { useUpdateJobClass, useUpdateJobLevel } from '../hooks/api'
import { JobClass, JobLevel } from '../types'
import toast from 'react-hot-toast'

const jobClassSchema = z.object({
  name: z.string().min(1, 'กรุณาใส่ชื่ออาชีพ').max(100, 'ชื่ออาชีพยาวเกินไป'),
  description: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
})

interface EditJobModalProps {
  isOpen: boolean
  onClose: () => void
  jobClass: JobClass | null
}

export default function EditJobModal({
  isOpen,
  onClose,
  jobClass,
}: EditJobModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editingLevels, setEditingLevels] = useState<{
    [key: number]: boolean
  }>({})
  const [levelData, setLevelData] = useState<{ [key: number]: any }>({})

  const updateJobMutation = useUpdateJobClass()
  const updateLevelMutation = useUpdateJobLevel()

  const jobForm = useForm<z.infer<typeof jobClassSchema>>({
    resolver: zodResolver(jobClassSchema),
    defaultValues: {
      name: '',
      description: '',
      imageFile: undefined,
    },
  })

  // Initialize level data when jobClass changes
  useEffect(() => {
    if (jobClass) {
      jobForm.reset({
        name: jobClass.name,
        description: jobClass.description || '',
        imageFile: undefined,
      })
      setImagePreview(jobClass.imageUrl || null)

      // Initialize level data
      const initialLevelData: { [key: number]: any } = {}
      jobClass.levels.forEach((level) => {
        initialLevelData[level.id] = {
          title: level.title,
          description: level.description || '',
          personaDescription: level.personaDescription || '',
        }
      })
      setLevelData(initialLevelData)
    }
  }, [jobClass, jobForm])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP)')
      e.target.value = ''
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
      e.target.value = ''
      return
    }

    jobForm.setValue('imageFile', file)

    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleJobSubmit = async (data: {
    name: string
    description?: string
    imageFile?: File
  }) => {
    if (!jobClass) return

    try {
      await updateJobMutation.mutateAsync({
        id: jobClass.id,
        data: {
          name: data.name,
          description: data.description,
          imageFile: data.imageFile,
        },
      })

      toast.success('อัพเดทข้อมูลอาชีพเรียบร้อยแล้ว')
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอัพเดท')
    }
  }

  const handleLevelInputChange = (
    levelId: number,
    field: string,
    value: string,
  ) => {
    setLevelData((prev) => ({
      ...prev,
      [levelId]: {
        ...prev[levelId],
        [field]: value,
      },
    }))
  }

  const handleLevelSubmit = async (levelId: number) => {
    try {
      const data = levelData[levelId]
      if (!data.title.trim()) {
        toast.error('กรุณาใส่ชื่อตำแหน่ง')
        return
      }

      await updateLevelMutation.mutateAsync({ levelId, data })
      setEditingLevels((prev) => ({ ...prev, [levelId]: false }))
      toast.success('อัพเดท level เรียบร้อยแล้ว')
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอัพเดท level')
    }
  }

  const handleClose = () => {
    setImagePreview(null)
    setEditingLevels({})
    setLevelData({})
    jobForm.reset()
    onClose()
  }

  if (!isOpen || !jobClass) return null

  const isLoading = updateJobMutation.isPending || updateLevelMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">แก้ไขอาชีพ: {jobClass.name}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-80px)]">
          {/* Section 1: Job Class Info */}
          <div className="w-1/2 p-6 border-r overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">ข้อมูลอาชีพหลัก</h3>

            <form
              onSubmit={jobForm.handleSubmit(handleJobSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่ออาชีพ
                </label>
                <input
                  {...jobForm.register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {jobForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {jobForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  {...jobForm.register('description')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพอาชีพ
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Job Class"
                        className="w-24 h-24 object-cover rounded-lg mx-auto"
                      />
                      <div className="space-x-2">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`inline-block px-3 py-1 rounded-md cursor-pointer text-sm ${
                            isLoading
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          เปลี่ยนรูป
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null)
                            jobForm.setValue('imageFile', undefined)
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                          disabled={isLoading}
                        >
                          ลบรูป
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`inline-block px-3 py-1 rounded-md cursor-pointer text-sm ${
                          isLoading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        เลือกรูป
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                <span>บันทึกข้อมูลอาชีพ</span>
              </button>
            </form>
          </div>

          {/* Section 2: Level Tree */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Level Tree</h3>

            <div className="space-y-4">
              {jobClass.levels.map((level) => (
                <div
                  key={level.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">
                      Level {level.level} (Character Level{' '}
                      {level.requiredCharacterLevel})
                    </h4>
                    <button
                      onClick={() =>
                        setEditingLevels((prev) => ({
                          ...prev,
                          [level.id]: !prev[level.id],
                        }))
                      }
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      disabled={isLoading}
                    >
                      {editingLevels[level.id] ? 'ยกเลิก' : 'แก้ไข'}
                    </button>
                  </div>

                  {editingLevels[level.id] ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ชื่อตำแหน่ง
                        </label>
                        <input
                          type="text"
                          value={levelData[level.id]?.title || ''}
                          onChange={(e) =>
                            handleLevelInputChange(
                              level.id,
                              'title',
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          คำอธิบาย
                        </label>
                        <textarea
                          value={levelData[level.id]?.description || ''}
                          onChange={(e) =>
                            handleLevelInputChange(
                              level.id,
                              'description',
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Persona Description
                        </label>
                        <textarea
                          value={levelData[level.id]?.personaDescription || ''}
                          onChange={(e) =>
                            handleLevelInputChange(
                              level.id,
                              'personaDescription',
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          disabled={isLoading}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLevelSubmit(level.id)}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                      >
                        {isLoading && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        <Save className="w-4 h-4" />
                        <span>บันทึก</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">ตำแหน่ง: </span>
                        <span>{level.title}</span>
                      </div>
                      {level.description && (
                        <div>
                          <span className="font-medium">คำอธิบาย: </span>
                          <span>{level.description}</span>
                        </div>
                      )}
                      {level.personaDescription && (
                        <div>
                          <span className="font-medium">Persona: </span>
                          <span className="text-gray-600">
                            {level.personaDescription}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
