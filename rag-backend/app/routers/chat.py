"""
Chat Router

POST /chat  { "question": "..." }
-> รัน RAG graph -> { "answer": "...", "context": [...] }
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.graph import rag_graph

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    session_id: str


class ChatResponse(BaseModel):
    answer: str
    context: list[str]


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    return rag_graph.ask(req.question, req.session_id)
