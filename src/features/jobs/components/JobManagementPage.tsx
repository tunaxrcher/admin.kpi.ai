// src/features/jobs/components/JobManagementPage.tsx
'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Users, Loader2 } from 'lucide-react'
import { useJobClasses, useDeleteJobClass } from '../hooks/api'
import { JobClass } from '../types'
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการอาชีพ</h1>
          <p className="text-gray-600">สร้างและจัดการอาชีพต่างๆ ในระบบ</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างอาชีพใหม่</span>
        </button>
      </div>

      {/* Job Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobClasses?.map(
          (job: JobClass & { _count: { characters: number } }) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Job Image */}
              <div className="h-48 bg-gray-200 relative">
                {job.imageUrl ? (
                  <img
                    src={job.imageUrl}
                    alt={job.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Job Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {job.name}
                </h3>

                {job.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {job.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{job.levels.length} levels</span>
                  <span>{job._count.characters} characters</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(job)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 py-2 rounded-md hover:bg-blue-100"
                  >
                    <Edit className="w-4 h-4" />
                    <span>แก้ไข</span>
                  </button>
                  <button
                    onClick={() => handleDelete(job)}
                    disabled={
                      deleteJobMutation.isPending || job._count.characters > 0
                    }
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-2 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <p className="text-xs text-orange-600 mt-2">
                    * ไม่สามารถลบได้เนื่องจากมีตัวละครใช้งานอยู่
                  </p>
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {/* Empty State */}
      {jobClasses?.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ยังไม่มีอาชีพในระบบ
          </h3>
          <p className="text-gray-600 mb-4">เริ่มต้นสร้างอาชีพแรกของคุณ</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างอาชีพใหม่</span>
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
  )
}
