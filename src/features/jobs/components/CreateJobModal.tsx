// src/features/jobs/components/CreateJobModal.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, ChevronLeft, ChevronRight, Loader2, Upload } from 'lucide-react'
import { useCreateJobClass, useGenerateJobLevels } from '../hooks/api'
import { GeneratedLevel } from '../types'
import toast from 'react-hot-toast'

const step1Schema = z.object({
  name: z.string().min(1, 'กรุณาใส่ชื่ออาชีพ').max(100, 'ชื่ออาชีพยาวเกินไป'),
})

const step2Schema = z.object({
  levels: z.array(
    z.object({
      level: z.number(),
      requiredCharacterLevel: z.number(),
      title: z.string().min(1, 'กรุณาใส่ชื่อตำแหน่ง'),
      description: z.string().optional(),
      personaDescription: z.string().optional(),
    }),
  ),
})

const step3Schema = z.object({
  description: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
})

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateJobModal({
  isOpen,
  onClose,
}: CreateJobModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [jobName, setJobName] = useState('')
  const [generatedLevels, setGeneratedLevels] = useState<GeneratedLevel[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const createJobMutation = useCreateJobClass()
  const generateLevelsMutation = useGenerateJobLevels()

  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '' },
  })

  const step2Form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: { levels: [] },
  })

  const step3Form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: { description: '', imageFile: undefined },
  })

  const handleStep1Submit = async (data: { name: string }) => {
    try {
      setJobName(data.name)

      const result = await generateLevelsMutation.mutateAsync({
        jobName: data.name,
      })
      const levels = Array.isArray(result) ? result : result.levels || []

      console.log('Generated levels:', levels)

      setGeneratedLevels(levels)
      step2Form.setValue('levels', levels)
      setCurrentStep(2)
    } catch (error: any) {
      console.error('Error generating levels:', error)
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสร้าง level tree')

      const defaultLevels = getDefaultLevels(data.name)
      setGeneratedLevels(defaultLevels)
      step2Form.setValue('levels', defaultLevels)
      setCurrentStep(2)
    }
  }

  const getDefaultLevels = (jobName: string): GeneratedLevel[] => {
    return [
      {
        level: 1,
        requiredCharacterLevel: 1,
        title: `${jobName}ฝึกหัด`,
        description: `เริ่มต้นเรียนรู้พื้นฐานของ${jobName}`,
        personaDescription: 'Beginner outfit with basic tools, eager to learn',
      },
      {
        level: 10,
        requiredCharacterLevel: 10,
        title: `${jobName}จูเนียร์`,
        description: `มีความรู้พื้นฐานและสามารถทำงานง่ายๆ ได้`,
        personaDescription: 'Professional attire with standard equipment',
      },
      {
        level: 35,
        requiredCharacterLevel: 35,
        title: `${jobName}มืออาชีพ`,
        description: `มีประสบการณ์และทักษะที่เชี่ยวชาญ`,
        personaDescription: 'Expert appearance with advanced tools',
      },
      {
        level: 60,
        requiredCharacterLevel: 60,
        title: `หัวหน้าทีม${jobName}`,
        description: `ควบคุมทีมและวางแผนการทำงาน`,
        personaDescription: 'Leadership attire with management tools',
      },
      {
        level: 80,
        requiredCharacterLevel: 80,
        title: `ผู้อำนวยการ${jobName}`,
        description: `กำหนดนโยบายและทิศทางขององค์กร`,
        personaDescription: 'Executive suit with high-tech equipment',
      },
      {
        level: 99,
        requiredCharacterLevel: 99,
        title: `ปรมาจารย์${jobName}`,
        description: `ผู้เชี่ยวชาญระดับสูงสุดที่เปลี่ยนแปลงวงการ`,
        personaDescription:
          'Legendary master with mystical aura and ultimate tools',
      },
    ]
  }

  const handleStep2Submit = (data: { levels: GeneratedLevel[] }) => {
    const levels = Array.isArray(data.levels) ? data.levels : []
    setGeneratedLevels(levels)
    setCurrentStep(3)
  }

  const handleStep3Submit = async (data: {
    description?: string
    imageFile?: File
  }) => {
    try {
      const levelsToSubmit = Array.isArray(generatedLevels)
        ? generatedLevels
        : []

      await createJobMutation.mutateAsync({
        name: jobName,
        description: data.description,
        imageFile: data.imageFile,
        levels: levelsToSubmit.map((level) => ({
          level: level.level,
          requiredCharacterLevel: level.requiredCharacterLevel,
          title: level.title,
          description: level.description,
          personaDescription: level.personaDescription,
        })),
      })

      toast.success('สร้างอาชีพเรียบร้อยแล้ว')
      handleClose()
    } catch (error: any) {
      console.error('Error creating job:', error)
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสร้างอาชีพ')
    }
  }

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

    step3Form.setValue('imageFile', file)

    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleClose = () => {
    setCurrentStep(1)
    setJobName('')
    setGeneratedLevels([])
    setImagePreview(null)
    step1Form.reset()
    step2Form.reset()
    step3Form.reset()
    onClose()
  }

  if (!isOpen) return null

  const isLoading =
    createJobMutation.isPending || generateLevelsMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">สร้างอาชีพใหม่</h2>
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-blue-500 text-white'
                      : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Step 1: Job Name */}
          {currentStep === 1 && (
            <form
              onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium mb-4">
                  ขั้นตอนที่ 1: ชื่ออาชีพ
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่ออาชีพ
                  </label>
                  <input
                    {...step1Form.register('name')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น นักการตลาด, โปรแกรมเมอร์, ดีไซน์เนอร์"
                  />
                  {step1Form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {step1Form.formState.errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={generateLevelsMutation.isPending}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {generateLevelsMutation.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>สร้าง Level Tree</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Level Tree */}
          {currentStep === 2 && (
            <form
              onSubmit={step2Form.handleSubmit(handleStep2Submit)}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium mb-4">
                  ขั้นตอนที่ 2: ตรวจสอบและแก้ไข Level Tree
                </h3>
                <p className="text-gray-600 mb-4">
                  ระบบได้สร้าง level tree สำหรับอาชีพ "{jobName}" ให้แล้ว
                  คุณสามารถแก้ไขได้
                </p>

                <div className="space-y-4">
                  {Array.isArray(generatedLevels) &&
                  generatedLevels.length > 0 ? (
                    generatedLevels.map((level, index) => (
                      <div
                        key={level.level}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Level {level.level} (Character Level{' '}
                              {level.requiredCharacterLevel})
                            </label>
                            <input
                              {...step2Form.register(`levels.${index}.title`)}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="ชื่อตำแหน่ง"
                              defaultValue={level.title}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              คำอธิบาย
                            </label>
                            <input
                              {...step2Form.register(
                                `levels.${index}.description`,
                              )}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="คำอธิบายหน้าที่และความสามารถ"
                              defaultValue={level.description || ''}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Persona Description (สำหรับ AI generate รูป)
                          </label>
                          <textarea
                            {...step2Form.register(
                              `levels.${index}.personaDescription`,
                            )}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="คำอธิบายลักษณะภายนอกและอุปกรณ์ (ภาษาอังกฤษ)"
                            defaultValue={level.personaDescription || ''}
                          />
                        </div>
                        <input
                          {...step2Form.register(`levels.${index}.level`)}
                          type="hidden"
                          value={level.level}
                        />
                        <input
                          {...step2Form.register(
                            `levels.${index}.requiredCharacterLevel`,
                          )}
                          type="hidden"
                          value={level.requiredCharacterLevel}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>ไม่พบข้อมูล level tree</p>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="mt-2 text-blue-500 hover:text-blue-700"
                      >
                        กลับไปขั้นตอนที่ 1
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {Array.isArray(generatedLevels) && generatedLevels.length > 0 && (
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>ย้อนกลับ</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                  >
                    <span>ต่อไป</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Step 3: Image Upload */}
          {currentStep === 3 && (
            <form
              onSubmit={step3Form.handleSubmit(handleStep3Submit)}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium mb-4">
                  ขั้นตอนที่ 3: รูปภาพและรายละเอียด
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คำอธิบายอาชีพ (ไม่บังคับ)
                    </label>
                    <textarea
                      {...step3Form.register('description')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="คำอธิบายเกี่ยวกับอาชีพนี้"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รูปภาพอาชีพ (ไม่บังคับ)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg mx-auto"
                          />
                          <div className="space-x-2">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handleImageChange}
                              className="hidden"
                              id="image-upload-change"
                              disabled={isLoading}
                            />
                            <label
                              htmlFor="image-upload-change"
                              className={`inline-block px-3 py-2 rounded-md cursor-pointer ${
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
                                step3Form.setValue('imageFile', undefined)
                              }}
                              className="text-red-500 hover:text-red-700"
                              disabled={isLoading}
                            >
                              ลบรูป
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-gray-600">คลิกเพื่อเลือกรูปภาพ</p>
                          <p className="text-sm text-gray-500">
                            รองรับ JPEG, PNG, WebP (ไม่เกิน 5MB)
                          </p>
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
                            className={`inline-block px-4 py-2 rounded-md cursor-pointer ${
                              isLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            เลือกไฟล์
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ย้อนกลับ</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>สร้างอาชีพ</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
