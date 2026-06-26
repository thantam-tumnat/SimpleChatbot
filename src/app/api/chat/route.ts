import { NextRequest, NextResponse } from "next/server";

// URL ของ RAG backend (FastAPI)
// - ตอน dev: http://localhost:8000
// - ตอน deploy: ใส่ URL ของ Render ใน environment variable
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid request: messages are required" }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "Invalid request: sessionId is required" }, { status: 400 });
    }

    // RAG backend รับ "คำถามเดี่ยว" -> ใช้ข้อความล่าสุดของ user เป็นคำถาม
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    // เรียก RAG backend: retrieve -> grade -> generate (กรองเฉพาะ session นี้)
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: lastUser.content, session_id: sessionId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("RAG backend error:", errorText);
      return NextResponse.json(
        { error: "Failed to get response from RAG backend", details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json(); // { answer, context }

    // แปลงรูปแบบให้ ChatInput เดิมอ่านได้ (รูปแบบเดียวกับ OpenAI)
    return NextResponse.json({
      choices: [{ message: { role: "assistant", content: data.answer } }],
      context: data.context, // เผื่ออยากเอา source ไปโชว์ทีหลัง
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
