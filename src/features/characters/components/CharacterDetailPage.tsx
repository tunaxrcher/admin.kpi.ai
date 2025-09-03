'use client'

import React, { useState, useCallback } from 'react'
import {
  Card,
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
  Badge,
} from '../../../components/ui'
import {
  HiOutlinePencil,
  HiOutlineBriefcase,
  HiOutlineMinus,
  HiOutlineDotsVertical,
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
} from 'react-icons/hi'
import {
  useCharacter,
  useUpdateCharacterWorkSettings,
  useUpdateCharacterJob,
  useDeductXeny,
} from '../hooks/useCharacters'
import {
  CharacterWithRelations,
  UpdateCharacterWorkSettingsRequest,
  UpdateCharacterJobRequest,
  DeductXenyRequest,
} from '../types'
import { useJobClasses } from '../../jobs/hooks/api'
import { Camera, Clock, MapPin, Trophy, Star, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface JobClassType {
  id: number
  name: string
}

interface MonthlyEvaluation {
  id: number
  month: number
  year: number
  status: string
  evaluation?: string | null
  summary?: string | null
  strengths?: string | null
  weaknesses?: string | null
  improvements?: string | null
  isPassed?: boolean | null
  totalSubmissions: number
  evaluatedAt?: string | null
  createdAt: string
  updatedAt: string
}

interface CharacterDetailPageProps {
  characterId: number
}

const CharacterDetailPage: React.FC<CharacterDetailPageProps> = ({
  characterId,
}) => {
  const router = useRouter()
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
  const [activeTab, setActiveTab] = useState('overview')
  const [attendanceFilters, setAttendanceFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
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
      records?: {
        id: number
        checkinAt: string
        checkoutAt?: string | null
        checkinPhotoUrl?: string | null
        checkoutPhotoUrl?: string | null
        totalHours?: number | null
        lateLevel: number
        lateMinutes: number
        checkinType: string
        isAutoCheckout: boolean
        autoCheckoutNote?: string | null
        notes?: string | null
        workLocation?: { id: number; name: string } | null
      }[]
    }>
  } | null>(null)
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)
  const [evaluations, setEvaluations] = useState<MonthlyEvaluation[]>([])
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false)

  const { data: character, isLoading, error } = useCharacter(characterId)
  const { data: jobClasses } = useJobClasses()
  const updateWorkSettings = useUpdateCharacterWorkSettings()
  const updateCharacterJob = useUpdateCharacterJob()
  const deductXeny = useDeductXeny()

  // Fetch monthly evaluations
  const fetchEvaluations = useCallback(async () => {
    setIsLoadingEvaluations(true)
    try {
      const response = await fetch(`/api/characters/${characterId}/evaluations`)
      if (response.ok) {
        const data = await response.json()
        setEvaluations(data.data || [])
      } else {
        console.error('Failed to fetch evaluations')
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    } finally {
      setIsLoadingEvaluations(false)
    }
  }, [characterId])

  // Fetch attendance report
  const fetchAttendanceReport = useCallback(async () => {
    setIsLoadingAttendance(true)
    try {
      const params = new URLSearchParams({
        year: attendanceFilters.year.toString(),
        month: attendanceFilters.month.toString(),
        characterId: characterId.toString(),
      })

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
  }, [characterId, attendanceFilters])

  // Load data when component mounts or tab changes
  React.useEffect(() => {
    if (activeTab === 'evaluations') {
      fetchEvaluations()
    } else if (activeTab === 'attendance') {
      fetchAttendanceReport()
    }
  }, [activeTab, fetchEvaluations, fetchAttendanceReport])

  // Load attendance report when filters change
  React.useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceReport()
    }
  }, [attendanceFilters, fetchAttendanceReport, activeTab])

  const handleEdit = (character: CharacterWithRelations) => {
    setSelectedCharacter(character)
    setWorkSettings({
      workStartTime: character.workStartTime || '',
      workEndTime: character.workEndTime || '',
      salary: character.salary?.toString() || '',
      workDays: (character.workDays as number[]) || [1, 2, 3, 4, 5],
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
    if (character) {
      try {
        const response = await fetch(
          `/api/jobs/${jobClassId}/levels?characterLevel=${character.level}&currentJobLevel=${character.currentJobLevel.level}`,
        )
        if (response.ok) {
          const levels = await response.json()
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
    if (character) {
      const data: UpdateCharacterWorkSettingsRequest = {
        workStartTime: workSettings.workStartTime || null,
        workEndTime: workSettings.workEndTime || null,
        salary: workSettings.salary ? parseFloat(workSettings.salary) : null,
        workDays:
          workSettings.workDays.length > 0 ? workSettings.workDays : null,
      }

      updateWorkSettings.mutate(
        { id: character.id, data },
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
    if (character && jobSettings.jobClassId && jobSettings.jobLevelId) {
      const data: UpdateCharacterJobRequest = {
        jobClassId: jobSettings.jobClassId,
        jobLevelId: jobSettings.jobLevelId,
      }

      updateCharacterJob.mutate(
        { id: character.id, data },
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
    if (character && xenySettings.amount && xenySettings.description) {
      const data: DeductXenyRequest = {
        amount: parseInt(xenySettings.amount),
        description: xenySettings.description,
      }

      deductXeny.mutate(
        { id: character.id, data },
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

  const formatSalary = (salary: number | null) => {
    if (!salary) return '-'
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(salary)
  }

  const handleAttendanceFilterChange = (
    key: string,
    value: string | number | null,
  ) => {
    setAttendanceFilters((prev) => ({ ...prev, [key]: value }))
  }

  const getEvaluationStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white'
      case 'processing':
        return 'bg-blue-600 text-white'
      case 'failed':
        return 'bg-red-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getEvaluationStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'เสร็จสิ้น'
      case 'processing':
        return 'กำลังประมวลผล'
      case 'failed':
        return 'ล้มเหลว'
      default:
        return 'รอดำเนินการ'
    }
  }

  const getMonthName = (month: number) => {
    const months = [
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
    ]
    return months[month - 1] || 'ไม่ทราบ'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size={40} />
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <p className="text-red-500 mb-4">
          เกิดข้อผิดพลาด: {error?.message || 'ไม่พบข้อมูลบุคลากร'}
        </p>
        <Button onClick={() => router.back()}>กลับ</Button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="plain"
            size="sm"
            icon={<HiOutlineArrowLeft />}
            onClick={() => router.back()}
          >
            กลับ
          </Button>
          <h2 className="text-2xl font-bold">รายละเอียดบุคลากร</h2>
        </div>
      </div>

      {/* Character Overview - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 relative">
        {/* Management Button - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <Dropdown
            renderTitle={
              <Button
                size="md"
                variant="solid"
                icon={<HiOutlineDotsVertical />}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
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
            <Dropdown.Item onClick={() => handleXenyEdit(character)}>
              <div className="flex items-center gap-2">
                <HiOutlineMinus className="text-base" />
                <span>หัก Xeny</span>
              </div>
            </Dropdown.Item>
          </Dropdown>
        </div>

        {/* Left Column - Profile (Outside Card) */}
        <div className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <Avatar
              src={
                character.currentPortraitUrl ||
                character.user.avatar ||
                ''
              }
              alt={character.name}
              shape="circle"
              size={200}
              className="mb-6"
            />
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-3">
                {character.name}
              </h3>
              <p className="text-gray-400 mb-4 text-lg">{character.user.email}</p>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-blue-400">
                  Level {character.level}
                </p>
                <p className="text-lg font-medium text-purple-400">
                  {character.jobClass.name}
                </p>
                <p className="text-sm text-gray-400">
                  {character.currentJobLevel.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details Card */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* XP Stats */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="h-6 w-6 text-yellow-400" />
                    <span className="text-lg font-medium text-gray-400">Experience Points</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {character.currentXP.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    ถัดไป: {character.nextLevelXP.toLocaleString()} XP
                  </p>
                  <div className="mt-3 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (character.currentXP / character.nextLevelXP) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Xeny */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <HiOutlineCurrencyDollar className="h-6 w-6 text-green-400" />
                    <span className="text-lg font-medium text-gray-400">Xeny Balance</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {character.user.userXeny?.currentXeny || 0}
                  </p>
                  <p className="text-sm text-gray-500">
                    รวมได้รับ: {character.user.userXeny?.totalEarnedXeny || 0}
                  </p>
                </div>

                {/* Work Hours */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <HiOutlineClock className="h-6 w-6 text-blue-400" />
                    <span className="text-lg font-medium text-gray-400">เวลาทำงาน</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">
                    {character.workStartTime || '-'} - {character.workEndTime || '-'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {character.workDays && Array.isArray(character.workDays) 
                      ? character.workDays
                          .map((day: number) => {
                            const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
                            return days[day]
                          })
                          .join(', ')
                      : 'ไม่ได้กำหนดวันทำงาน'}
                  </p>
                </div>

                {/* Salary */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <HiOutlineCurrencyDollar className="h-6 w-6 text-emerald-400" />
                    <span className="text-lg font-medium text-gray-400">เงินเดือน</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">
                    {formatSalary(character.salary)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {character.salary ? 'ต่อเดือน' : 'ยังไม่ได้กำหนด'}
                  </p>
                </div>
              </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.TabList>
          <Tabs.TabNav value="overview">ภาพรวม</Tabs.TabNav>
          <Tabs.TabNav value="attendance">รายงานการเข้างาน</Tabs.TabNav>
          <Tabs.TabNav value="evaluations">ผลประเมิน</Tabs.TabNav>
        </Tabs.TabList>

        {/* Overview Tab */}
        <Tabs.TabContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/* Character Stats */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-6">สถิติตัวละคร</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">AGI (ความคล่องแคล่ว)</span>
                  <span className="font-medium text-white text-lg">{character.statAGI}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">STR (พลัง)</span>
                  <span className="font-medium text-white text-lg">{character.statSTR}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">DEX (ความแม่นยำ)</span>
                  <span className="font-medium text-white text-lg">{character.statDEX}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">VIT (ความแข็งแกร่ง)</span>
                  <span className="font-medium text-white text-lg">{character.statVIT}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">INT (สติปัญญา)</span>
                  <span className="font-medium text-white text-lg">{character.statINT}</span>
                </div>
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-600">
                  <span className="text-gray-400">Stat Points ที่เหลือ</span>
                  <span className="font-medium text-white text-lg">{character.statPoints}</span>
                </div>
              </div>
            </Card>

            {/* Work Settings */}
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-6">การตั้งค่าการทำงาน</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">เวลาเข้างาน</span>
                  <span className="font-medium text-white">
                    {character.workStartTime || 'ไม่ได้กำหนด'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">เวลาออกงาน</span>
                  <span className="font-medium text-white">
                    {character.workEndTime || 'ไม่ได้กำหนด'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">วันทำงาน</span>
                  <span className="font-medium text-white">
                    {character.workDays && Array.isArray(character.workDays) 
                      ? character.workDays
                          .map((day: number) => {
                            const days = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
                            return days[day]
                          })
                          .join(', ')
                      : 'ไม่ได้กำหนด'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">เงินเดือน</span>
                  <span className="font-medium text-white">
                    {formatSalary(character.salary)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </Tabs.TabContent>

        {/* Attendance Tab */}
        <Tabs.TabContent value="attendance">
          {/* Attendance Filters */}
          <Card className="mb-8 p-6 mt-6">
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
                  label: getMonthName(attendanceFilters.month),
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
            </div>
          </Card>

          {/* Attendance Report */}
          {isLoadingAttendance ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size={40} />
            </div>
          ) : attendanceData && attendanceData.reports.length > 0 ? (
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

              {/* Attendance Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-blue-900 p-4 rounded-lg text-center">
                  <p className="text-sm text-blue-300 mb-2">วันทำงาน</p>
                  <p className="text-2xl font-bold text-white">
                    {attendanceData.reports[0]?.attendance.workDaysInMonth}
                  </p>
                </div>
                <div className="bg-green-900 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-300 mb-2">เข้างาน</p>
                  <p className="text-2xl font-bold text-white">
                    {attendanceData.reports[0]?.attendance.checkinDays}
                  </p>
                </div>
                <div className="bg-green-900 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-300 mb-2">ออกงาน</p>
                  <p className="text-2xl font-bold text-white">
                    {attendanceData.reports[0]?.attendance.checkoutDays}
                  </p>
                </div>
                <div className="bg-yellow-900 p-4 rounded-lg text-center">
                  <p className="text-sm text-yellow-300 mb-2">มาสาย</p>
                  <p className="text-2xl font-bold text-white">
                    {attendanceData.reports[0]?.attendance.lateDays}
                  </p>
                </div>
                <div className="bg-red-900 p-4 rounded-lg text-center">
                  <p className="text-sm text-red-300 mb-2">ขาดงาน</p>
                  <p className="text-2xl font-bold text-white">
                    {attendanceData.reports[0]?.attendance.absentDays}
                  </p>
                </div>
                <div className="bg-purple-900 p-4 rounded-lg text-center">
                  <p className="text-sm text-purple-300 mb-2">เปอร์เซ็นต์</p>
                  <p className="text-2xl font-bold text-white">
                    {attendanceData.reports[0]?.attendance.attendanceRate}%
                  </p>
                </div>
              </div>

              {/* Detailed Records */}
              {attendanceData.reports[0]?.records && attendanceData.reports[0].records.length > 0 && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-white">บันทึกรายวัน</h4>
                  {attendanceData.reports[0].records.map((record: {
                    id: number
                    checkinAt: string
                    checkoutAt?: string | null
                    checkinPhotoUrl?: string | null
                    checkoutPhotoUrl?: string | null
                    totalHours?: number | null
                    lateLevel: number
                    lateMinutes: number
                    checkinType: string
                    isAutoCheckout: boolean
                    autoCheckoutNote?: string | null
                    notes?: string | null
                    workLocation?: { id: number; name: string } | null
                  }, index: number) => (
                    <Card key={record.id || index} className="p-6">
                      <div className="space-y-4">
                        {/* Header with Date and Status */}
                        <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-700">
                          <div className="text-lg font-semibold text-white">
                            {new Date(record.checkinAt).toLocaleDateString('th-TH', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              record.checkinType === 'onsite'
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {record.checkinType === 'onsite' ? 'ในสถานที่' : 'นอกสถานที่'}
                          </div>
                          {record.lateLevel > 0 && (
                            <div className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium">
                              สาย {record.lateMinutes} นาที
                            </div>
                          )}
                        </div>

                        {/* Time Details */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Check-in</p>
                            <p className="font-medium text-white flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-400" />
                              {new Date(record.checkinAt).toLocaleTimeString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Check-out</p>
                            <p className="font-medium text-white flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-400" />
                              {record.checkoutAt ? (
                                <span className="flex items-center gap-2">
                                  {new Date(record.checkoutAt).toLocaleTimeString('th-TH', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {record.isAutoCheckout && (
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

                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">ระยะเวลา</p>
                            <p className="font-medium text-white">
                              {record.totalHours
                                ? `${record.totalHours.toFixed(1)} ชั่วโมง`
                                : '-'}
                            </p>
                          </div>

                          <div className="space-y-1">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
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
                                    onClick={() => record.checkinPhotoUrl && window.open(record.checkinPhotoUrl, '_blank')}
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
                                    onClick={() => record.checkoutPhotoUrl && window.open(record.checkoutPhotoUrl, '_blank')}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {record.notes && (
                          <div className="pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">หมายเหตุ</p>
                            <p className="text-sm text-gray-300">
                              {record.notes
                                .replace('[AUTO CHECKOUT] ', '')
                                .replace('[AUTO CHECKOUT]', '')}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-500">
                ไม่พบข้อมูลการเข้างานในช่วงเวลาที่เลือก
              </div>
            </Card>
          )}
        </Tabs.TabContent>

        {/* Evaluations Tab */}
        <Tabs.TabContent value="evaluations">
          {isLoadingEvaluations ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size={40} />
            </div>
          ) : evaluations.length > 0 ? (
            <div className="space-y-6 mt-6">
              {evaluations.map((evaluation) => (
                <Card key={evaluation.id} className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <HiOutlineChartBar className="h-6 w-6 text-blue-400" />
                      <div>
                        <h4 className="text-xl font-semibold text-white">
                          ผลประเมิน {getMonthName(evaluation.month)} {evaluation.year}
                        </h4>
                        {/* <p className="text-sm text-gray-400 mt-1">
                          จำนวนงานที่ประเมิน: {evaluation.totalSubmissions} งาน
                        </p> */}
                      </div>
                    </div>
                    {/* <div className="flex items-center gap-2">
                      <Badge className={getEvaluationStatusColor(evaluation.status)}>
                        {getEvaluationStatusText(evaluation.status)}
                      </Badge>
                    </div> */}
                  </div>

                  <div className="space-y-4">
                    {/* Status and Basic Info */}
                    <div className="border border-gray-600 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-400">งานที่ส่ง:</span>
                          <div className="mt-1 font-semibold text-white">
                            {evaluation.totalSubmissions} งาน
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-400">วันที่ประเมิน:</span>
                          <div className="mt-1 text-white">
                            {evaluation.evaluatedAt 
                              ? new Date(evaluation.evaluatedAt).toLocaleDateString('th-TH')
                              : 'ยังไม่ได้ประเมิน'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-400">ผลการประเมิน:</span>
                          <div className="mt-1 flex items-center gap-1">
                            {evaluation.isPassed !== null ? (
                              evaluation.isPassed ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-sm text-green-600 font-medium">
                                    ผ่านมาตรฐาน
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-sm text-red-600 font-medium">
                                    ไม่ผ่านมาตรฐาน
                                  </span>
                                </>
                              )
                            ) : (
                              <Badge className="bg-gray-600 text-white">ยังไม่ได้ประเมิน</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Evaluation Content */}
                    {evaluation.status === 'completed' && evaluation.summary && (
                      <div className="space-y-4">
                        <div className="border border-gray-600 rounded-lg p-4 text-center">
                          <h3 className="font-semibold mb-3 text-lg text-white">
                            📋 รายงานการประเมิน
                          </h3>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                            {evaluation.summary}
                          </div>
                        </div>

                        {/* Detailed Sections */}
                        {(evaluation.strengths ||
                          evaluation.weaknesses ||
                          evaluation.improvements) && (
                          <div className="grid gap-4">
                            {evaluation.strengths && (
                              <div className="border border-green-600 rounded-lg p-4">
                                <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  ✅ จุดดี
                                </h4>
                                <div className="text-sm whitespace-pre-wrap text-gray-300">
                                  {evaluation.strengths}
                                </div>
                              </div>
                            )}

                            {evaluation.weaknesses && (
                              <div className="border border-yellow-600 rounded-lg p-4">
                                <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                                  <HiOutlineMinus className="h-4 w-4" />
                                  ⚠️ จุดบกพร่อง
                                </h4>
                                <div className="text-sm whitespace-pre-wrap text-gray-300">
                                  {evaluation.weaknesses}
                                </div>
                              </div>
                            )}

                            {evaluation.improvements && (
                              <div className="border border-blue-600 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                  <Trophy className="h-4 w-4" />
                                  🎯 สิ่งที่ต้องแก้/ทำต่อไป
                                </h4>
                                <div className="text-sm whitespace-pre-wrap text-gray-300">
                                  {evaluation.improvements}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {evaluation.status === 'failed' && (
                      <div className="border border-red-600 rounded-lg p-4">
                        <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                          <HiOutlineMinus className="h-4 w-4" />
                          เกิดข้อผิดพลาด
                        </h4>
                        <div className="text-sm text-gray-300">
                          ไม่สามารถประเมินผลได้ในเดือนนี้ กรุณาติดต่อผู้ดูแลระบบ
                        </div>
                      </div>
                    )}

                    {evaluation.status === 'pending' && (
                      <div className="border border-gray-600 rounded-lg p-4 text-center">
                        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-300">รอการประเมินผลประจำเดือน</div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center py-12 text-gray-500">
                ยังไม่มีผลประเมินสำหรับบุคลากรคนนี้
              </div>
            </Card>
          )}
        </Tabs.TabContent>
      </Tabs>

      {/* Dialogs - Reuse from CharacterManagementPage */}
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
                เลือกวันที่ต้องการให้บุคลากรคนนี้ทำงาน (ค่าเริ่มต้น: จันทร์-ศุกร์)
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
    </div>
  )
}

export default CharacterDetailPage
