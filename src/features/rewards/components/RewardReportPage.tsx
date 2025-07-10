'use client'

import React, { useState } from 'react'
import { Card, Button, Input, DatePicker, Select } from '../../../components/ui'
import { useRewardReportData } from '../hooks/useRewards'
import { RewardFilters } from '../types'
import RewardSummary from './RewardSummary'
import RewardTable from './RewardTable'

const RewardReportPage: React.FC = () => {
  const [filters, setFilters] = useState<RewardFilters>({
    page: 1,
    limit: 10,
    dateRange: 'all',
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
        <div className="p-6">
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ช่วงเวลา
                </label>
                <Select
                  value={
                    filters.dateRange
                      ? {
                          value: filters.dateRange,
                          label:
                            filters.dateRange === 'all'
                              ? 'ทั้งหมด'
                              : filters.dateRange === 'today'
                                ? 'วันนี้'
                                : filters.dateRange === 'week'
                                  ? 'อาทิตย์นี้'
                                  : filters.dateRange === 'month'
                                    ? 'เดือนนี้'
                                    : filters.dateRange === 'year'
                                      ? 'ปีนี้'
                                      : 'ทั้งหมด',
                        }
                      : { value: 'all', label: 'ทั้งหมด' }
                  }
                  onChange={(option) =>
                    handleFilterChange({
                      dateRange: option?.value as RewardFilters['dateRange'],
                      startDate: undefined,
                      endDate: undefined,
                    })
                  }
                  options={[
                    { value: 'all', label: 'ทั้งหมด' },
                    { value: 'today', label: 'วันนี้' },
                    { value: 'week', label: 'อาทิตย์นี้' },
                    { value: 'month', label: 'เดือนนี้' },
                    { value: 'year', label: 'ปีนี้' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ค้นหา
                </label>
                <Input
                  placeholder="ชื่อ Character, User, รางวัล..."
                  value={filters.search || ''}
                  onChange={(e) =>
                    handleFilterChange({ search: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่เริ่มต้น
                </label>
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
                      dateRange: 'all', // Reset preset when custom date is selected
                    })
                  }
                  disabled={filters.dateRange !== 'all'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่สิ้นสุด
                </label>
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
                      dateRange: 'all', // Reset preset when custom date is selected
                    })
                  }
                  disabled={filters.dateRange !== 'all'}
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
