'use client'

import React, { useState } from 'react'
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
} from '../../../components/ui'
import { HiOutlinePencil, HiOutlineSearch, HiOutlineBriefcase, HiOutlineMinus, HiOutlineDotsVertical } from 'react-icons/hi'
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

const { Tr, Th, Td, THead, TBody } = Table

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
  })
  const [jobSettings, setJobSettings] = useState({
    jobClassId: 0,
    jobLevelId: 0,
  })
  const [xenySettings, setXenySettings] = useState({
    amount: '',
    description: '',
  })
  const [availableJobLevels, setAvailableJobLevels] = useState<any[]>([])

  const { data: charactersData, isLoading, error } = useCharacters(filters)
  const { data: jobClasses, isLoading: jobClassesLoading } = useJobClasses()
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
    fetchJobLevels(character.jobClassId, character.level, character.currentJobLevel.level)
  }

  const fetchJobLevels = async (jobClassId: number, characterLevel: number, currentJobLevel?: number) => {
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
        const response = await fetch(`/api/jobs/${jobClassId}/levels?characterLevel=${selectedCharacter.level}&currentJobLevel=${selectedCharacter.currentJobLevel.level}`)
        if (response.ok) {
          const levels = await response.json()
          // Auto-select the lowest available level (which will be >= current level)
          const selectedLevel = levels.length > 0 ? levels[0] : null
          
          setJobSettings(prev => ({ 
            ...prev, 
            jobClassId, 
            jobLevelId: selectedLevel ? selectedLevel.id : 0 
          }))
          setAvailableJobLevels(levels)
        }
      } catch (error) {
        console.error('Error fetching job levels:', error)
        setJobSettings(prev => ({ ...prev, jobClassId, jobLevelId: 0 }))
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
      }

      updateWorkSettings.mutate(
        { id: selectedCharacter.id, data },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false)
            setSelectedCharacter(null)
            setWorkSettings({ workStartTime: '', workEndTime: '', salary: '' })
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

  // Get user Xeny from raw query since include doesn't work
  const getUserXeny = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/xeny`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error fetching user Xeny:', error)
    }
    return { currentXeny: 0 }
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
          ตั้งค่าเงินเดือนและเวลาการทำงานของบุคลากร
        </p>
      </div>

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
                      (j: any) => j.id === filters.jobClassId,
                    )?.name,
                  }
                : null
            }
            onChange={(option) =>
              handleJobClassFilter(option?.value?.toString() || null)
            }
            className="sm:w-48"
            options={[
              { value: '', label: 'ทั้งหมด' },
              ...(jobClasses?.map((jobClass: any) => ({
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
            {charactersData?.characters.map((character: any) => (
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
                <Td className="text-white">{character.currentJobLevel.title}</Td>
                <Td className="text-white">
                  {character.user.userXeny?.currentXeny || 0} Xeny
                </Td>
                <Td className="text-white">{character.workStartTime || '-'}</Td>
                <Td className="text-white">{character.workEndTime || '-'}</Td>
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
                    <Dropdown.Item onClick={() => handleXenyEdit(character)}>
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

      {/* Edit Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedCharacter(null)
          setWorkSettings({ workStartTime: '', workEndTime: '', salary: '' })
        }}
        onRequestClose={() => {
          setIsEditDialogOpen(false)
          setSelectedCharacter(null)
          setWorkSettings({ workStartTime: '', workEndTime: '', salary: '' })
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

            <FormItem label="เงินเดือน (บาท)" className="mb-6">
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
                          (j: any) => j.id === jobSettings.jobClassId,
                        )?.name,
                      }
                    : null
                }
                onChange={(option) => handleJobClassChange(option?.value || 0)}
                options={
                  jobClasses?.map((jobClass: any) => ({
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
                    ? `${availableJobLevels.find((l: any) => l.id === jobSettings.jobLevelId)?.title || ''} (ต้องการ Level ${availableJobLevels.find((l: any) => l.id === jobSettings.jobLevelId)?.requiredCharacterLevel || ''})`
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

export default CharacterManagementPage
