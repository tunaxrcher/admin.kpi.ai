"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Save, Loader2, Upload, Edit3, CheckCircle, AlertCircle } from "lucide-react"
import { useUpdateJobClass, useUpdateJobLevel } from "../hooks/api"
import type { JobClass } from "../types"
import toast from "react-hot-toast"

const jobClassSchema = z.object({
  name: z.string().min(1, "กรุณาใส่ชื่ออาชีพ").max(100, "ชื่ออาชีพยาวเกินไป"),
  description: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
})

interface EditJobModalProps {
  isOpen: boolean
  onClose: () => void
  jobClass: JobClass | null
}

export default function EditJobModal({ isOpen, onClose, jobClass }: EditJobModalProps) {
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
      name: "",
      description: "",
      imageFile: undefined,
    },
  })

  // Initialize level data when jobClass changes
  useEffect(() => {
    if (jobClass) {
      jobForm.reset({
        name: jobClass.name,
        description: jobClass.description || "",
        imageFile: undefined,
      })
      setImagePreview(jobClass.imageUrl || null)

      // Initialize level data
      const initialLevelData: { [key: number]: any } = {}
      jobClass.levels.forEach((level) => {
        initialLevelData[level.id] = {
          title: level.title,
          description: level.description || "",
          personaDescription: level.personaDescription || "",
        }
      })
      setLevelData(initialLevelData)
    }
  }, [jobClass, jobForm])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP)")
      e.target.value = ""
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB")
      e.target.value = ""
      return
    }

    jobForm.setValue("imageFile", file)

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

      toast.success("อัพเดทข้อมูลอาชีพเรียบร้อยแล้ว")
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการอัพเดท")
    }
  }

  const handleLevelInputChange = (levelId: number, field: string, value: string) => {
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
        toast.error("กรุณาใส่ชื่อตำแหน่ง")
        return
      }

      await updateLevelMutation.mutateAsync({ levelId, data })
      setEditingLevels((prev) => ({ ...prev, [levelId]: false }))
      toast.success("อัพเดท level เรียบร้อยแล้ว")
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการอัพเดท level")
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-2">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">แก้ไขอาชีพ</h2>
                <p className="text-indigo-100">{jobClass.name}</p>
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
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-120px)]">
          {/* Section 1: Job Class Info */}
          <div className="w-2/5 p-8 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-indigo-100 rounded-full p-2">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">ข้อมูลอาชีพหลัก</h3>
              </div>

              <form onSubmit={jobForm.handleSubmit(handleJobSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่ออาชีพ</label>
                  <input
                    {...jobForm.register("name")}
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                  />
                  {jobForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {jobForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
                  <textarea
                    {...jobForm.register("description")}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                    rows={4}
                    placeholder="คำอธิบายเกี่ยวกับอาชีพนี้..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">รูปภาพอาชีพ</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Job Class"
                          className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg"
                        />
                        <div className="space-x-3">
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
                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                              isLoading
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                            }`}
                          >
                            <Upload className="w-4 h-4" />
                            <span>เปลี่ยนรูป</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null)
                              jobForm.setValue("imageFile", undefined)
                            }}
                            className="text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-all"
                            disabled={isLoading}
                          >
                            ลบรูป
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
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
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                            isLoading
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          <span>เลือกรูป</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  <Save className="w-5 h-5" />
                  <span className="font-semibold">บันทึกข้อมูลอาชีพ</span>
                </button>
              </form>
            </div>
          </div>

          {/* Section 2: Level Tree */}
          <div className="w-3/5 p-8 overflow-y-auto">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 rounded-full p-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Level Tree</h3>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                {jobClass.levels.length} levels
              </span>
            </div>

            <div className="space-y-4">
              {jobClass.levels.map((level) => (
                <div
                  key={level.id}
                  className={`border-2 rounded-xl p-6 transition-all ${
                    editingLevels[level.id]
                      ? "border-purple-200 bg-purple-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                        {level.level}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Level {level.level}</h4>
                        <p className="text-sm text-gray-600">Character Level {level.requiredCharacterLevel} required</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setEditingLevels((prev) => ({
                          ...prev,
                          [level.id]: !prev[level.id],
                        }))
                      }
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        editingLevels[level.id]
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                      disabled={isLoading}
                    >
                      {editingLevels[level.id] ? "ยกเลิก" : "แก้ไข"}
                    </button>
                  </div>

                  {editingLevels[level.id] ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อตำแหน่ง</label>
                        <input
                          type="text"
                          value={levelData[level.id]?.title || ""}
                          onChange={(e) => handleLevelInputChange(level.id, "title", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
                        <textarea
                          value={levelData[level.id]?.description || ""}
                          onChange={(e) => handleLevelInputChange(level.id, "description", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all"
                          rows={3}
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Persona Description</label>
                        <textarea
                          value={levelData[level.id]?.personaDescription || ""}
                          onChange={(e) => handleLevelInputChange(level.id, "personaDescription", e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all"
                          rows={3}
                          disabled={isLoading}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleLevelSubmit(level.id)}
                        disabled={isLoading}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                      >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        <Save className="w-5 h-5" />
                        <span className="font-semibold">บันทึก</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="mb-2">
                          <span className="text-sm font-semibold text-gray-600">ตำแหน่ง:</span>
                          <p className="text-gray-900 font-medium">{level.title}</p>
                        </div>
                        {level.description && (
                          <div className="mb-2">
                            <span className="text-sm font-semibold text-gray-600">คำอธิบาย:</span>
                            <p className="text-gray-700">{level.description}</p>
                          </div>
                        )}
                        {level.personaDescription && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">Persona:</span>
                            <p className="text-gray-600 text-sm italic">{level.personaDescription}</p>
                          </div>
                        )}
                      </div>
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
