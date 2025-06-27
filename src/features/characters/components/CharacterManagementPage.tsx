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
} from '../../../components/ui'
import { HiOutlinePencil, HiOutlineSearch } from 'react-icons/hi'
import {
  useCharacters,
  useUpdateCharacterWorkSettings,
} from '../hooks/useCharacters'
import {
  CharacterWithRelations,
  UpdateCharacterWorkSettingsRequest,
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
  const [workSettings, setWorkSettings] = useState({
    workStartTime: '',
    workEndTime: '',
    salary: '',
  })

  const { data: charactersData, isLoading, error } = useCharacters(filters)
  const { data: jobClasses, isLoading: jobClassesLoading } = useJobClasses()
  const updateWorkSettings = useUpdateCharacterWorkSettings()

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

  const formatSalary = (salary: number | null) => {
    if (!salary) return '-'
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(salary)
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
        <div className="flex flex-col sm:flex-row gap-4">
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
              {/* <Th>ระดับ</Th> */}
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
                {/* <Td>
                  <div>
                    <div className="font-medium">Lv. {character.level}</div>
                    <div className="text-sm text-white-500">
                      {character.currentJobLevel.title}
                    </div>
                  </div>
                </Td> */}
                <Td className="text-white">{character.workStartTime || '-'}</Td>
                <Td className="text-white">{character.workEndTime || '-'}</Td>
                <Td className="text-right font-medium text-white">
                  {formatSalary(character.salary)}
                </Td>
                <Td>
                  <Button
                    size="sm"
                    variant="plain"
                    icon={<HiOutlinePencil />}
                    onClick={() => handleEdit(character)}
                  />
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
    </div>
  )
}

export default CharacterManagementPage
