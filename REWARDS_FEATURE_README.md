# Feature Rewards - รายงานรางวัลจากตู้กาชา

Feature นี้ถูก refactor จาก report รางวัลเดิมให้เป็นไปตาม architecture pattern ของโปรเจค

## โครงสร้างไฟล์

```
src/features/rewards/
├── types.ts                    # Type definitions
├── repository.ts               # Data access layer (extends BaseRepository)
├── service/
│   ├── client.ts              # Client-side service (extends BaseService)
│   └── server.ts              # Server-side service (extends BaseService)
├── hooks/
│   └── useRewards.tsx         # Custom React Query hooks
├── components/
│   ├── RewardReportPage.tsx   # Main page component
│   ├── RewardSummary.tsx      # Summary cards component
│   ├── RewardTable.tsx        # Gacha history table
│   └── CharacterStatsTable.tsx # Character statistics table
└── index.ts                   # Feature exports
```

## ฟีเจอร์

### 1. สรุปสถิติรวม
- **Token ที่ใช้ไปแล้ว**: แสดงจำนวน Token ทั้งหมดที่ใช้ในการสุ่มตู้กาชา
- **จำนวนครั้งที่สุ่ม**: แสดงจำนวนครั้งทั้งหมดที่มีการสุ่มตู้กาชา
- **Xeny ที่แจกไปแล้ว**: แสดงจำนวน Xeny ทั้งหมดที่แจกเป็นรางวัล

### 2. สถิติการสุ่มของแต่ละ Character
แสดงข้อมูลสถิติการสุ่มของแต่ละ Character รวมถึง:
- ชื่อ Character และ User
- อาชีพและระดับ
- จำนวนครั้งที่สุ่ม
- จำนวนครั้งที่ได้รางวัล
- อัตราได้รางวัล (%)
- Token ที่ใช้ไป
- วันที่สุ่มครั้งล่าสุด

### 3. ประวัติการสุ่มตู้กาชา
แสดงรายละเอียดการสุ่มแต่ละครั้ง:
- วันที่และเวลา
- Character ที่สุ่ม
- รางวัลที่ได้รับ (ถ้ามี)
- มูลค่ารางวัล
- Token ที่ใช้
- สถานะการได้รับรางวัล

## การใช้งาน

### การเข้าถึง
1. ไปที่เมนู "รายงาน" ในแอปพลิเคชัน
2. คลิกที่ "รางวัล" เพื่อเข้าสู่หน้ารายงาน

### การกรองข้อมูล
- **ค้นหา**: ค้นหาจากชื่อ Character, User, ชื่อรางวัล, หรือหมวดหมู่รางวัล
- **กรองตามวันที่**: เลือกช่วงวันที่เพื่อดูประวัติการสุ่มเฉพาะช่วงเวลาที่ต้องการ

### การแบ่งหน้า (Pagination)
- ประวัติการสุ่มตู้กาชาแสดง 10 รายการต่อหน้า
- สามารถเปลี่ยนหน้าได้โดยใช้ปุ่ม pagination
- หน้าแรกจะถูก reset เมื่อเปลี่ยน filter

### การรีเฟรชข้อมูล
คลิกปุ่ม "รีเฟรชข้อมูล" เพื่อดึงข้อมูลล่าสุดจากฐานข้อมูล

## API Endpoints

### GET /api/reports/rewards
ดึงข้อมูลรายงานรางวัล

**Query Parameters:**
- `characterId` (optional): ID ของ Character เฉพาะ
- `search` (optional): ค้นหาจากชื่อ Character, User, รางวัล
- `startDate` (optional): วันที่เริ่มต้น (YYYY-MM-DD)
- `endDate` (optional): วันที่สิ้นสุด (YYYY-MM-DD)
- `page` (optional): หมายเลขหน้า (default: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (default: 10, max: 100)

**Response:**
```typescript
{
  success: boolean
  data: {
    summary: {
      totalTokensSpent: number
      totalGachaPulls: number
      totalXenyDistributed: number
    }
    characterSummary: CharacterGachaStats[]
    gachaHistory: GachaHistoryWithDetails[]
  }
}
```

## การพัฒนา

### เพิ่มฟีเจอร์ใหม่
1. แก้ไข types ใน `types.ts`
2. อัปเดต repository ใน `repository.ts`
3. เพิ่ม service methods ใน `service/client.ts` และ `service/server.ts`
4. สร้าง custom hooks ใน `hooks/useRewards.tsx`
5. เพิ่ม UI components ใน `components/`

### การทดสอบ
1. ตรวจสอบ API endpoint `/api/reports/rewards`
2. ทดสอบการกรองข้อมูล
3. ทดสอบ pagination
4. ทดสอบ error handling

## หมายเหตุ

- หน้านี้ใช้ React Query สำหรับ data fetching
- มีการจัดการ error states และ loading states
- รองรับการแสดงผลภาษาไทย
- ใช้ Prisma สำหรับ database operations
- ใช้ BaseRepository และ BaseService patterns 