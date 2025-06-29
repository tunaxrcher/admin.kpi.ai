# 🛠 AI CRM - Admin Dashboard

ระบบหลังบ้านของ **AI CRM** ใช้สำหรับจัดการและควบคุมระบบ CRM ที่ผสานการทำงานร่วมกับ AI และเกมมิฟิเคชัน เพื่อเพิ่มประสิทธิภาพการบริหารจัดการผู้ใช้, ลูกค้า, ระบบ AI และสถิติโดยรวมขององค์กร

---

## 📌 โมดูลหลักของระบบหลังบ้าน

### 👥 User & Role Management
- จัดการสิทธิ์การเข้าถึง (Admin / Manager / Staff)
- ตรวจสอบสถานะการใช้งานของผู้ใช้
- กำหนดทีมและขอบเขตงานที่ดูแล

### 🧑‍💼 Customer & Tag Oversight
- ตรวจสอบลูกค้าทั้งระบบ (ข้ามทีม)
- จัดการแท็ก / หมวดหมู่ลูกค้า
- รวมข้อมูลลูกค้าที่ซ้ำซ้อน

### 🤖 AI Prompt & Model Configuration
- ตั้งค่า System Prompt สำหรับ AI แต่ละโมดูล
- ปรับพฤติกรรม / personality ของ AI
- เปลี่ยน Model (GPT-4o / GPT-3.5) ตามความเหมาะสม

### 📝 Quest Template & Gamification Settings
- จัดการเควส (รายวัน / รายสัปดาห์ / รายทีม)
- ตั้งค่ารางวัล (XP, Token, Badge)
- สถิติเควสที่ได้รับความนิยม

### 🧠 Knowledge Base & AI Memory
- จัดการไฟล์ความรู้ที่ AI ใช้อ้างอิง
- แก้ไข / เพิ่ม / ลบเวกเตอร์ไฟล์
- ตรวจสอบเวกเตอร์ที่ใช้ใน Assistant

### 📊 Analytics & Dashboard
- สถิติการใช้งาน:
  - ลูกค้าที่ถูกติดตาม
  - เควสสำเร็จ
  - Leaderboard พนักงาน
  - คำถามที่ AI รับบ่อย
- Export ข้อมูลเป็น CSV / JSON

### 🛡 Audit Logs & Monitoring
- ตรวจสอบกิจกรรมของผู้ใช้
- ดู error logs / AI timeout
- ตรวจสอบการเปลี่ยนแปลง Prompt

### 💰 Billing & Usage Tracking
- ติดตามการใช้ Token รายวัน / เดือน
- วิเคราะห์ต้นทุน per customer / assistant
- เชื่อมต่อ Stripe / ระบบเก็บเงิน

### 🧪 AI Test Lab (Sandbox)
- ทดลอง Assistant / Prompt ใหม่
- เปรียบเทียบเวอร์ชันก่อน–หลัง
- ทดสอบก่อนใช้งานจริง

---

## 🧱 เทคโนโลยีที่ใช้

- **Next.js 15** (App Router)
- **Prisma + Role-based Access**
- **TailwindCSS + ShadCN + Radix UI**
- **TypeScript + Zustand**
- **Chart.js / Recharts** สำหรับ Analytics

---

## 🧭 ฟีเจอร์แนะนำเพิ่มเติม

- Notification เมื่อมี event สำคัญ (AI ล่ม, Token เกิน)
- Rollback prompt/config ได้
- สิทธิ์แบบ granular ต่อโมดูล (อ่าน / แก้ / ลบ)

---

พัฒนาร่วมกับระบบหลักของ [AI CRM - https://app.evxspst.com/](https://app.evxspst.com/)