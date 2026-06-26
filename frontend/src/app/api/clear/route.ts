import { NextRequest, NextResponse } from "next/server";

// ลบเอกสารของเซสชันนี้ใน RAG backend (ตอนผู้ใช้กดล้างแชต)
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Clear proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
