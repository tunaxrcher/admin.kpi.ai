import { BaseService } from '../../../lib/services/server/baseService'
import {
  CreateJobClassRequest,
  UpdateJobClassRequest,
  GenerateLevelsRequest,
  GeneratedLevel,
} from '../types'
import { s3UploadService } from '../../../lib/services/s3UploadService'
import { jobClassRepository, jobLevelRepository } from '../repository'
import { JobLevel } from '@prisma/client'

export class JobClassService extends BaseService {
  private static instance: JobClassService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!JobClassService.instance) {
      JobClassService.instance = new JobClassService()
    }
    return JobClassService.instance
  }

  async getAllJobClasses() {
    return await jobClassRepository.getAllJobClasses()
  }

  async getJobClassById(id: number) {
    return await jobClassRepository.getJobClassById(id)
  }

  async createJobClass(data: CreateJobClassRequest & { imageFile?: File }) {
    // Check if job name already exists
    const exists = await jobClassRepository.checkJobNameExists(data.name)
    if (exists) {
      throw new Error('ชื่ออาชีพนี้มีอยู่แล้ว')
    }

    let imageUrl = data.imageUrl

    // อัพโหลดรูปถ้ามี
    if (data.imageFile) {
      try {
        const uploadResult = await s3UploadService.uploadFile(
          data.imageFile,
          'job-classes',
        )
        imageUrl = uploadResult.url
      } catch (error) {
        console.error('Image upload error:', error)
        throw new Error('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ')
      }
    }

    const createData = {
      name: data.name,
      description: data.description,
      imageUrl,
      levels: data.levels,
    }

    return await jobClassRepository.createJobClass(createData)
  }

  async updateJobClass(
    id: number,
    data: UpdateJobClassRequest & { imageFile?: File },
  ) {
    // Check if job name already exists (exclude current job)
    if (data.name) {
      const exists = await jobClassRepository.checkJobNameExists(data.name, id)
      if (exists) throw new Error('ชื่ออาชีพนี้มีอยู่แล้ว')
    }

    let imageUrl = data.imageUrl

    // อัพโหลดรูปใหม่ถ้ามี
    if (data.imageFile) {
      try {
        const uploadResult = await s3UploadService.uploadFile(
          data.imageFile,
          'job-classes',
        )

        imageUrl = uploadResult.url
      } catch (error) {
        console.error('Image upload error:', error)
        throw new Error('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ')
      }
    }

    const updateData = {
      name: data.name,
      description: data.description,
      imageUrl,
    }

    return await jobClassRepository.updateJobClass(id, updateData)
  }

  async deleteJobClass(id: number) {
    return await jobClassRepository.deleteJobClass(id)
  }
}
export const jobClassService = JobClassService.getInstance()

export class JobLevelService extends BaseService {
  private static instance: JobLevelService

  constructor() {
    super()
  }

  public static getInstance() {
    if (!JobLevelService.instance) {
      JobLevelService.instance = new JobLevelService()
    }
    return JobLevelService.instance
  }

  async updateJobLevel(levelId: number, data: Partial<JobLevel>) {
    return await jobLevelRepository.updateJobLevel(levelId, data)
  }

  async generateJobLevels(
    data: GenerateLevelsRequest,
  ): Promise<GeneratedLevel[]> {
    try {
 
      // const prompt = `
      //   สร้าง level tree สำหรับอาชีพ "${data.jobName}" ในรูปแบบ JSON array ดังนี้:
      //       [
      //           {
      //               "level": 1,
      //               "requiredCharacterLevel": 1,
      //               "title": "ชื่อตำแหน่งระดับเริ่มต้น",
      //               "description": "คำอธิบายหน้าที่และความสามารถ",
      //               "personaDescription": "คำอธิบายลักษณะภายนอกและอุปกรณ์ในภาษาอังกฤษ"
      //           },
      //           {
      //               "level": 10,
      //               "requiredCharacterLevel": 10,
      //               "title": "ชื่อตำแหน่งระดับพื้นฐาน",
      //               "description": "คำอธิบายหน้าที่และความสามารถ",
      //               "personaDescription": "คำอธิบายลักษณะภายนอกและอุปกรณ์ในภาษาอังกฤษ"
      //           },
      //           {
      //               "level": 35,
      //               "requiredCharacterLevel": 35,
      //               "title": "ชื่อตำแหน่งระดับกลาง",
      //               "description": "คำอธิบายหน้าที่และความสามารถ",
      //               "personaDescription": "คำอธิบายลักษณะภายนอกและอุปกรณ์ในภาษาอังกฤษ"
      //           },
      //           {
      //               "level": 60,
      //               "requiredCharacterLevel": 60,
      //               "title": "ชื่อตำแหน่งระดับสูง",
      //               "description": "คำอธิบายหน้าที่และความสามารถ",
      //               "personaDescription": "คำอธิบายลักษณะภายนอกและอุปกรณ์ในภาษาอังกฤษ"
      //           },
      //           {
      //               "level": 80,
      //               "requiredCharacterLevel": 80,
      //               "title": "ชื่อตำแหน่งระดับผู้นำ",
      //               "description": "คำอธิบายหน้าที่และความสามารถ",
      //               "personaDescription": "คำอธิบายลักษณะภายนอกและอุปกรณ์ในภาษาอังกฤษ"
      //           },
      //           {
      //               "level": 99,
      //               "requiredCharacterLevel": 99,
      //               "title": "ชื่อตำแหน่งระดับปรมาจารย์",
      //               "description": "คำอธิบายหน้าที่และความสามารถ",
      //               "personaDescription": "คำอธิบายลักษณะภายนอกและอุปกรณ์ในภาษาอังกฤษ"
      //           }
      //       ]

      //       ตอบกลับเป็น JSON array เท่านั้น ไม่ต้องมีข้อความอื่น
      //   `

      const prompt = `
        คุณคือนักออกแบบเกม RPG ที่มีความเชี่ยวชาญด้านการวางระบบเลเวลและพัฒนาตัวละคร

        กรุณาสร้าง level tree สำหรับอาชีพ "${data.jobName}" โดยแบ่งเป็น 6 ระดับตามนี้:

        - Level 1: ระดับเริ่มต้น
        - Level 10: ระดับพื้นฐาน
        - Level 35: ระดับกลาง
        - Level 60: ระดับสูง
        - Level 80: ระดับผู้นำ
        - Level 99: ระดับปรมาจารย์

        สำหรับแต่ละระดับ ให้แสดงข้อมูลเป็น JSON object ที่มี field ดังนี้:
        - "level": หมายเลขเลเวล (เช่น 1, 10, 35, ...)
        - "requiredCharacterLevel": เลเวลของตัวละครที่ต้องใช้ในการปลดล็อก (เท่ากับ level)
        - "title": ชื่อตำแหน่งในสายงานแม่บ้านในระดับนั้น (ควรสมจริงและสอดคล้องกับความสามารถ)
        - "description": อธิบายหน้าที่และความสามารถของตำแหน่งนี้ (เน้นภาษาไทย)
        - "personaDescription": อธิบายรูปลักษณ์ภายนอก ชุด อุปกรณ์ หรือสิ่งของที่ใช้ในงาน (เป็นภาษาอังกฤษ)

        **รูปแบบการตอบกลับ:**
        - ตอบกลับเฉพาะ JSON array เท่านั้น
        - ห้ามมีคำอธิบายเพิ่มเติมก่อนหรือหลัง JSON
        - อย่าใส่ข้อความอธิบายอื่น ๆ เช่น “แน่นอนครับ...” หรือ “นี่คือตัวอย่าง...”
      `

        console.log(prompt)
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        },
      )

      if (!response.ok) throw new Error('Failed to generate job levels')

      const result = await response.json()
      const content = result.choices[0].message.content

      console.log('OpenAI Response:', content) // debug

      // ลองแยก JSON จากข้อความที่อาจมีข้อความอื่นปนอยู่
      let jsonContent = content.trim()

      // หา JSON array ในข้อความ
      const jsonMatch = jsonContent.match(/\[[\s\S]*\]/)
      if (jsonMatch) jsonContent = jsonMatch[0]

      try {
        const levels: GeneratedLevel[] = JSON.parse(jsonContent)

        // ตรวจสอบว่าเป็น array และมีข้อมูลครบ
        if (Array.isArray(levels) && levels.length > 0) {
          return levels
        } else {
          throw new Error('Invalid response format')
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        throw new Error('Failed to parse response')
      }
    } catch (error) {
      console.error('Error generating job levels:', error)
      // ใช้ default levels เป็น fallback
      return this.getDefaultLevels(data.jobName)
    }
  }

  private getDefaultLevels(jobName: string): GeneratedLevel[] {
    return [
      {
        level: 1,
        requiredCharacterLevel: 1,
        title: `${jobName}ฝึกหัด`,
        description: `เริ่มต้นเรียนรู้พื้นฐานของ${jobName}`,
        personaDescription: 'Beginner outfit with basic tools, eager to learn',
      },
      {
        level: 10,
        requiredCharacterLevel: 10,
        title: `${jobName}จูเนียร์`,
        description: `มีความรู้พื้นฐานและสามารถทำงานง่ายๆ ได้`,
        personaDescription: 'Professional attire with standard equipment',
      },
      {
        level: 35,
        requiredCharacterLevel: 35,
        title: `${jobName}มืออาชีพ`,
        description: `มีประสบการณ์และทักษะที่เชี่ยวชาญ`,
        personaDescription: 'Expert appearance with advanced tools',
      },
      {
        level: 60,
        requiredCharacterLevel: 60,
        title: `หัวหน้าทีม${jobName}`,
        description: `ควบคุมทีมและวางแผนการทำงาน`,
        personaDescription: 'Leadership attire with management tools',
      },
      {
        level: 80,
        requiredCharacterLevel: 80,
        title: `ผู้อำนวยการ${jobName}`,
        description: `กำหนดนโยบายและทิศทางขององค์กร`,
        personaDescription: 'Executive suit with high-tech equipment',
      },
      {
        level: 99,
        requiredCharacterLevel: 99,
        title: `ปรมาจารย์${jobName}`,
        description: `ผู้เชี่ยวชาญระดับสูงสุดที่เปลี่ยนแปลงวงการ`,
        personaDescription:
          'Legendary master with mystical aura and ultimate tools',
      },
    ]
  }
}
export const jobLevelService = JobLevelService.getInstance()
