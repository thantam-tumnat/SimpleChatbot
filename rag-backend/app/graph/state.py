"""
RAG Graph State

state ที่ส่งต่อระหว่าง node ใน LangGraph
แต่ละ node อ่าน/เขียน field ใน dict นี้
"""

from typing import TypedDict


class RAGState(TypedDict):
    question: str          # คำถามจาก user
    session_id: str        # เซสชันของผู้ถาม (ใช้กรองเอกสาร)
    documents: list[str]   # chunk ที่ retrieve มาได้
    relevant: bool         # ผล grade: context ตรงคำถามไหม
    answer: str            # คำตอบสุดท้าย
