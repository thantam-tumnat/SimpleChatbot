# RAG Backend

FastAPI + LangGraph RAG backend — embedding และ LLM ผ่าน API ทั้งคู่ (ไม่มี torch ในเครื่อง) จึง deploy บน Render free tier ได้

## สถาปัตยกรรม

```
Next.js (Vercel)              this backend (Render free)            Supabase
  chat UI  ──POST /chat──>  LangGraph: retrieve→grade→generate  ──>  pgvector (ถาวร)
                                ├ embed: Jina API
                                └ chat:  gateway 9arm (OpenAI-compatible)
```

ทำไม deploy ฟรีได้: embedding ยิง Jina API แทนการรัน `sentence-transformers` ในเครื่อง → ไม่มี `torch` → แรม ~150 MB พอกับ free tier และ vector อยู่ใน pgvector ถาวร → cold start ไม่ต้อง rebuild

## โครงสร้าง

```
app/
  main.py            FastAPI + CORS + routers
  config.py          อ่าน env ที่เดียว
  services/
    chunk_service    แบ่งข้อความเป็น chunk
    pdf_service      อ่าน PDF (PyMuPDF)
    embedding_service  Jina API
    vector_service     Supabase pgvector
    llm_service        gateway 9arm (ChatOpenAI)
  graph/
    state.py         RAGState
    rag_graph.py     LangGraph flow
  routers/
    chat.py          POST /chat
    ingest.py        POST /ingest
```

## รัน local

```bash
cd rag-backend
python -m venv .venv && source .venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt
cp .env.example .env        # แล้วใส่ค่า key
uvicorn app.main:app --reload
```

เปิด Swagger: http://localhost:8000/docs

## ตั้งค่า Supabase

รัน `supabase_schema.sql` ใน Supabase SQL Editor ครั้งเดียว (เปิด pgvector + สร้างตาราง + function)

## Endpoints

| method | path | ทำอะไร |
|---|---|---|
| POST | `/ingest` | อัปโหลด PDF → embed → เก็บลง pgvector |
| POST | `/chat` | ถามคำถาม → ตอบจากเอกสาร |
| GET | `/health` | health check |
| GET | `/docs` | Swagger UI |

## Deploy (Render)

ใช้ `render.yaml` (Blueprint) หรือสร้าง Web Service เอง:
- Root Directory: `rag-backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- ใส่ env vars ตาม `.env.example`
