"""
Embedding Service

แปลงข้อความเป็น vector ผ่าน Jina API (ไม่รัน model ในเครื่อง = ไม่มี torch)
- ตอน ingest เอกสาร   -> task="retrieval.passage"
- ตอนค้นด้วยคำถาม      -> task="retrieval.query"

Jina v3 ใช้ "task" แทนการเติม prefix เองแบบ e5
"""

import requests

from app.config import JINA_API_KEY, JINA_MODEL

JINA_URL = "https://api.jina.ai/v1/embeddings"


def _embed(texts: list[str], task: str) -> list[list[float]]:
    resp = requests.post(
        JINA_URL,
        headers={
            "Authorization": f"Bearer {JINA_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": JINA_MODEL,
            "task": task,
            "input": texts,
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    # Jina คืน data เรียงตามลำดับ input อยู่แล้ว
    return [item["embedding"] for item in data["data"]]


def embed_passages(texts: list[str]) -> list[list[float]]:
    """embed เนื้อหา/chunk (ตอนเก็บเข้า vector store)"""
    return _embed(texts, task="retrieval.passage")


def embed_query(text: str) -> list[float]:
    """embed คำถามเดี่ยว (ตอน retrieve)"""
    return _embed([text], task="retrieval.query")[0]
