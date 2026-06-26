import { NextRequest, NextResponse } from "next/server";

// ส่งต่อไฟล์ที่อัปโหลดไปยัง RAG backend (FastAPI /ingest)
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const sessionId = formData.get("sessionId");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "ไม่พบ sessionId" }, { status: 400 });
    }

    // สร้าง FormData ใหม่เพื่อ forward ไป backend (พร้อม session_id)
    const backendForm = new FormData();
    backendForm.append("file", file);
    backendForm.append("session_id", sessionId);

    const res = await fetch(`${BACKEND_URL}/ingest`, {
      method: "POST",
      body: backendForm,
    });

    const data = await res.json();

    if (!res.ok) {
      // backend ส่ง error มาในรูป { detail: "..." }
      return NextResponse.json(
        { error: data.detail || "อัปโหลดไม่สำเร็จ" },
        { status: res.status }
      );
    }

    return NextResponse.json(data); // { filename, chunks_added }
  } catch (error) {
    console.error("Ingest proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
