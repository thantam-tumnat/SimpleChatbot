"""
RAG Graph (LangGraph)

flow:
    retrieve --> grade --[relevant]--> generate --> END
                       \--[not]------> no_answer --> END

เหตุผลที่ใช้ LangGraph แทน if-else ธรรมดา:
- มี conditional branch (grade) ที่กัน hallucinate ก่อน generate
- ขยาย node เพิ่มได้ง่าย (เช่น rewrite query, web fallback) โดยไม่รื้อ logic เดิม
"""

from langgraph.graph import END, StateGraph

from app.graph.state import RAGState
from app.services import embedding_service, llm_service, vector_service


# ---- nodes ----

def retrieve(state: RAGState) -> RAGState:
    """embed คำถาม -> ค้น top-k chunk จาก pgvector (เฉพาะ session ของผู้ถาม)"""
    query_vector = embedding_service.embed_query(state["question"])
    docs = vector_service.match_documents(
        query_vector, session_id=state["session_id"], match_count=4
    )
    return {"documents": docs}


def grade(state: RAGState) -> RAGState:
    """ตัดสินว่า chunk ที่ได้ตรงคำถามไหม"""
    docs = state["documents"]
    if not docs:
        return {"relevant": False}

    context = "\n\n".join(docs)
    return {"relevant": llm_service.grade_documents(state["question"], context)}


def generate(state: RAGState) -> RAGState:
    """ตอบจาก context"""
    context = "\n\n".join(state["documents"])
    answer = llm_service.generate_answer(state["question"], context)
    return {"answer": answer}


def general(state: RAGState) -> RAGState:
    """ค้นในเอกสารไม่เจอ -> ตอบจากความรู้ทั่วไปแทน (โหมด hybrid)"""
    answer = llm_service.generate_general(state["question"])
    return {"answer": answer}


# ---- conditional edge ----

def route_after_grade(state: RAGState) -> str:
    return "generate" if state["relevant"] else "general"


# ---- build graph ----

def build_graph():
    g = StateGraph(RAGState)

    g.add_node("retrieve", retrieve)
    g.add_node("grade", grade)
    g.add_node("generate", generate)
    g.add_node("general", general)

    g.set_entry_point("retrieve")
    g.add_edge("retrieve", "grade")
    g.add_conditional_edges(
        "grade",
        route_after_grade,
        {"generate": "generate", "general": "general"},
    )
    g.add_edge("generate", END)
    g.add_edge("general", END)

    return g.compile()


# compile ครั้งเดียวตอน import แล้วใช้ซ้ำ
rag_app = build_graph()


def ask(question: str, session_id: str) -> dict:
    """entry point ให้ router เรียก"""
    if not question or not question.strip():
        return {"answer": "กรุณาพิมพ์คำถาม", "context": []}

    result = rag_app.invoke({"question": question, "session_id": session_id})
    # ส่ง context กลับเฉพาะตอนตอบจากเอกสาร (relevant=True)
    # ถ้าตอบจากความรู้ทั่วไป context จะเป็น [] -> frontend แยกได้ว่าคำตอบมาจากไหน
    return {
        "answer": result["answer"],
        "context": result.get("documents", []) if result.get("relevant") else [],
    }
