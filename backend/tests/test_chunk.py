"""เทสต์ logic ล้วน ๆ ที่ไม่ต้องพึ่ง API/network"""

from app.services.chunk_service import chunk_text


def test_chunk_overlap():
    text = "a" * 1200
    chunks = chunk_text(text, size=500, overlap=100)
    # step = 400 -> ก้อนที่ index 0,400,800,1200... ครอบคลุมทั้ง 1200 ตัว
    assert len(chunks) == 3
    assert all(len(c) <= 500 for c in chunks)


def test_chunk_rejects_bad_overlap():
    try:
        chunk_text("hello", size=100, overlap=100)
        assert False, "ควร raise ValueError"
    except ValueError:
        pass
