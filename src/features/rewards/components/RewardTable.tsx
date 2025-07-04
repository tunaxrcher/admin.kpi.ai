'use client'

import React from 'react'
import { Table, Pagination, Spinner } from '../../../components/ui'
import { GachaHistoryWithDetails } from '../types'

interface RewardTableProps {
  data: GachaHistoryWithDetails[]
  loading: boolean
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
}

const RewardTable: React.FC<RewardTableProps> = ({
  data,
  loading,
  page,
  limit,
  total,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <Table className="mb-4">
        <Table.THead>
          <Table.Tr>
            <Table.Th>วันที่และเวลา</Table.Th>
            <Table.Th>Character</Table.Th>
            <Table.Th>รางวัล</Table.Th>
            <Table.Th>มูลค่ารางวัล</Table.Th>
            <Table.Th>Token ที่ใช้</Table.Th>
            <Table.Th>สถานะ</Table.Th>
          </Table.Tr>
        </Table.THead>
        <Table.TBody>
          {data.map((gacha) => (
            <Table.Tr key={gacha.id}>
              <Table.Td>
                <div>
                  {new Date(gacha.createdAt).toLocaleDateString('th-TH')}
                  <div className="text-sm text-gray-500">
                    {new Date(gacha.createdAt).toLocaleTimeString('th-TH')}
                  </div>
                </div>
              </Table.Td>
              <Table.Td>
                <div>
                  <div className="font-medium">{gacha.character.name}</div>
                  <div className="text-sm text-gray-500">
                    {gacha.character.user.name} (@{gacha.character.user.username})
                  </div>
                </div>
              </Table.Td>
              <Table.Td>
                {gacha.rewardItem ? (
                  <div>
                    <div className="font-medium">{gacha.rewardItem.name}</div>
                    {/* <div className="text-sm text-gray-500">{gacha.rewardItem.category}</div> */}
                  </div>
                ) : (
                  <div className="text-gray-500">ไม่ได้รับรางวัล</div>
                )}
              </Table.Td>
              <Table.Td>
                <div className="font-medium">
                  {gacha.xenyEarned > 0 ? `${gacha.xenyEarned.toLocaleString()} Xeny` : '-'}
                </div>
              </Table.Td>
              <Table.Td>
                <div className="font-medium">
                  {gacha.tokenSpent.toLocaleString()}
                </div>
              </Table.Td>
              <Table.Td>
                <div className={`font-medium ${gacha.isWin ? 'text-green-600' : 'text-red-600'}`}>
                  {gacha.isWin ? 'ได้รับรางวัล' : 'ไม่ได้รับรางวัล'}
                </div>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.TBody>
      </Table>
      
      {total > 0 && (
        <div className="flex justify-center">
          <Pagination
            pageSize={limit}
            total={total}
            currentPage={page}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}

export default RewardTable 