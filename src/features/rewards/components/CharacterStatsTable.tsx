'use client'

import React from 'react'
import { Table } from '../../../components/ui'
import { CharacterGachaStats } from '../types'

interface CharacterStatsTableProps {
  data: CharacterGachaStats[]
}

const CharacterStatsTable: React.FC<CharacterStatsTableProps> = ({ data }) => {
  return (
    <Table>
      <Table.THead>
        <Table.Tr>
          <Table.Th>Character</Table.Th>
          <Table.Th>User</Table.Th>
          <Table.Th>อาชีพ</Table.Th>
          <Table.Th>จำนวนครั้งที่สุ่ม</Table.Th>
          <Table.Th>จำนวนครั้งที่ได้รางวัล</Table.Th>
          <Table.Th>อัตราได้รางวัล (%)</Table.Th>
          <Table.Th>Token ที่ใช้</Table.Th>
          <Table.Th>วันที่สุ่มครั้งล่าสุด</Table.Th>
        </Table.Tr>
      </Table.THead>
      <Table.TBody>
        {data.map((character) => (
          <Table.Tr key={character.characterId}>
            <Table.Td>
              <div>
                <div className="font-medium">{character.characterName}</div>
              </div>
            </Table.Td>
            <Table.Td>
              <div>
                <div className="font-medium">{character.userName}</div>
                <div className="text-sm text-gray-500">
                  @{character.username}
                </div>
              </div>
            </Table.Td>
            <Table.Td>
              <div>
                <div className="font-medium">{character.jobClass}</div>
                <div className="text-sm text-gray-500">
                  {character.jobLevel}
                </div>
              </div>
            </Table.Td>
            <Table.Td>
              <div className="font-medium">
                {character.totalPulls.toLocaleString()}
              </div>
            </Table.Td>
            <Table.Td>
              <div className="font-medium">
                {character.totalWins.toLocaleString()}
              </div>
            </Table.Td>
            <Table.Td>
              <div className="font-medium">{character.winRate}%</div>
            </Table.Td>
            <Table.Td>
              <div className="font-medium">
                {character.totalSpent.toLocaleString()}
              </div>
            </Table.Td>
            <Table.Td>
              <div>
                {character.lastGachaAt
                  ? new Date(character.lastGachaAt).toLocaleDateString('th-TH')
                  : '-'}
              </div>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.TBody>
    </Table>
  )
}

export default CharacterStatsTable
