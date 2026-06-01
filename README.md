# Chatbot9Arm - AI Chat Application

แชทบอท AI ของ 9Arm บนิด้วย Next.js และ Tailwind CSS

## การติดตั้ง

```bash
cd chatbot9arm-web
npm install
```

## การรันในเครื่อง

```bash
# สร้างไฟล์ .env.local
cp .env.example .env.local

# แก้ไข API key ใน .env.local
npm run dev
```

## การ deploy บน Vercel

1. Push code ขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com) → Import repository
3. ไปที่ **Settings → Environment Variables** แลัวเพิ่ม:
   - `ANTHROPIC_API_KEY` = API key ของคุณ
   - `ANTHROPIC_BASE_URL` = https://gateway.9arm.co
4. Deploy!

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── api/chat/route.ts    # API proxy ไปยััง 9Arm Gateway
│   ├── components/
│   │   ├── ChatInput.tsx    # UI หลัก (messages + input)
│   │   └── ChatMessage.tsx  # Component แสดง message
│   ├── layout.tsx           # Layout หลัก
│   └── page.tsx             # หน้าหลัก
```

## หมายเหตุความปลอดภัย

- **ห้าม commit .env.local** ขึ้น git (มี .gitignore แล้ว)
- API key จะถุกเก็บไวฝั่ง server เท่านั้น (ผ่าน Next.js API routes)
- ไฟล์ .env.local ถูกรวมอยุ่ใน .gitignore แล้ว
