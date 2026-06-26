"""
Ingest Router

POST /ingest  (multipart: file=PDF)
-> extract text -> chunk -> embed (Jina) -> เก็บลง pgvector

รันตอน "เพิ่มเอกสารเข้าระบบ" เท่านั้น ไม่ใช่ทุก request
(ภายหลังจะใส่ auth ให้เฉพาะ role admin เรียกได้)
"""

from fastapi import APIRouter, Form, HTTPException, UploadFile

from app.services import chunk_service, embedding_service, pdf_service, vector_service

router = APIRouter()


@router.post("/ingest")
async def ingest(file: UploadFile, session_id: str = Form(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="รองรับเฉพาะไฟล์ PDF")

    # ลบเอกสารเก่าที่ค้างเกิน TTL ทุกครั้งที่มีคนอัป (ของฟรี ไม่ต้องตั้ง cron)
    vector_service.cleanup_old(hours=24)

    data = await file.read()
    text = pdf_service.extract_text_from_bytes(data)

    chunks = chunk_service.chunk_text(text, size=500, overlap=100)
    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="อ่านข้อความจากไฟล์ไม่ได้ (อาจเป็น PDF สแกนเป็นรูป)",
        )

    embeddings = embedding_service.embed_passages(chunks)
    count = vector_service.add_documents(
        chunks,
        embeddings,
        session_id=session_id,
        metadata={"source": file.filename},
    )

    return {"filename": file.filename, "chunks_added": count}
