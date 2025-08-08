'use client'

import React, { useState, useCallback } from 'react'
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
} from 'react-icons/hi'
import {
  useCharacters,
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
import { Camera, Clock, MapPin } from 'lucide-react'

const { Tr, Th, Td, THead, TBody } = Table

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

  const { data: charactersData, isLoading, error } = useCharacters(filters)
  const { data: jobClasses } = useJobClasses()
  const updateWorkSettings = useUpdateCharacterWorkSettings()
  const updateCharacterJob = useUpdateCharacterJob()
  const deductXeny = useDeductXeny()

  // Debug log
  console.log('jobClasses:', jobClasses)

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
  }

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

  const formatSalary = (salary: number | null) => {
    if (!salary) return '-'
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(salary)
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Input
                placeholder="ค้นหาด้วยชื่อหรืออีเมล"
                prefix={<HiOutlineSearch />}
                value={filters.search}
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
          </Card>

          {/* Character Table */}
          <Card>
            <Table>
              <THead>
                <Tr>
                  <Th>บุคลากร</Th>
                  <Th>อาชีพ</Th>
                  <Th>ระดับอาชีพ</Th>
                  <Th>Xeny</Th>
                  <Th>เวลาเข้างาน</Th>
                  <Th>เวลาออกงาน</Th>
                  <Th className="text-right">เงินเดือน</Th>
                  <Th></Th>
                </Tr>
              </THead>
              <TBody>
                {charactersData?.characters.map((character: CharacterType) => (
                  <Tr key={character.id}>
                    <Td>
                      <div className="flex items-center gap-3">
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
                        <div>
                          <div className="font-medium text-white">
                            {character.name}
                          </div>
                          <div className="text-sm text-white-500">
                            {character.user.email}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-white">{character.jobClass.name}</Td>
                    <Td className="text-white">
                      {character.currentJobLevel.title}
                    </Td>
                    <Td className="text-white">
                      {character.user.userXeny?.currentXeny || 0} Xeny
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
                      </Dropdown>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>

            {(!charactersData?.characters ||
              charactersData.characters.length === 0) && (
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
                    <Th>เปอร์เซ็นต์การเข้างาน</Th>
                    <Th>การจัดการ</Th>
                  </Tr>
                </THead>
                <TBody>
                  {attendanceData.reports?.map((report) => (
                    <Tr key={report.character.id}>
                      <Td>
                        <div className="flex items-center gap-3">
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
                          <div>
                            <div className="font-medium text-white">
                              {report.character.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {report.character.jobClass}
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
                          variant="twoTone"
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

              {(!attendanceData.reports ||
                attendanceData.reports.length === 0) && (
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
                               {new Date(record.checkoutAt).toLocaleTimeString('th-TH', {
                                 hour: '2-digit',
                                 minute: '2-digit',
                               })}
                               {(record.isAutoCheckout === true || record.isAutoCheckout === 1 || record.notes?.includes('[AUTO CHECKOUT]')) && (
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
                                onClick={() => window.open(record.checkinPhotoUrl, '_blank')}
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
                                onClick={() => window.open(record.checkoutPhotoUrl, '_blank')}
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
                          <span className="font-medium">Auto Checkout:</span> {record.autoCheckoutNote}
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
    </div>
  )
}

export default CharacterManagementPage
