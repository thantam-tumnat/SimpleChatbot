"""
Clear Router

POST /clear  { "session_id": "..." }
-> ลบเอกสารทั้งหมดของเซสชันนั้นทิ้ง (โหมด ephemeral — ใช้แล้วทิ้ง)
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.services import vector_service

router = APIRouter()


class ClearRequest(BaseModel):
    session_id: str


@router.post("/clear")
def clear(req: ClearRequest):
    deleted = vector_service.clear_session(req.session_id)
    return {"deleted": deleted}
