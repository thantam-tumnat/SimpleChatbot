"""
FastAPI Entry Point

- ตั้ง CORS ให้ Next.js เรียกได้
- รวม router: /chat, /ingest
- Swagger docs ฟรีที่ /docs (FastAPI ให้มาในตัว)

รัน local:  uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.routers import chat, clear, ingest

app = FastAPI(title="RAG Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, tags=["chat"])
app.include_router(ingest.router, tags=["ingest"])
app.include_router(clear.router, tags=["clear"])


@app.get("/")
def root():
    return {"message": "RAG Backend", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
