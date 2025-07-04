'use client'

import { useState, useEffect } from 'react'
import { Card } from '../../../../components/ui/Card'
import { Table } from '../../../../components/ui/Table'
import { Badge } from '../../../../components/ui/Badge'
import { Spinner } from '../../../../components/ui/Spinner'
import { Button } from '../../../../components/ui/Button'
import { Pagination } from '../../../../components/ui/Pagination'


import dayjs from 'dayjs'
import 'dayjs/locale/th'

interface RewardReportData {
    summary: {
        totalTokensSpent: number
        totalGachaPulls: number
        totalXenyDistributed: number
    }
    characterSummary: Array<{
        characterId: number
        characterName: string
        userName: string
        username: string
        jobClass: string
        jobLevel: string
        totalPulls: number
        totalWins: number
        totalSpent: number
        winRate: string
        lastGachaAt: string | null
    }>
    gachaHistory: Array<{
        id: number
        characterId: number
        rewardItemId: number | null
        sessionId: string
        pullNumber: number
        tokenSpent: number
        isWin: boolean
        createdAt: string
        character: {
            name: string
            user: {
                name: string
                username: string
            }
            currentJobLevel: {
                jobClass: {
                    name: string
                }
            }
        }
        rewardItem: {
            name: string
            category: string
            imageUrl: string | null
            metadata?: { value?: number; currency?: string }
        } | null
        xenyEarned: number
    }>
}



export default function ReportsPage() {
    const [data, setData] = useState<RewardReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCharacter, setSelectedCharacter] = useState<string>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')


    useEffect(() => {
        fetchReportData()
    }, [])

    const fetchReportData = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/reports/rewards')
            const result = await response.json()
            
            if (result.success) {
                setData(result.data)
            } else {
                setError(result.error || 'Failed to fetch data')
            }
        } catch {
            setError('Failed to fetch report data')
        } finally {
            setLoading(false)
        }
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('th-TH').format(num)
    }

    const formatDate = (dateString: string) => {
        return dayjs(dateString).locale('th').format('DD/MM/YYYY HH:mm')
    }



    const filteredGachaHistory = data?.gachaHistory.filter(item => {
        // กรองตาม Character
        if (selectedCharacter !== 'all' && item.characterId.toString() !== selectedCharacter) {
            return false
        }
        
        // กรองตามคำค้นหา
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            const characterName = item.character.name.toLowerCase()
            const userName = item.character.user.name.toLowerCase()
            const rewardName = item.rewardItem?.name?.toLowerCase() || ''
            const rewardCategory = item.rewardItem?.category?.toLowerCase() || ''
            
            const matchesSearch = characterName.includes(searchLower) || 
                   userName.includes(searchLower) || 
                   rewardName.includes(searchLower) || 
                   rewardCategory.includes(searchLower)
            
            if (!matchesSearch) return false
        }
        
        // กรองตามวันที่
        if (startDate || endDate) {
            const itemDate = new Date(item.createdAt)
            const itemDateStr = itemDate.toISOString().split('T')[0] // YYYY-MM-DD format
            
            if (startDate && itemDateStr < startDate) return false
            if (endDate && itemDateStr > endDate) return false
        }
        
        return true
    }) || []

    // Reset หน้าเมื่อเปลี่ยน filter, คำค้นหา, หรือวันที่
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCharacter, searchTerm, startDate, endDate])

    // คำนวณ pagination
    const totalItems = filteredGachaHistory.length
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedGachaHistory = filteredGachaHistory.slice(startIndex, endIndex)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={fetchReportData}>ลองใหม่</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">รายงานรางวัล</h1>
                    <p className="text-gray-600">สถิติการใช้งานตู้กาชาและรางวัล</p>
                </div>
                <Button onClick={fetchReportData} variant="solid">
                    รีเฟรชข้อมูล
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700">Token ที่ใช้ไปแล้ว</h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {formatNumber(data?.summary.totalTokensSpent || 0)}
                        </p>
                        <p className="text-sm text-gray-500">Token</p>
                    </div>
                </Card>
                
                <Card>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700">จำนวนครั้งที่สุ่ม</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {formatNumber(data?.summary.totalGachaPulls || 0)}
                        </p>
                        <p className="text-sm text-gray-500">ครั้ง</p>
                    </div>
                </Card>
                
                <Card>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700">Xeny ที่แจกไปแล้ว</h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {formatNumber(data?.summary.totalXenyDistributed || 0)}
                        </p>
                        <p className="text-sm text-gray-500">Xeny</p>
                    </div>
                </Card>
                

            </div>

            {/* Character Summary */}
            <Card
                header={{
                    content: 'สถิติการสุ่มของแต่ละ Character',
                    extra: (
                        <div className="flex items-center gap-4">
                            <select
                                value={selectedCharacter}
                                onChange={(e) => setSelectedCharacter(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="all">ทั้งหมด</option>
                                {data?.characterSummary.map(char => (
                                    <option key={char.characterId} value={char.characterId.toString()}>
                                        {char.characterName} ({char.userName})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )
                }}
            >
                <Table>
                    <Table.THead>
                        <Table.Tr>
                            <Table.Th>Character</Table.Th>
                            <Table.Th>อาชีพ</Table.Th>
                            <Table.Th>จำนวนครั้ง</Table.Th>
                            <Table.Th>ได้รางวัล</Table.Th>
                            <Table.Th>อัตราได้รางวัล</Table.Th>
                            <Table.Th>Token ที่ใช้</Table.Th>
                            <Table.Th>ครั้งล่าสุด</Table.Th>
                        </Table.Tr>
                    </Table.THead>
                    <Table.TBody>
                        {data?.characterSummary
                            .filter(char => selectedCharacter === 'all' || char.characterId.toString() === selectedCharacter)
                            .map((character) => (
                                <Table.Tr key={character.characterId}>
                                    <Table.Td>
                                        <div>
                                            <div className="font-medium">{character.characterName}</div>
                                            <div className="text-sm text-gray-500">@{character.username}</div>
                                        </div>
                                    </Table.Td>
                                    <Table.Td>
                                        <div>
                                            <div className="font-medium">{character.jobClass}</div>
                                            <div className="text-sm text-gray-500">{character.jobLevel}</div>
                                        </div>
                                    </Table.Td>
                                    <Table.Td className="text-center">{formatNumber(character.totalPulls)}</Table.Td>
                                    <Table.Td className="text-center">{formatNumber(character.totalWins)}</Table.Td>
                                    <Table.Td className="text-center">
                                        <Badge className={character.winRate > '10' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                                            {character.winRate}%
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td className="text-center">{formatNumber(character.totalSpent)}</Table.Td>
                                    <Table.Td className="text-center">
                                        {character.lastGachaAt ? formatDate(character.lastGachaAt) : '-'}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                    </Table.TBody>
                </Table>
            </Card>

            {/* Gacha History */}
            <Card
                header={{
                    content: 'ประวัติการสุ่มตู้กาชา',
                    extra: (
                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                placeholder="ค้นหา Character, User, รางวัล..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 w-64"
                            />
                            <input
                                type="date"
                                placeholder="วันที่เริ่มต้น"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2"
                            />
                            <span className="text-gray-500">ถึง</span>
                            <input
                                type="date"
                                placeholder="วันที่สิ้นสุด"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                    )
                }}
            >
                <Table>
                    <Table.THead>
                        <Table.Tr>
                            <Table.Th>วันที่</Table.Th>
                            <Table.Th>Character</Table.Th>
                            <Table.Th>รางวัล</Table.Th>
                            <Table.Th>มูลค่ารางวัล</Table.Th>
                            <Table.Th>Token ที่ใช้</Table.Th>
                        </Table.Tr>
                    </Table.THead>
                    <Table.TBody>
                        {paginatedGachaHistory.map((item) => (
                            <Table.Tr key={item.id}>
                                <Table.Td>{formatDate(item.createdAt)}</Table.Td>
                                <Table.Td>
                                    <div>
                                        <div className="font-medium">{item.character.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {item.character.currentJobLevel.jobClass.name}
                                        </div>
                                    </div>
                                </Table.Td>
                                <Table.Td>
                                    {item.rewardItem ? (
                                        <div className="flex items-center gap-2">
                                            {item.rewardItem.imageUrl && (
                                                <img 
                                                    src={item.rewardItem.imageUrl} 
                                                    alt={item.rewardItem.name}
                                                    className="w-8 h-8 rounded"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{item.rewardItem.name}</div>
                                                <div className="text-sm text-gray-500">{item.rewardItem.category}</div>
                                                {item.rewardItem.metadata && (
                                                    <div className="text-xs text-blue-600">
                                                        {item.rewardItem.metadata.value}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">ไม่ได้รับรางวัล</span>
                                    )}
                                </Table.Td>
                                <Table.Td className="text-center">
                                    {item.isWin ? formatNumber(item.xenyEarned) : '-'}
                                </Table.Td>
                                <Table.Td className="text-center">{formatNumber(item.tokenSpent)}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.TBody>
                </Table>
                
                {paginatedGachaHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        ไม่พบข้อมูลการสุ่มในช่วงเวลาที่เลือก
                    </div>
                )}
                
                {/* Pagination */}
                {totalItems > 0 && (
                    <div className="flex justify-center mt-6">
                        <Pagination
                            currentPage={currentPage}
                            total={totalItems}
                            pageSize={pageSize}
                            onChange={setCurrentPage}
                            displayTotal={true}
                        />
                    </div>
                )}
            </Card>
        </div>
    )
}
