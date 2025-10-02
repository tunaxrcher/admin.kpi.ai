'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  Card,
  Table,
  Spinner,
  Input,
  Select,
  Button,
  Avatar,
  Dialog,
  Form,
  FormItem,
  Dropdown,
  Tabs,
} from '../../../components/ui'
import {
  HiOutlinePencil,
  HiOutlineSearch,
  HiOutlineBriefcase,
  HiOutlineMinus,
  HiOutlineDotsVertical,
  HiOutlineTrash,
  HiOutlineCheck,
} from 'react-icons/hi'
import {
  useCharacters,
  useUpdateCharacterWorkSettings,
  useUpdateCharacterJob,
  useDeductXeny,
  useDeleteCharacter,
  useBulkDeleteCharacters,
} from '../hooks/useCharacters'
import {
  CharacterWithRelations,
  UpdateCharacterWorkSettingsRequest,
  UpdateCharacterJobRequest,
  DeductXenyRequest,
} from '../types'
import { useJobClasses } from '../../jobs/hooks/api'
import { Camera, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

const { Tr, Th, Td, THead, TBody, Sorter } = Table

interface JobClassType {
  id: number
  name: string
}

// Use CharacterWithRelations directly since it has all the required fields
type CharacterType = CharacterWithRelations

const CharacterManagementPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    jobClassId: undefined as number | undefined,
  })
  const [searchInput, setSearchInput] = useState('')
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [shouldRestoreFocus, setShouldRestoreFocus] = useState(false)
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterWithRelations | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isJobEditDialogOpen, setIsJobEditDialogOpen] = useState(false)
  const [isXenyDialogOpen, setIsXenyDialogOpen] = useState(false)
  const [workSettings, setWorkSettings] = useState({
    workStartTime: '',
    workEndTime: '',
    salary: '',
    workDays: [] as number[],
  })
  const [jobSettings, setJobSettings] = useState({
    jobClassId: 0,
    jobLevelId: 0,
  })
  const [xenySettings, setXenySettings] = useState({
    amount: '',
    description: '',
  })
  const [availableJobLevels, setAvailableJobLevels] = useState<
    Array<{
      id: number
      title: string
      requiredCharacterLevel: number
    }>
  >([])
  const [activeTab, setActiveTab] = useState('management')
  const [attendanceFilters, setAttendanceFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    characterId: null as number | null,
    jobClassId: null as number | null,
  })
  const [attendanceData, setAttendanceData] = useState<{
    period: { monthName: string }
    holidays: Array<{ id: number; name: string }>
    reports: Array<{
      character: {
        id: number
        name: string
        avatar?: string | null
        currentPortraitUrl?: string | null
        jobClass: string
      }
      attendance: {
        workDaysInMonth: number
        checkinDays: number
        checkoutDays: number
        lateDays: number
        absentDays: number
        attendanceRate: string
      }
    }>
  } | null>(null)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)
  const [selectedAttendanceCharacter, setSelectedAttendanceCharacter] =
    useState<any>(null)
  const [isAttendanceDetailModalOpen, setIsAttendanceDetailModalOpen] =
    useState(false)
  const [attendanceDetailData, setAttendanceDetailData] = useState<any[]>([])
  const [isLoadingAttendanceDetail, setIsLoadingAttendanceDetail] =
    useState(false)
  const [attendanceSortConfig, setAttendanceSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc',
  })
  const [characterSortConfig, setCharacterSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc',
  })
  
  // Delete functionality states
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false)
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<number[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false)
  const [characterToDelete, setCharacterToDelete] = useState<CharacterWithRelations | null>(null)

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    search: filters.search,
    jobClassId: filters.jobClassId
  }), [filters.search, filters.jobClassId])
  
  const { data: charactersData, isLoading, error } = useCharacters(memoizedFilters)
  const { data: jobClasses } = useJobClasses()
  const updateWorkSettings = useUpdateCharacterWorkSettings()
  const updateCharacterJob = useUpdateCharacterJob()
  const deductXeny = useDeductXeny()
  const deleteCharacter = useDeleteCharacter()
  const bulkDeleteCharacters = useBulkDeleteCharacters()

  // Debug log
  console.log('jobClasses:', jobClasses)

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value)
    setShouldRestoreFocus(true)
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }))
    }, 300) // 300ms delay
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Restore focus after re-render
  useEffect(() => {
    if (shouldRestoreFocus && searchInputRef.current) {
      searchInputRef.current.focus()
      setShouldRestoreFocus(false)
    }
  }, [shouldRestoreFocus, charactersData])

  const handleJobClassFilter = (value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      jobClassId: value ? Number(value) : undefined,
    }))
  }

  const handleEdit = (character: CharacterWithRelations) => {
    setSelectedCharacter(character)
    setWorkSettings({
      workStartTime: character.workStartTime || '',
      workEndTime: character.workEndTime || '',
      salary: character.salary?.toString() || '',
      workDays: (character.workDays as number[]) || [1, 2, 3, 4, 5], // ค่าเริ่มต้น จันทร์-ศุกร์
    })
    setIsEditDialogOpen(true)
  }

  const handleJobEdit = (character: CharacterWithRelations) => {
    setSelectedCharacter(character)
    setJobSettings({
      jobClassId: character.jobClassId,
      jobLevelId: character.jobLevelId,
    })
    setIsJobEditDialogOpen(true)
    // Load available job levels for current job class
    fetchJobLevels(
      character.jobClassId,
      character.level,
      character.currentJobLevel.level,
    )
  }

  const fetchJobLevels = async (
    jobClassId: number,
    characterLevel: number,
    currentJobLevel?: number,
  ) => {
    try {
      let url = `/api/jobs/${jobClassId}/levels?characterLevel=${characterLevel}`
      if (currentJobLevel !== undefined) {
        url += `&currentJobLevel=${currentJobLevel}`
      }
      const response = await fetch(url)
      if (response.ok) {
        const levels = await response.json()
        setAvailableJobLevels(levels)
      }
    } catch (error) {
      console.error('Error fetching job levels:', error)
      setAvailableJobLevels([])
    }
  }

  const handleJobClassChange = async (jobClassId: number) => {
    if (selectedCharacter) {
      try {
        // Fetch available job levels and auto-select the appropriate one
        const response = await fetch(
          `/api/jobs/${jobClassId}/levels?characterLevel=${selectedCharacter.level}&currentJobLevel=${selectedCharacter.currentJobLevel.level}`,
        )
        if (response.ok) {
          const levels = await response.json()
          // Auto-select the lowest available level (which will be >= current level)
          const selectedLevel = levels.length > 0 ? levels[0] : null

          setJobSettings((prev) => ({
            ...prev,
            jobClassId,
            jobLevelId: selectedLevel ? selectedLevel.id : 0,
          }))
          setAvailableJobLevels(levels)
        }
      } catch (error) {
        console.error('Error fetching job levels:', error)
        setJobSettings((prev) => ({ ...prev, jobClassId, jobLevelId: 0 }))
        setAvailableJobLevels([])
      }
    }
  }

  const handleSaveWorkSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCharacter) {
      const data: UpdateCharacterWorkSettingsRequest = {
        workStartTime: workSettings.workStartTime || null,
        workEndTime: workSettings.workEndTime || null,
        salary: workSettings.salary ? parseFloat(workSettings.salary) : null,
        workDays:
          workSettings.workDays.length > 0 ? workSettings.workDays : null,
      }

      updateWorkSettings.mutate(
        { id: selectedCharacter.id, data },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false)
            setSelectedCharacter(null)
            setWorkSettings({
              workStartTime: '',
              workEndTime: '',
              salary: '',
              workDays: [],
            })
          },
        },
      )
    }
  }

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCharacter && jobSettings.jobClassId && jobSettings.jobLevelId) {
      const data: UpdateCharacterJobRequest = {
        jobClassId: jobSettings.jobClassId,
        jobLevelId: jobSettings.jobLevelId,
      }

      updateCharacterJob.mutate(
        { id: selectedCharacter.id, data },
        {
          onSuccess: () => {
            setIsJobEditDialogOpen(false)
            setSelectedCharacter(null)
            setJobSettings({ jobClassId: 0, jobLevelId: 0 })
            setAvailableJobLevels([])
          },
        },
      )
    }
  }

  const handleXenyEdit = (character: CharacterWithRelations) => {
    setSelectedCharacter(character)
    setXenySettings({
      amount: '',
      description: '',
    })
    setIsXenyDialogOpen(true)
  }

  const handleSaveXeny = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCharacter && xenySettings.amount && xenySettings.description) {
      const data: DeductXenyRequest = {
        amount: parseInt(xenySettings.amount),
        description: xenySettings.description,
      }

      deductXeny.mutate(
        { id: selectedCharacter.id, data },
        {
          onSuccess: () => {
            setIsXenyDialogOpen(false)
            setSelectedCharacter(null)
            setXenySettings({ amount: '', description: '' })
          },
        },
      )
    }
  }

  // Delete handlers
  const handleDeleteCharacter = (character: CharacterWithRelations) => {
    setCharacterToDelete(character)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCharacter = () => {
    if (characterToDelete) {
      deleteCharacter.mutate(characterToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setCharacterToDelete(null)
        },
      })
    }
  }

  const toggleBulkDeleteMode = () => {
    setIsBulkDeleteMode(!isBulkDeleteMode)
    setSelectedCharacterIds([])
  }

  const handleSelectCharacter = (characterId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCharacterIds(prev => [...prev, characterId])
    } else {
      setSelectedCharacterIds(prev => prev.filter(id => id !== characterId))
    }
  }

  const handleSelectAllCharacters = (isSelected: boolean) => {
    if (isSelected) {
      const allIds = getSortedCharacterData().map(c => c.id)
      setSelectedCharacterIds(allIds)
    } else {
      setSelectedCharacterIds([])
    }
  }

  const handleBulkDelete = () => {
    if (selectedCharacterIds.length > 0) {
      setIsConfirmBulkDeleteOpen(true)
    }
  }

  const confirmBulkDelete = () => {
    if (selectedCharacterIds.length > 0) {
      bulkDeleteCharacters.mutate(selectedCharacterIds, {
        onSuccess: () => {
          setIsConfirmBulkDeleteOpen(false)
          setSelectedCharacterIds([])
          setIsBulkDeleteMode(false)
        },
      })
    }
  }

  const formatSalary = (salary: number | null) => {
    if (!salary) return '-'
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(salary)
  }

  // Format Xeny with thousand separators
  const formatXeny = (xeny: number | null | undefined) => {
    const value = xeny || 0
    return new Intl.NumberFormat('en-US').format(value)
  }

  // Get Xeny color based on value
  const getXenyColor = (xeny: number | null | undefined) => {
    const value = xeny || 0

    if (value < 1000) {
      return 'text-white' // สีขาว
    } else if (value < 10000) {
      return 'text-yellow-400' // สีเหลือง
    } else if (value < 100000) {
      return 'text-red-400' // สีแดง
    } else {
      return 'text-green-400' // สีเขียวสำหรับ 100,000 ขึ้นไป
    }
  }

  // Function to fetch attendance report
  const fetchAttendanceReport = useCallback(async () => {
    setIsLoadingAttendance(true)
    try {
      const params = new URLSearchParams({
        year: attendanceFilters.year.toString(),
        month: attendanceFilters.month.toString(),
      })

      if (attendanceFilters.characterId) {
        params.append('characterId', attendanceFilters.characterId.toString())
      }

      if (attendanceFilters.jobClassId) {
        params.append('jobClassId', attendanceFilters.jobClassId.toString())
      }

      const response = await fetch(`/api/reports/attendance/monthly?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceData(data.data)
      } else {
        console.error('Failed to fetch attendance report')
      }
    } catch (error) {
      console.error('Error fetching attendance report:', error)
    } finally {
      setIsLoadingAttendance(false)
    }
  }, [attendanceFilters])

  // Load attendance report when filters change
  React.useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceReport()
    }
  }, [activeTab, attendanceFilters, fetchAttendanceReport])

  const handleAttendanceFilterChange = (
    key: string,
    value: string | number | null,
  ) => {
    setAttendanceFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Function to fetch attendance detail records
  const fetchAttendanceDetail = useCallback(
    async (characterId: number) => {
      setIsLoadingAttendanceDetail(true)
      try {
        const params = new URLSearchParams({
          year: attendanceFilters.year.toString(),
          month: attendanceFilters.month.toString(),
          characterId: characterId.toString(),
        })

        const response = await fetch(
          `/api/reports/attendance/monthly?${params}`,
        )
        if (response.ok) {
          const data = await response.json()
          // Get the records for the specific character
          const characterReport = data.data.reports?.[0]
          setAttendanceDetailData(characterReport?.records || [])
        } else {
          console.error('Failed to fetch attendance detail')
          setAttendanceDetailData([])
        }
      } catch (error) {
        console.error('Error fetching attendance detail:', error)
        setAttendanceDetailData([])
      } finally {
        setIsLoadingAttendanceDetail(false)
      }
    },
    [attendanceFilters.year, attendanceFilters.month],
  )

  const handleViewAttendanceDetail = (character: any) => {
    setSelectedAttendanceCharacter(character)
    setIsAttendanceDetailModalOpen(true)
    fetchAttendanceDetail(character.id)
  }

  // Sort handler for attendance table
  const handleAttendanceSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'

    if (
      attendanceSortConfig.key === key &&
      attendanceSortConfig.direction === 'asc'
    ) {
      direction = 'desc'
    }

    setAttendanceSortConfig({ key, direction })
  }

  // Sort handler for character management table
  const handleCharacterSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'

    if (
      characterSortConfig.key === key &&
      characterSortConfig.direction === 'asc'
    ) {
      direction = 'desc'
    }

    setCharacterSortConfig({ key, direction })
  }

  // Function to get sorted attendance data
  const getSortedAttendanceData = () => {
    if (!attendanceData?.reports) return []

    const sortedReports = [...attendanceData.reports]

    if (attendanceSortConfig.key === 'attendanceRate') {
      sortedReports.sort((a, b) => {
        const aRate = parseFloat(a.attendance.attendanceRate)
        const bRate = parseFloat(b.attendance.attendanceRate)

        if (attendanceSortConfig.direction === 'asc') {
          return aRate - bRate
        } else {
          return bRate - aRate
        }
      })
    }

    return sortedReports
  }

  // Function to get sorted character data
  const getSortedCharacterData = () => {
    if (!charactersData?.characters) return []

    const sortedCharacters = [...charactersData.characters]

    if (characterSortConfig.key === 'xeny') {
      sortedCharacters.sort((a, b) => {
        const aXeny = a.user.userXeny?.currentXeny || 0
        const bXeny = b.user.userXeny?.currentXeny || 0

        if (characterSortConfig.direction === 'asc') {
          return aXeny - bXeny
        } else {
          return bXeny - aXeny
        }
      })
    }

    return sortedCharacters
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size={40} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-red-500">เกิดข้อผิดพลาด: {error.message}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">จัดการบุคลากร</h2>
        <p className="text-gray-600">
          ตั้งค่าเงินเดือน เวลาการทำงาน และรายงานการเข้างาน
        </p>
      </div>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.TabList>
          <Tabs.TabNav value="management">จัดการบุคลากร</Tabs.TabNav>
          <Tabs.TabNav value="attendance">รายงานการเข้างาน</Tabs.TabNav>
        </Tabs.TabList>

        {/* Tab 1: Character Management */}
        <Tabs.TabContent value="management">
          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Input
                  ref={searchInputRef}
                  key="character-search-input"
                  placeholder="ค้นหาด้วยชื่อหรืออีเมล"
                  prefix={<HiOutlineSearch />}
                  value={searchInput}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="sm:w-64"
                />
                <Select
                  placeholder="เลือกอาชีพ"
                  value={
                    filters.jobClassId
                      ? {
                          value: filters.jobClassId,
                          label: jobClasses?.find(
                            (j: JobClassType) => j.id === filters.jobClassId,
                          )?.name,
                        }
                      : null
                  }
                  onChange={(option) =>
                    handleJobClassFilter(option?.value?.toString() ?? null)
                  }
                  className="sm:w-48"
                  options={[
                    { value: '', label: 'ทั้งหมด' },
                    ...(jobClasses?.map((jobClass: JobClassType) => ({
                      value: jobClass.id,
                      label: jobClass.name,
                    })) || []),
                  ]}
                />
              </div>
              
              {/* Bulk Delete Controls */}
              <div className="flex gap-2">
                {isBulkDeleteMode && (
                  <Button
                    size="sm"
                    variant="solid"
                    color="red-600"
                    onClick={handleBulkDelete}
                    disabled={selectedCharacterIds.length === 0}
                    loading={bulkDeleteCharacters.isPending}
                  >
                    <HiOutlineTrash className="mr-2" />
                    ลบที่เลือก ({selectedCharacterIds.length})
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isBulkDeleteMode ? "solid" : "default"}
                  color={isBulkDeleteMode ? "gray-600" : "red-600"}
                  onClick={toggleBulkDeleteMode}
                >
                  {isBulkDeleteMode ? (
                    <>
                      <HiOutlineCheck className="mr-2" />
                      เสร็จสิ้น
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <HiOutlineTrash className="mr-2" />
                      ลบแบบหลายคน
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Character Table */}
          <Card>
            <Table>
              <THead>
                <Tr>
                  {isBulkDeleteMode && (
                    <Th className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          getSortedCharacterData().length > 0 &&
                          selectedCharacterIds.length === getSortedCharacterData().length
                        }
                        onChange={(e) => handleSelectAllCharacters(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </Th>
                  )}
                  <Th>บุคลากร</Th>
                  <Th>อาชีพ</Th>
                  <Th>ระดับอาชีพ</Th>
                  <Th
                    className="cursor-pointer select-none hover:bg-gray-700 transition-colors"
                    onClick={() => handleCharacterSort('xeny')}
                  >
                    <div className="flex items-center gap-2">
                      Xeny
                      <Sorter
                        sort={
                          characterSortConfig.key === 'xeny'
                            ? characterSortConfig.direction
                            : false
                        }
                      />
                    </div>
                  </Th>
                  <Th>เวลาเข้างาน</Th>
                  <Th>เวลาออกงาน</Th>
                  <Th className="text-right">เงินเดือน</Th>
                  <Th></Th>
                </Tr>
              </THead>
              <TBody>
                {getSortedCharacterData().map((character: CharacterType) => (
                  <Tr key={character.id}>
                    {isBulkDeleteMode && (
                      <Td>
                        <input
                          type="checkbox"
                          checked={selectedCharacterIds.includes(character.id)}
                          onChange={(e) => handleSelectCharacter(character.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </Td>
                    )}
                    <Td>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/management/characters/${character.id}`}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <Avatar
                            src={
                              character.currentPortraitUrl ||
                              character.user.avatar ||
                              ''
                            }
                            alt={character.name}
                            shape="circle"
                            size={40}
                          />
                        </Link>
                        <div>
                          <div className="font-medium text-white">
                            <Link
                              href={`/management/characters/${character.id}`}
                              className="hover:text-blue-400 transition-colors"
                            >
                              {character.name}
                            </Link>
                          </div>
                          <div className="text-sm text-white-500">
                            <Link
                              href={`/management/characters/${character.id}`}
                              className="hover:text-blue-400 transition-colors"
                            >
                              {character.user.email}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-white">{character.jobClass.name}</Td>
                    <Td className="text-white">
                      {character.currentJobLevel.title}
                    </Td>
                    <Td>
                      <span
                        className={`font-medium ${getXenyColor(character.user.userXeny?.currentXeny)}`}
                      >
                        {formatXeny(character.user.userXeny?.currentXeny)} Xeny
                      </span>
                    </Td>
                    <Td className="text-white">
                      {character.workStartTime || '-'}
                    </Td>
                    <Td className="text-white">
                      {character.workEndTime || '-'}
                    </Td>
                    <Td className="text-right font-medium text-white">
                      {formatSalary(character.salary)}
                    </Td>
                    <Td>
                      <Dropdown
                        renderTitle={
                          <Button
                            size="sm"
                            variant="plain"
                            icon={<HiOutlineDotsVertical />}
                          >
                            จัดการ
                          </Button>
                        }
                        placement="bottom-end"
                      >
                        <Dropdown.Item onClick={() => handleEdit(character)}>
                          <div className="flex items-center gap-2">
                            <HiOutlinePencil className="text-base" />
                            <span>เงินเดือน, เวลางาน</span>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleJobEdit(character)}>
                          <div className="flex items-center gap-2">
                            <HiOutlineBriefcase className="text-base" />
                            <span>แก้ไขอาชีพ</span>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleXenyEdit(character)}
                        >
                          <div className="flex items-center gap-2">
                            <HiOutlineMinus className="text-base" />
                            <span>หัก Xeny</span>
                          </div>
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleDeleteCharacter(character)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <div className="flex items-center gap-2">
                            <HiOutlineTrash className="text-base" />
                            <span>ลบบุคลากร</span>
                          </div>
                        </Dropdown.Item>
                      </Dropdown>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>

            {getSortedCharacterData().length === 0 && (
              <div className="text-center py-12 text-white-500">
                ไม่พบข้อมูลบุคลากร
              </div>
            )}
          </Card>
        </Tabs.TabContent>

        {/* Tab 2: Attendance Report */}
        <Tabs.TabContent value="attendance">
          {/* Attendance Filters */}
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Select
                placeholder="เลือกปี"
                value={{
                  value: attendanceFilters.year,
                  label: attendanceFilters.year.toString(),
                }}
                onChange={(option) =>
                  handleAttendanceFilterChange(
                    'year',
                    option?.value || new Date().getFullYear(),
                  )
                }
                className="sm:w-32"
                options={Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return { value: year, label: year.toString() }
                })}
              />
              <Select
                placeholder="เลือกเดือน"
                value={{
                  value: attendanceFilters.month,
                  label: [
                    'มกราคม',
                    'กุมภาพันธ์',
                    'มีนาคม',
                    'เมษายน',
                    'พฤษภาคม',
                    'มิถุนายน',
                    'กรกฎาคม',
                    'สิงหาคม',
                    'กันยายน',
                    'ตุลาคม',
                    'พฤศจิกายน',
                    'ธันวาคม',
                  ][attendanceFilters.month - 1],
                }}
                onChange={(option) =>
                  handleAttendanceFilterChange(
                    'month',
                    option?.value || new Date().getMonth() + 1,
                  )
                }
                className="sm:w-40"
                options={[
                  'มกราคม',
                  'กุมภาพันธ์',
                  'มีนาคม',
                  'เมษายน',
                  'พฤษภาคม',
                  'มิถุนายน',
                  'กรกฎาคม',
                  'สิงหาคม',
                  'กันยายน',
                  'ตุลาคม',
                  'พฤศจิกายน',
                  'ธันวาคม',
                ].map((month, index) => ({
                  value: index + 1,
                  label: month,
                }))}
              />
              <Select
                placeholder="เลือกสายอาชีพ"
                value={
                  attendanceFilters.jobClassId
                    ? {
                        value: attendanceFilters.jobClassId,
                        label: jobClasses?.find(
                          (j: JobClassType) =>
                            j.id === attendanceFilters.jobClassId,
                        )?.name,
                      }
                    : null
                }
                onChange={(option) =>
                  handleAttendanceFilterChange(
                    'jobClassId',
                    option?.value ?? null,
                  )
                }
                className="sm:w-40"
                options={[
                  { value: null, label: 'ทั้งหมด' },
                  ...(jobClasses?.map((jobClass: JobClassType) => ({
                    value: jobClass.id,
                    label: jobClass.name,
                  })) || []),
                ]}
              />
              <Select
                placeholder="เลือกบุคลากร (ทั้งหมด)"
                value={
                  attendanceFilters.characterId
                    ? {
                        value: attendanceFilters.characterId,
                        label: charactersData?.characters.find(
                          (c: CharacterType) =>
                            c.id === attendanceFilters.characterId,
                        )?.name,
                      }
                    : null
                }
                onChange={(option) =>
                  handleAttendanceFilterChange(
                    'characterId',
                    option?.value ?? null,
                  )
                }
                className="sm:w-48"
                options={[
                  { value: null, label: 'ทั้งหมด' },
                  ...(charactersData?.characters?.map(
                    (character: CharacterType) => ({
                      value: character.id,
                      label: character.name,
                    }),
                  ) || []),
                ]}
              />
            </div>
          </Card>

          {/* Attendance Report Content */}
          {isLoadingAttendance ? (
            <div className="flex justify-center items-center h-96">
              <Spinner size={40} />
            </div>
          ) : attendanceData ? (
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">
                  รายงานการเข้างาน {attendanceData.period?.monthName}
                </h3>
                {attendanceData.holidays?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      วันหยุดในเดือนนี้:{' '}
                      {attendanceData.holidays.map((h) => h.name).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              <Table>
                <THead>
                  <Tr>
                    <Th>บุคลากร</Th>
                    <Th>วันทำงาน</Th>
                    <Th>เข้างาน</Th>
                    <Th>ออกงาน</Th>
                    <Th>มาสาย</Th>
                    <Th>ขาดงาน</Th>
                    <Th
                      className="cursor-pointer select-none hover:bg-gray-700 transition-colors"
                      onClick={() => handleAttendanceSort('attendanceRate')}
                    >
                      <div className="flex items-center gap-2">
                        เปอร์เซ็นต์การเข้างาน
                        <Sorter
                          sort={
                            attendanceSortConfig.key === 'attendanceRate'
                              ? attendanceSortConfig.direction
                              : false
                          }
                        />
                      </div>
                    </Th>
                    <Th>การจัดการ</Th>
                  </Tr>
                </THead>
                <TBody>
                  {getSortedAttendanceData().map((report) => (
                    <Tr key={report.character.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/management/characters/${report.character.id}`}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <Avatar
                              src={
                                report.character.currentPortraitUrl ||
                                report.character.avatar ||
                                ''
                              }
                              alt={report.character.name}
                              shape="circle"
                              size={32}
                            />
                          </Link>
                          <div>
                            <div className="font-medium text-white">
                              <Link
                                href={`/management/characters/${report.character.id}`}
                                className="hover:text-blue-400 transition-colors"
                              >
                                {report.character.name}
                              </Link>
                            </div>
                            <div className="text-xs text-gray-400">
                              <Link
                                href={`/management/characters/${report.character.id}`}
                                className="hover:text-blue-400 transition-colors"
                              >
                                {report.character.jobClass}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="font-medium text-blue-400">
                          {report.attendance.workDaysInMonth}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-medium text-green-400">
                          {report.attendance.checkinDays}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-medium text-green-400">
                          {report.attendance.checkoutDays}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-medium text-yellow-400">
                          {report.attendance.lateDays}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-medium text-red-400">
                          {report.attendance.absentDays}
                        </span>
                      </Td>
                      <Td className="text-white">
                        <span
                          className={`font-medium ${
                            parseFloat(report.attendance.attendanceRate) >= 80
                              ? 'text-green-400'
                              : parseFloat(report.attendance.attendanceRate) >=
                                  60
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }`}
                        >
                          {report.attendance.attendanceRate}%
                        </span>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="solid"
                          onClick={() =>
                            handleViewAttendanceDetail(report.character)
                          }
                        >
                          ดูบันทึกการเข้าออกงาน
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>

              {getSortedAttendanceData().length === 0 && (
                <div className="text-center py-12 text-white-500">
                  ไม่พบข้อมูลการเข้างานในช่วงเวลาที่เลือก
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12 text-white-500">
                กรุณาเลือกเดือนและปีเพื่อดูรายงานการเข้างาน
              </div>
            </Card>
          )}
        </Tabs.TabContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedCharacter(null)
          setWorkSettings({
            workStartTime: '',
            workEndTime: '',
            salary: '',
            workDays: [],
          })
        }}
        onRequestClose={() => {
          setIsEditDialogOpen(false)
          setSelectedCharacter(null)
          setWorkSettings({
            workStartTime: '',
            workEndTime: '',
            salary: '',
            workDays: [],
          })
        }}
      >
        <h5 className="mb-4">ตั้งค่าการทำงาน</h5>
        {selectedCharacter && (
          <Form onSubmit={handleSaveWorkSettings}>
            <FormItem label="ชื่อบุคลากร" className="mb-4">
              <Input value={selectedCharacter.name} disabled />
            </FormItem>
            <hr />

            <FormItem label="เวลาเข้างาน" className="mt-4 mb-4">
              <Input
                type="time"
                value={workSettings.workStartTime}
                onChange={(e) =>
                  setWorkSettings((prev) => ({
                    ...prev,
                    workStartTime: e.target.value,
                  }))
                }
              />
            </FormItem>

            <FormItem label="เวลาออกงาน" className="mb-4">
              <Input
                type="time"
                value={workSettings.workEndTime}
                onChange={(e) =>
                  setWorkSettings((prev) => ({
                    ...prev,
                    workEndTime: e.target.value,
                  }))
                }
              />
            </FormItem>

            <FormItem label="เงินเดือน (บาท)" className="mb-4">
              <Input
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={workSettings.salary}
                onChange={(e) =>
                  setWorkSettings((prev) => ({
                    ...prev,
                    salary: e.target.value,
                  }))
                }
              />
            </FormItem>

            <FormItem label="วันทำงาน" className="mb-6">
              <div className="grid grid-cols-7 gap-2">
                {[
                  { value: 0, label: 'อา', fullName: 'อาทิตย์' },
                  { value: 1, label: 'จ', fullName: 'จันทร์' },
                  { value: 2, label: 'อ', fullName: 'อังคาร' },
                  { value: 3, label: 'พ', fullName: 'พุธ' },
                  { value: 4, label: 'พฤ', fullName: 'พฤหัสบดี' },
                  { value: 5, label: 'ศ', fullName: 'ศุกร์' },
                  { value: 6, label: 'ส', fullName: 'เสาร์' },
                ].map((day) => {
                  const isSelected = workSettings.workDays.includes(day.value)
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        setWorkSettings((prev) => ({
                          ...prev,
                          workDays: isSelected
                            ? prev.workDays.filter((d) => d !== day.value)
                            : [...prev.workDays, day.value].sort(),
                        }))
                      }}
                      className={`
                        h-10 rounded-lg border text-sm font-medium transition-colors
                        ${
                          isSelected
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }
                      `}
                      title={day.fullName}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                เลือกวันที่ต้องการให้บุคลากรคนนี้ทำงาน (ค่าเริ่มต้น:
                จันทร์-ศุกร์)
              </p>
            </FormItem>

            <div className="">
              <Button
                className="w-full"
                variant="solid"
                type="submit"
                loading={updateWorkSettings.isPending}
              >
                บันทึก
              </Button>
            </div>
          </Form>
        )}
      </Dialog>

      {/* Job Edit Dialog */}
      <Dialog
        isOpen={isJobEditDialogOpen}
        onClose={() => {
          setIsJobEditDialogOpen(false)
          setSelectedCharacter(null)
          setJobSettings({ jobClassId: 0, jobLevelId: 0 })
          setAvailableJobLevels([])
        }}
        onRequestClose={() => {
          setIsJobEditDialogOpen(false)
          setSelectedCharacter(null)
          setJobSettings({ jobClassId: 0, jobLevelId: 0 })
          setAvailableJobLevels([])
        }}
      >
        <h5 className="mb-4">แก้ไขอาชีพ</h5>
        {selectedCharacter && (
          <Form onSubmit={handleSaveJob}>
            <FormItem label="ชื่อบุคลากร" className="mb-4">
              <Input value={selectedCharacter.name} disabled />
            </FormItem>
            <FormItem label="ระดับตัวละคร" className="mb-4">
              <Input value={`Level ${selectedCharacter.level}`} disabled />
            </FormItem>
            <hr />

            <FormItem label="อาชีพ" className="mt-4 mb-4">
              <Select
                placeholder="เลือกอาชีพ"
                value={
                  jobSettings.jobClassId
                    ? {
                        value: jobSettings.jobClassId,
                        label: jobClasses?.find(
                          (j: JobClassType) => j.id === jobSettings.jobClassId,
                        )?.name,
                      }
                    : null
                }
                onChange={(option) => handleJobClassChange(option?.value || 0)}
                options={
                  jobClasses?.map((jobClass: JobClassType) => ({
                    value: jobClass.id,
                    label: jobClass.name,
                  })) || []
                }
              />
            </FormItem>

            <FormItem label="ระดับอาชีพ" className="mb-6">
              <Input
                value={
                  jobSettings.jobLevelId && availableJobLevels.length > 0
                    ? `${availableJobLevels.find((l) => l.id === jobSettings.jobLevelId)?.title || ''} (ต้องการ Level ${availableJobLevels.find((l) => l.id === jobSettings.jobLevelId)?.requiredCharacterLevel || ''})`
                    : 'เลือกอาชีพก่อน'
                }
                disabled
                placeholder="ระบบจะเลือกระดับที่เหมาะสมให้อัตโนมัติ"
              />
            </FormItem>

            <div className="">
              <Button
                className="w-full"
                variant="solid"
                type="submit"
                loading={updateCharacterJob.isPending}
                disabled={!jobSettings.jobClassId || !jobSettings.jobLevelId}
              >
                บันทึก
              </Button>
            </div>
          </Form>
        )}
      </Dialog>

      {/* Xeny Deduct Dialog */}
      <Dialog
        isOpen={isXenyDialogOpen}
        onClose={() => {
          setIsXenyDialogOpen(false)
          setSelectedCharacter(null)
          setXenySettings({ amount: '', description: '' })
        }}
        onRequestClose={() => {
          setIsXenyDialogOpen(false)
          setSelectedCharacter(null)
          setXenySettings({ amount: '', description: '' })
        }}
      >
        <h5 className="mb-4">หัก Xeny</h5>
        {selectedCharacter && (
          <Form onSubmit={handleSaveXeny}>
            <FormItem label="ชื่อบุคลากร" className="mb-4">
              <Input value={selectedCharacter.name} disabled />
            </FormItem>
            <FormItem label="Xeny ปัจจุบัน" className="mb-4">
              <Input
                value={`${selectedCharacter.user.userXeny?.currentXeny || 0} Xeny`}
                disabled
              />
            </FormItem>
            <hr />

            <FormItem label="จำนวนที่จะหัก" className="mt-4 mb-4">
              <Input
                type="number"
                placeholder="จำนวน Xeny"
                min="1"
                value={xenySettings.amount}
                onChange={(e) =>
                  setXenySettings((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                required
              />
            </FormItem>

            <FormItem label="เหตุผล" className="mb-6">
              <Input
                placeholder="เหตุผลในการหัก Xeny"
                value={xenySettings.description}
                onChange={(e) =>
                  setXenySettings((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
            </FormItem>

            <div className="">
              <Button
                className="w-full"
                variant="solid"
                type="submit"
                loading={deductXeny.isPending}
                disabled={!xenySettings.amount || !xenySettings.description}
              >
                หัก Xeny
              </Button>
            </div>
          </Form>
        )}
      </Dialog>

      {/* Attendance Detail Modal */}
      <Dialog
        isOpen={isAttendanceDetailModalOpen}
        onClose={() => {
          setIsAttendanceDetailModalOpen(false)
          setSelectedAttendanceCharacter(null)
          setAttendanceDetailData([])
        }}
        onRequestClose={() => {
          setIsAttendanceDetailModalOpen(false)
          setSelectedAttendanceCharacter(null)
          setAttendanceDetailData([])
        }}
        className="max-w-4xl"
      >
        <div className="mb-6">
          <h5 className="text-xl font-bold mb-2">บันทึกการเข้าออกงาน</h5>
          {selectedAttendanceCharacter && (
            <div className="flex items-center gap-3">
              <Avatar
                src={
                  selectedAttendanceCharacter.currentPortraitUrl ||
                  selectedAttendanceCharacter.avatar ||
                  ''
                }
                alt={selectedAttendanceCharacter.name}
                shape="circle"
                size={40}
              />
              <div>
                <div className="font-medium text-white">
                  {selectedAttendanceCharacter.name}
                </div>
                <div className="text-sm text-gray-400">
                  {selectedAttendanceCharacter.jobClass}
                </div>
              </div>
            </div>
          )}
          <div className="text-sm text-gray-400 mt-2">
            {attendanceData?.period?.monthName}
          </div>
        </div>

        {isLoadingAttendanceDetail ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size={40} />
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {attendanceDetailData.length > 0 ? (
              attendanceDetailData.map((record: any, index: number) => (
                <Card key={record.id || index} className="p-6">
                  <div className="space-y-4">
                    {/* Header with Date and Status */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-lg font-semibold text-white">
                        {new Date(record.checkinAt).toLocaleDateString(
                          'th-TH',
                          {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          },
                        )}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          record.checkinType === 'onsite'
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {record.checkinType === 'onsite'
                          ? 'ในสถานที่'
                          : 'นอกสถานที่'}
                      </div>
                      {record.lateLevel > 0 && (
                        <div className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium">
                          สาย {record.lateMinutes} นาที
                        </div>
                      )}
                    </div>

                    {/* Time Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Check-in */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Check-in</p>
                        <p className="font-medium text-white flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-400" />
                          {new Date(record.checkinAt).toLocaleTimeString(
                            'th-TH',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </p>
                      </div>

                      {/* Check-out */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Check-out</p>
                        <p className="font-medium text-white flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          {record.checkoutAt ? (
                            <span className="flex items-center gap-2">
                              {new Date(record.checkoutAt).toLocaleTimeString(
                                'th-TH',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                              {(record.isAutoCheckout === true ||
                                record.isAutoCheckout === 1 ||
                                record.notes?.includes('[AUTO CHECKOUT]')) && (
                                <span className="text-blue-400 text-xs bg-blue-900 px-2 py-1 rounded">
                                  Auto
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-red-400">ลืม Checkout</span>
                          )}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">ระยะเวลา</p>
                        <p className="font-medium text-white">
                          {record.totalHours
                            ? `${record.totalHours.toFixed(1)} ชั่วโมง`
                            : '-'}
                        </p>
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">สถานที่</p>
                        <p className="font-medium text-white flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {record.workLocation ? (
                            <span className="text-gray-300">
                              {record.workLocation.name}
                            </span>
                          ) : (
                            <span className="text-gray-500">ไม่ระบุ</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Photos */}
                    {(record.checkinPhotoUrl || record.checkoutPhotoUrl) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {record.checkinPhotoUrl && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                              <Camera className="h-4 w-4" />
                              รูป Check-in
                            </p>
                            <div className="aspect-[4/3] bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                              <img
                                src={record.checkinPhotoUrl}
                                alt="Check-in"
                                className="w-full h-full object-cover"
                                onClick={() =>
                                  window.open(record.checkinPhotoUrl, '_blank')
                                }
                              />
                            </div>
                          </div>
                        )}

                        {record.checkoutPhotoUrl && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                              <Camera className="h-4 w-4" />
                              รูป Check-out
                            </p>
                            <div className="aspect-[4/3] bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                              <img
                                src={record.checkoutPhotoUrl}
                                alt="Check-out"
                                className="w-full h-full object-cover"
                                onClick={() =>
                                  window.open(record.checkoutPhotoUrl, '_blank')
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                      <div className="pt-4 border-t border-gray-600">
                        <p className="text-sm text-gray-400 mb-2">หมายเหตุ</p>
                        <p className="text-sm text-gray-300">
                          {record.notes
                            .replace('[AUTO CHECKOUT] ', '')
                            .replace('[AUTO CHECKOUT]', '')}
                        </p>
                      </div>
                    )}

                    {/* Auto Checkout Note */}
                    {record.autoCheckoutNote && (
                      <div className="pt-2">
                        <p className="text-sm text-blue-400">
                          <span className="font-medium">Auto Checkout:</span>{' '}
                          {record.autoCheckoutNote}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                ไม่พบบันทึกการเข้าออกงานในเดือนนี้
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCharacterToDelete(null)
        }}
        onRequestClose={() => {
          setIsDeleteDialogOpen(false)
          setCharacterToDelete(null)
        }}
      >
        <h5 className="mb-4 text-red-600">ยืนยันการลบบุคลากร</h5>
        {characterToDelete && (
          <div>
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Avatar
                  src={
                    characterToDelete.currentPortraitUrl ||
                    characterToDelete.user.avatar ||
                    ''
                  }
                  alt={characterToDelete.name}
                  shape="circle"
                  size={40}
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {characterToDelete.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {characterToDelete.user.email}
                  </div>
                </div>
              </div>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ การดำเนินการนี้จะลบข้อมูลทั้งหมดของบุคลากรและผู้ใช้งานอย่างถาวร
              </p>
            </div>
            
            <p className="text-gray-700 mb-6">
              คุณแน่ใจหรือไม่ที่จะลบบุคลากร <strong>{characterToDelete.name}</strong>? 
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </p>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant="plain"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setCharacterToDelete(null)
                }}
              >
                ยกเลิก
              </Button>
              <Button
                className="flex-1"
                variant="solid"
                color="red-600"
                onClick={confirmDeleteCharacter}
                loading={deleteCharacter.isPending}
              >
                ลบบุคลากร
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        isOpen={isConfirmBulkDeleteOpen}
        onClose={() => setIsConfirmBulkDeleteOpen(false)}
        onRequestClose={() => setIsConfirmBulkDeleteOpen(false)}
      >
        <h5 className="mb-4 text-red-600">ยืนยันการลบบุคลากรหลายคน</h5>
        <div>
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium mb-2">
              ⚠️ การดำเนินการนี้จะลบข้อมูลทั้งหมดของบุคลากรและผู้ใช้งานอย่างถาวร
            </p>
            <p className="text-sm text-gray-600">
              จำนวนบุคลากรที่จะถูกลบ: <strong>{selectedCharacterIds.length}</strong> คน
            </p>
          </div>

          <div className="mb-4 max-h-48 overflow-y-auto">
            <p className="text-sm font-medium text-gray-700 mb-2">รายชื่อบุคลากรที่จะถูกลบ:</p>
            <div className="space-y-2">
              {getSortedCharacterData()
                .filter(c => selectedCharacterIds.includes(c.id))
                .map(character => (
                  <div key={character.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Avatar
                      src={
                        character.currentPortraitUrl ||
                        character.user.avatar ||
                        ''
                      }
                      alt={character.name}
                      shape="circle"
                      size={24}
                    />
                    <div className="text-sm">
                      <span className="font-medium">{character.name}</span>
                      <span className="text-gray-500 ml-2">({character.user.email})</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            คุณแน่ใจหรือไม่ที่จะลบบุคลากรทั้งหมดที่เลือก? 
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </p>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              variant="plain"
              onClick={() => setIsConfirmBulkDeleteOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              className="flex-1"
              variant="solid"
              color="red-600"
              onClick={confirmBulkDelete}
              loading={bulkDeleteCharacters.isPending}
            >
              ลบบุคลากรทั้งหมด ({selectedCharacterIds.length})
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default CharacterManagementPage
