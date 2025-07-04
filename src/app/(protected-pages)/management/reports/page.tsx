'use client'

import { useState, useEffect } from 'react'

import { Table } from '../../../../components/ui/Table'

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
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-6">
                        <Spinner size="lg" />
                    </div>
                    <p className="text-white text-xl font-semibold">กำลังโหลดข้อมูล...</p>
                    <p className="text-purple-200 text-sm mt-2">กรุณารอสักครู่</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md border border-white/20">
                    <div className="bg-red-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-white text-lg font-semibold mb-6">{error}</p>
                    <Button 
                        onClick={fetchReportData} 
                        variant="solid"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        ลองใหม่
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">การสุ่มตู้กาชาและรางวัล</h1>
                                <p className="text-purple-200">รายงาน</p>
                            </div>
                        </div>
                        {/* <Button 
                            onClick={fetchReportData} 
                            variant="solid"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            
                        </Button> */}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-200 text-sm font-medium mb-2">Token เผาไปแล้ว</p>
                            <p className="text-4xl font-bold text-white mb-1">
                                {formatNumber(data?.summary.totalTokensSpent || 0)}
                            </p>
                            {/* <p className="text-purple-300 text-sm">Total Spent</p> */}
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-200 text-sm font-medium mb-2">จำนวนการกด</p>
                            <p className="text-4xl font-bold text-white mb-1">
                                {formatNumber(data?.summary.totalGachaPulls || 0)}
                            </p>
                            {/* <p className="text-purple-300 text-sm">Total Pulls</p> */}
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-200 text-sm font-medium mb-2">Xeny ที่แจกไปแล้ว</p>
                            <p className="text-4xl font-bold text-white mb-1">
                                {formatNumber(data?.summary.totalXenyDistributed || 0)}
                            </p>
                            {/* <p className="text-purple-300 text-sm">Total Distributed</p> */}
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Character Summary */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 mb-12 overflow-hidden">
                <div className="px-8 py-6 border-b border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white">สถิติการสุ่มของแต่ละ Character</h2>
                        </div>
                        <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                            </svg>
                            <select
                                value={selectedCharacter}
                                onChange={(e) => setSelectedCharacter(e.target.value)}
                                className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl px-4 py-2 text-sm text-white placeholder-white/70 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="all" className="text-slate-900">ทั้งหมด</option>
                                {data?.characterSummary.map(char => (
                                    <option key={char.characterId} value={char.characterId.toString()} className="text-slate-900">
                                        {char.characterName} ({char.userName})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
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
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                            parseFloat(character.winRate) > 10 
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                                                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                                        }`}>
                                            {character.winRate}%
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="text-center">{formatNumber(character.totalSpent)}</Table.Td>
                                    <Table.Td className="text-center">
                                        {character.lastGachaAt ? formatDate(character.lastGachaAt) : '-'}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                    </Table.TBody>
                </Table>
                </div>
            </div>

            {/* Gacha History */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
                <div className="px-8 py-6 border-b border-white/20">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white">ประวัติการสุ่มตู้กาชา</h2>
                        </div>
                        <div className="flex items-center space-x-6 flex-wrap">
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="ค้นหา Character, User, รางวัล..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl px-4 py-2 text-sm w-64 text-white placeholder-white/70 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="date"
                                    placeholder="วันที่เริ่มต้น"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <span className="text-purple-300 text-sm font-medium">ถึง</span>
                                <input
                                    type="date"
                                    placeholder="วันที่สิ้นสุด"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
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
                                                {/* <div className="text-sm text-gray-500">{item.rewardItem.category}</div> */}
                                                {/* {item.rewardItem.metadata && (
                                                    <div className="text-xs ">
                                                        {item.rewardItem.metadata.value} Xeny
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">ไม่ได้รับรางวัล</span>
                                    )}
                                </Table.Td>
                                <Table.Td className="text-center">
                                    {item.isWin ? formatNumber(item.xenyEarned) + ' Xeny' : '-'}
                                </Table.Td>
                                <Table.Td className="text-center">{formatNumber(item.tokenSpent)}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.TBody>
                </Table>
                </div>
                
                {paginatedGachaHistory.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-white/10 backdrop-blur-xl rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-white/20">
                            <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-white text-lg font-semibold mb-2">ไม่พบข้อมูลการสุ่มในช่วงเวลาที่เลือก</p>
                        <p className="text-purple-200 text-sm">ลองเปลี่ยนเงื่อนไขการค้นหาหรือช่วงวันที่</p>
                    </div>
                )}
                
                {/* Pagination */}
                {totalItems > 0 && (
                    <div className="flex justify-center py-8 border-t border-white/20">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
                            <Pagination
                                currentPage={currentPage}
                                total={totalItems}
                                pageSize={pageSize}
                                onChange={setCurrentPage}
                                displayTotal={true}
                            />
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    )
}
