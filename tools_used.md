# Tools Used — Chatbot9Arm (RAG Chatbot)

แอปแชตบอตแบบ RAG (Retrieval-Augmented Generation): อัปโหลด PDF → ค้นข้อมูลที่เกี่ยวข้อง → ให้ LLM ตอบจากเอกสารจริง พร้อมขั้นกรองกัน hallucinate

---

## 🏗️ Architecture

```
Vercel (Next.js)  ──►  Render (FastAPI)  ──►  Supabase (Postgres + pgvector)
   frontend/API          RAG backend            vector store
```

---

## 🧰 Tech Stack

### Frontend
| Tool | หน้าที่ |
|------|---------|
| **Next.js 16 (App Router)** | UI + API route (`/api/chat`) |
| **React 19** | component / state |
| **TypeScript** | type safety |
| **Tailwind CSS 4** | styling |
| **lucide-react** | icons |

### Backend (RAG)
| Tool | หน้าที่ |
|------|---------|
| **FastAPI** | REST API (`/chat`, `/ingest`) + Swagger docs |
| **Uvicorn** | ASGI server |
| **LangGraph** | RAG flow มี branch: `retrieve → grade → generate / no_answer` (กรองก่อนตอบ กัน hallucinate) |
| **LangChain (core + openai)** | client ต่อ LLM แบบ OpenAI-compatible (9arm gateway / Qwen) |
| **PyMuPDF** | extract ข้อความจาก PDF |
| **Jina Embeddings API** | แปลงข้อความ → vector 1024 มิติ (เลี่ยง torch ให้ deploy เบา) |

### Data / Infra
| Tool | หน้าที่ |
|------|---------|
| **Supabase (Postgres + pgvector)** | เก็บ vector ถาวร + similarity search ผ่าน RPC `match_documents()` |
| **Vercel** | deploy frontend |
| **Render** | deploy backend (render.yaml blueprint) |

---

## 📄 Resume — เขียนได้แบบนี้

### แบบสั้น (1 บรรทัด สำหรับ skills/summary)
> Built a full-stack RAG chatbot — **Next.js, FastAPI, LangGraph, Supabase (pgvector)** — deployed on Vercel + Render.

### แบบ Project section (bullet points)

**RAG Chatbot** — *Next.js, FastAPI, LangGraph, Supabase, Vercel, Render*

- ออกแบบและพัฒนาแชตบอต **RAG** แบบ full-stack ที่ตอบคำถามจากเอกสาร PDF ที่ผู้ใช้อัปโหลด แทนการตอบจากความรู้ทั่วไปของโมเดล
- สร้าง pipeline ฝั่ง backend ด้วย **FastAPI + LangGraph**: `retrieve → grade → generate` โดยใส่ขั้น **grade** เพื่อกรอง context ที่ไม่เกี่ยวออกก่อน เพื่อ**ลด hallucination**
- ทำระบบ **vector search** บน **Supabase pgvector** (HNSW + cosine similarity) เก็บ embedding ถาวร ไม่ต้อง rebuild index ทุกครั้งที่ restart
- ใช้ **Jina Embeddings API** แทนการรันโมเดลในเครื่อง ทำให้ deploy ได้บน free tier โดยไม่ต้องพึ่ง GPU/torch
- พัฒนา frontend ด้วย **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind** พร้อมฟีเจอร์ **token-budget memory** ที่ตัดบทสนทนาเก่าอัตโนมัติเมื่อเกิน context limit
- Deploy แบบ **3-tier**: Vercel (frontend) + Render (backend) + Supabase (database) พร้อม CI config (render.yaml) และ CORS

### Keywords สำหรับ ATS / skills
`RAG` · `LLM` · `Vector Database` · `pgvector` · `Embeddings` · `LangGraph` · `LangChain` · `FastAPI` · `Next.js` · `React` · `TypeScript` · `Supabase` · `PostgreSQL` · `REST API` · `Vercel` · `Render` · `Full-Stack`

---

## 💡 จุดที่ชูได้ตอนสัมภาษณ์
- **ทำไมใช้ LangGraph ไม่ใช่ if-else** → มี conditional branch (grade) กัน hallucinate และต่อ node ใหม่ได้ง่าย (เช่น query rewrite, web fallback)
- **ทำไมใช้ Jina API ไม่รัน embedding เอง** → deploy เบา ไม่ต้องโหลด torch บน free tier
- **ทำไม pgvector ไม่ใช่ FAISS in-memory** → ข้อมูลไม่หายตอน cold start / restart
