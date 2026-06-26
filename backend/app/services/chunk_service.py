"""
Chunk Service

แบ่งข้อความยาว ๆ เป็นชิ้นเล็ก (chunk) แบบเหลื่อมกัน (overlap)
เพื่อให้ embedding จับใจความได้ดีและ retrieve แม่นขึ้น

(ยกแนวมาจาก PrivateRAG2 — logic เดิม ไม่พึ่ง torch)
"""


def chunk_text(text: str, size: int = 500, overlap: int = 100) -> list[str]:
    # overlap ต้องน้อยกว่า size เสมอ ไม่งั้น step <= 0 แล้ว loop วนไม่รู้จบ
    if overlap >= size:
        raise ValueError("overlap ต้องน้อยกว่า size")

    # ก้าวทีละ (size - overlap) เพื่อให้แต่ละ chunk เหลื่อมกันเป็นระยะ overlap
    step = size - overlap

    chunks = []
    for i in range(0, len(text), step):
        chunk = text[i:i + size].strip()
        if chunk:  # ข้าม chunk ว่าง
            chunks.append(chunk)

    return chunks
