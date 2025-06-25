'use client'

import type React from 'react'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  Sparkles,
  CheckCircle,
} from 'lucide-react'
import { useCreateJobClass, useGenerateJobLevels } from '../hooks/api'
import type { GeneratedLevel } from '../types'
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

  const stepTitles = ['ชื่ออาชีพ', 'Level Tree', 'รายละเอียด']

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">สร้างอาชีพใหม่</h2>
                <p className="text-blue-100">
                  ขั้นตอนที่ {currentStep} จาก 3: {stepTitles[currentStep - 1]}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step === currentStep
                      ? 'bg-white text-blue-600 shadow-lg scale-110'
                      : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-white/30 text-white/70'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 rounded-full ${step < currentStep ? 'bg-green-500' : 'bg-white/30'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Step 1: Job Name */}
          {currentStep === 1 && (
            <form
              onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              className="space-y-8"
            >
              <div className="text-center">
                {/* <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-blue-600" />
                </div> */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  เริ่มต้นสร้างอาชีพใหม่
                </h3>
                <p className="text-gray-600">
                  ใส่ชื่ออาชีพที่คุณต้องการสร้าง ระบบจะสร้าง Level Tree
                  ให้อัตโนมัติ
                </p>
              </div>

              <div className="max-w-md mx-auto">
                {/* <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ชื่ออาชีพ
                </label> */}
                <input
                  {...step1Form.register('name')}
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-lg"
                  placeholder="เช่น นักการตลาด, โปรแกรมเมอร์, ดีไซน์เนอร์"
                />
                {step1Form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {step1Form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={generateLevelsMutation.isPending}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {generateLevelsMutation.isPending && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">สร้าง Level Tree</span>
                  <ChevronRight className="w-5 h-5" />
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
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ตรวจสอบและแก้ไข Level Tree
                </h3>
                <p className="text-gray-600">
                  ระบบได้สร้าง level tree สำหรับอาชีพ{' '}
                  <span className="font-semibold text-blue-600">
                    "{jobName}"
                  </span>{' '}
                  ให้แล้ว คุณสามารถแก้ไขได้
                </p>
              </div>

              <div className="space-y-4">
                {Array.isArray(generatedLevels) &&
                generatedLevels.length > 0 ? (
                  generatedLevels.map((level, index) => (
                    <div
                      key={level.level}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-100 rounded-xl p-6 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                          {level.level}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            Level {level.level}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Character Level {level.requiredCharacterLevel}{' '}
                            required
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ชื่อตำแหน่ง
                          </label>
                          <input
                            {...step2Form.register(`levels.${index}.title`)}
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                            placeholder="ชื่อตำแหน่ง"
                            defaultValue={level.title}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            คำอธิบาย
                          </label>
                          <input
                            {...step2Form.register(
                              `levels.${index}.description`,
                            )}
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                            placeholder="คำอธิบายหน้าที่และความสามารถ"
                            defaultValue={level.description || ''}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Persona Description (สำหรับ AI generate รูป)
                        </label>
                        <textarea
                          {...step2Form.register(
                            `levels.${index}.personaDescription`,
                          )}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                          rows={3}
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
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-gray-400 mb-4">
                      <X className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-600 mb-4">ไม่พบข้อมูล level tree</p>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      กลับไปขั้นตอนที่ 1
                    </button>
                  </div>
                )}
              </div>

              {Array.isArray(generatedLevels) && generatedLevels.length > 0 && (
                <div className="flex justify-between pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-semibold">ย้อนกลับ</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <span className="font-semibold">ต่อไป</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Step 3: Image Upload */}
          {currentStep === 3 && (
            <form
              onSubmit={step3Form.handleSubmit(handleStep3Submit)}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  รูปภาพและรายละเอียด
                </h3>
                <p className="text-gray-600">
                  เพิ่มรูปภาพและคำอธิบายเพิ่มเติมสำหรับอาชีพ{' '}
                  <span className="font-semibold text-blue-600">{jobName}</span>
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    คำอธิบายอาชีพ (ไม่บังคับ)
                  </label>
                  <textarea
                    {...step3Form.register('description')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                    rows={4}
                    placeholder="คำอธิบายเกี่ยวกับอาชีพนี้..."
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    รูปภาพอาชีพ (ใช้แสดงใน UI ตอนผู้ใช้งานสร้าง Character)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview || '/placeholder.svg'}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-xl mx-auto shadow-lg"
                        />
                        <div className="space-x-3">
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
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                              isLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            <Upload className="w-4 h-4" />
                            <span>เปลี่ยนรูป</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null)
                              step3Form.setValue('imageFile', undefined)
                            }}
                            className="text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
                            disabled={isLoading}
                          >
                            ลบรูป
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                          <Upload className="w-10 h-10 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700 mb-2">
                            คลิกเพื่อเลือกรูปภาพ
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
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
                            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg cursor-pointer transition-all ${
                              isLoading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Upload className="w-5 h-5" />
                            <span className="font-semibold">เลือกไฟล์</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-all"
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-semibold">ย้อนกลับ</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">สร้างอาชีพ</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
