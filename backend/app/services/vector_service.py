"""
Vector Service (Supabase pgvector)

เก็บ vector ถาวรใน Postgres + แยกข้อมูลตาม session_id (โหมด ephemeral)
- ตอน ingest : ติดป้าย session_id ให้ทุก chunk
- ตอน retrieve : ค้นเฉพาะ chunk ที่ session_id ตรงกับผู้ถาม (ไม่เห็นของคนอื่น)
- clear_session : ลบเอกสารของเซสชันนั้นทิ้ง (กดล้างแชต)
- cleanup_old : ลบเอกสารเก่าที่ค้างเกิน TTL (กันข้อมูลค้างถาวร)

ใช้คู่กับ:
- ตาราง documents(content, embedding vector(1024), metadata, session_id)
- function match_documents(query_embedding, match_count, p_session_id)
"""

from datetime import datetime, timedelta, timezone

from supabase import create_client

from app.config import SUPABASE_KEY, SUPABASE_URL

_client = create_client(SUPABASE_URL, SUPABASE_KEY)


def add_documents(
    chunks: list[str],
    embeddings: list[list[float]],
    session_id: str,
    metadata: dict | None = None,
) -> int:
    """เก็บ chunk + vector ลง pgvector พร้อมติดป้าย session_id"""
    rows = [
        {
            "content": chunk,
            "embedding": embedding,
            "metadata": metadata or {},
            "session_id": session_id,
        }
        for chunk, embedding in zip(chunks, embeddings)
    ]

    _client.table("documents").insert(rows).execute()
    return len(rows)


def match_documents(
    query_embedding: list[float],
    session_id: str,
    match_count: int = 4,
) -> list[str]:
    """หา chunk ที่ใกล้คำถามที่สุด top-k เฉพาะใน session ของผู้ถาม"""
    res = _client.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_count": match_count,
            "p_session_id": session_id,
        },
    ).execute()

    return [row["content"] for row in (res.data or [])]


def clear_session(session_id: str) -> int:
    """ลบเอกสารทั้งหมดของเซสชันนั้น (ใช้ตอนกดล้างแชต)"""
    res = _client.table("documents").delete().eq("session_id", session_id).execute()
    return len(res.data or [])


def cleanup_old(hours: int = 24) -> None:
    """ลบเอกสารที่เก่ากว่า N ชั่วโมง (TTL — กันข้อมูล ephemeral ค้างถาวร)"""
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    _client.table("documents").delete().lt("created_at", cutoff).execute()
