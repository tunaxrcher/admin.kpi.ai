'use client'

import { useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Loader2,
  Briefcase,
  Star,
  TrendingUp,
} from 'lucide-react'
import { useJobClasses, useDeleteJobClass } from '../hooks/api'
import type { JobClass } from '../types'
import CreateJobModal from './CreateJobModal'
import EditJobModal from './EditJobModal'
import toast from 'react-hot-toast'

export default function JobManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobClass | null>(null)

  const { data: jobClasses, isLoading } = useJobClasses()
  const deleteJobMutation = useDeleteJobClass()

  const handleEdit = (job: JobClass) => {
    setSelectedJob(job)
    setShowEditModal(true)
  }

  const handleDelete = async (job: JobClass) => {
    if (!confirm(`คุณต้องการลบอาชีพ "${job.name}" หรือไม่?`)) return

    try {
      await deleteJobMutation.mutateAsync(job.id)
      toast.success('ลบอาชีพเรียบร้อยแล้ว')
    } catch (error: any) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบอาชีพ')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white-900">
                    จัดการอาชีพ
                  </h1>
                  <p className="text-white-600 mt-1">
                    สร้างและจัดการอาชีพต่างๆ ในระบบ
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-2 text-sm text-white-500">
                      <TrendingUp className="w-4 h-4" />
                      <span>{jobClasses?.length || 0} อาชีพทั้งหมด</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-white-500">
                      <Users className="w-4 h-4" />
                      <span>
                        {jobClasses?.reduce(
                          (sum: number, job: any) =>
                            sum + job._count.characters,
                          0,
                        ) || 0}{' '}
                        ผู้ใช้งาน
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">สร้างอาชีพใหม่</span>
              </button>
            </div>
          </div>
        </div>

        {/* Job Classes Grid */}
        {jobClasses && jobClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jobClasses?.map(
              (job: JobClass & { _count: { characters: number } }) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
                >
                  {/* Job Image */}
                  <div className="h-48 bg-transparent relative overflow-hidden">
                    {job.imageUrl ? (
                      <img
                        src={job.imageUrl || '/placeholder.svg'}
                        alt={job.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <div className="bg-white/80 rounded-full p-4">
                          <Briefcase className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                    {/* <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                        Level {Math.max(...job.levels.map((l) => l.level))}
                      </div>
                    </div> */}
                  </div>

                  {/* Job Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {job.name}
                      </h3>

                      {job.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {job.description}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Star className="w-4 h-4" />
                          <span>{job.levels.length} levels</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{job._count.characters}</span>
                        </div>
                      </div>
                      {job._count.characters > 0 && (
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                          Active
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(job)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 rounded-xl hover:bg-blue-100 transition-all font-semibold"
                      >
                        <Edit className="w-4 h-4" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDelete(job)}
                        disabled={
                          deleteJobMutation.isPending ||
                          job._count.characters > 0
                        }
                        className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-700 py-3 rounded-xl hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                      >
                        {deleteJobMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>ลบ</span>
                      </button>
                    </div>

                    {job._count.characters > 0 && (
                      <p className="text-xs text-orange-600 mt-3 text-center bg-orange-50 py-2 rounded-lg">
                        ไม่สามารถลบได้เนื่องจากมีผู้ใช้งานอยู่
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ยังไม่มีอาชีพในระบบ
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              เริ่มต้นสร้างอาชีพแรกของคุณ
              เพื่อให้ผู้ใช้สามารถเลือกและพัฒนาตัวละครได้
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">สร้างอาชีพใหม่</span>
            </button>
          </div>
        )}

        {/* Modals */}
        <CreateJobModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />

        <EditJobModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedJob(null)
          }}
          jobClass={selectedJob}
        />
      </div>
    </div>
  )
}
