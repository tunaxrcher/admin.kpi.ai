'use client'

import React from 'react'
import { Card } from '../../../components/ui'
import { RewardReportSummary } from '../types'

interface RewardSummaryProps {
  summary: RewardReportSummary
}

const RewardSummary: React.FC<RewardSummaryProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {summary.totalTokensSpent.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Token ที่ใช้ไปแล้ว</div>
        </div>
      </Card>

      <Card>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {summary.totalGachaPulls.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">จำนวนครั้งที่สุ่ม</div>
        </div>
      </Card>

      <Card>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {summary.totalXenyDistributed.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Xeny ที่แจกไปแล้ว</div>
        </div>
      </Card>
    </div>
  )
}

export default RewardSummary
