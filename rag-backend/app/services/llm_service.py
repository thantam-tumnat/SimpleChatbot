"""
LLM Service

ต่อ LLM ผ่าน gateway 9arm (OpenAI-compatible) ด้วย langchain-openai
ใช้ทั้ง:
- generate_answer : ตอบคำถามจาก context
- grade_documents : ตัดสินว่า context ตรงคำถามไหม (ใช้ใน LangGraph)
"""

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL

llm = ChatOpenAI(
    model=LLM_MODEL,
    api_key=LLM_API_KEY,
    base_url=LLM_BASE_URL,
    temperature=0,
    max_tokens=1024,
)


def generate_answer(question: str, context: str) -> str:
    """ตอบโดยอิง context เท่านั้น (กันมั่ว)"""
    messages = [
        SystemMessage(
            content=(
                "คุณเป็นผู้ช่วยตอบคำถามจากเอกสารที่ให้มาเท่านั้น "
                "ถ้าข้อมูลใน context ไม่พอ ให้บอกตามตรงว่าไม่พบในเอกสาร "
                "ห้ามเดาหรือแต่งข้อมูลเพิ่ม"
            )
        ),
        HumanMessage(
            content=f"Context:\n{context}\n\nคำถาม:\n{question}"
        ),
    ]
    return llm.invoke(messages).content


def generate_general(question: str) -> str:
    """ตอบจากความรู้ทั่วไปของโมเดล (ใช้เมื่อค้นในเอกสารไม่เจอ — โหมด hybrid)"""
    messages = [
        SystemMessage(
            content=(
                "คุณเป็นผู้ช่วย AI ที่เป็นมิตร ตอบคำถามให้กระชับ ถูกต้อง "
                "ตอบเป็นภาษาเดียวกับคำถาม"
            )
        ),
        HumanMessage(content=question),
    ]
    return llm.invoke(messages).content


def grade_documents(question: str, context: str) -> bool:
    """
    ให้ LLM ตัดสินว่า context เกี่ยวข้องกับคำถามไหม
    คืน True ถ้าเกี่ยว / False ถ้าไม่เกี่ยว
    ใช้เป็น node กรองก่อน generate (กัน hallucinate ตอนค้นไม่เจอของจริง)
    """
    messages = [
        SystemMessage(
            content=(
                "ตัดสินว่าเอกสารที่ให้มาพอจะตอบคำถามได้หรือไม่ "
                "ตอบเป็นคำเดียวเท่านั้น: yes หรือ no"
            )
        ),
        HumanMessage(
            content=f"เอกสาร:\n{context}\n\nคำถาม:\n{question}"
        ),
    ]
    answer = llm.invoke(messages).content.strip().lower()
    return answer.startswith("y")
