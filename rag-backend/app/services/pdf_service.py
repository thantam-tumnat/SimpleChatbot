"""
PDF Service

ดึงข้อความออกจากไฟล์ PDF ด้วย PyMuPDF (fitz)
PyMuPDF เป็น C library เบา ไม่ลาก torch มาด้วย

(ยกแนวมาจาก PrivateRAG2)
"""

import fitz  # PyMuPDF


def extract_text(pdf_path) -> str:
    doc = fitz.open(pdf_path)

    text = ""
    for page in doc:
        text += page.get_text()

    doc.close()
    return text


def extract_text_from_bytes(data: bytes) -> str:
    """อ่าน PDF จาก bytes ที่อัปโหลดเข้ามา (ไม่ต้องเซฟลงดิสก์)"""
    doc = fitz.open(stream=data, filetype="pdf")

    text = ""
    for page in doc:
        text += page.get_text()

    doc.close()
    return text
