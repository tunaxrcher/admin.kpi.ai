'use client'

import React, { useState } from 'react'
import { Card, Button, Input, DatePicker } from '../../../components/ui'
import { useRewardReportData } from '../hooks/useRewards'
import { RewardFilters } from '../types'
import RewardSummary from './RewardSummary'
import RewardTable from './RewardTable'

const RewardReportPage: React.FC = () => {
  const [filters, setFilters] = useState<RewardFilters>({
    page: 1,
    limit: 10,
  })

  const { data, isLoading, error } = useRewardReportData(filters)

  const handleFilterChange = (newFilters: Partial<RewardFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            เกิดข้อผิดพลาด
          </h3>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">รายงาน</h2>
          <p className="text-gray-600">รางวัลที่ได้รับจากการสุ่มตู้กาชา</p>
        </div>

        <Button
          variant="solid"
          onClick={handleRefresh}
          disabled={isLoading}
          loading={isLoading}
        >
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* Summary */}
      {data && <RewardSummary summary={data.summary} />}

      {/* Character Stats */}
      {/* {data && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">สถิติการสุ่มของแต่ละ Character</h3>
            <CharacterStatsTable data={data.characterSummary} />
          </div>
        </Card>
      )} */}

      {/* Filters */}
      <Card>
        <div className="">
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
              <div>
                <Input
                  placeholder="ชื่อ Character, User, รางวัล..."
                  value={filters.search || ''}
                  onChange={(e) =>
                    handleFilterChange({ search: e.target.value })
                  }
                />
              </div>
              <div>
                <DatePicker
                  placeholder="เลือกวันที่"
                  value={
                    filters.startDate ? new Date(filters.startDate) : undefined
                  }
                  onChange={(date) =>
                    handleFilterChange({
                      startDate: date
                        ? date.toISOString().split('T')[0]
                        : undefined,
                    })
                  }
                />
              </div>
              <div>
                <DatePicker
                  placeholder="เลือกวันที่"
                  value={
                    filters.endDate ? new Date(filters.endDate) : undefined
                  }
                  onChange={(date) =>
                    handleFilterChange({
                      endDate: date
                        ? date.toISOString().split('T')[0]
                        : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Gacha History */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">ประวัติการสุ่มตู้กาชา</h3>
          <RewardTable
            data={data?.gachaHistory || []}
            loading={isLoading}
            page={filters.page || 1}
            limit={filters.limit || 10}
            total={data?.totalGachaHistory || 0}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>
    </div>
  )
}

export default RewardReportPage
