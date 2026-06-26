"""
Config

อ่าน environment variable ที่เดียว แล้วให้ที่อื่น import ไปใช้
- ตอน dev: อ่านจากไฟล์ .env (ผ่าน python-dotenv)
- ตอน deploy: อ่านจาก env vars ที่ตั้งบน Render
"""

import os

from dotenv import load_dotenv

load_dotenv()


# ---- LLM (chat) : ใช้ gateway 9arm แบบ OpenAI-compatible ----
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://gateway.9arm.co/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "qwen3.6-35b-a3b")

# ---- Embedding : ใช้ Jina API (ไม่มี torch ในเครื่อง) ----
JINA_API_KEY = os.getenv("JINA_API_KEY", "")
JINA_MODEL = os.getenv("JINA_MODEL", "jina-embeddings-v3")

# มิติของ vector ต้องตรงกับ model
# jina-embeddings-v3 = 1024 (ต้องตรงกับคอลัมน์ vector(1024) ใน Supabase)
EMBED_DIM = int(os.getenv("EMBED_DIM", "1024"))

# ---- Vector store : Supabase pgvector ----
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# ---- CORS : domain ของ Next.js ที่อนุญาตให้เรียก ----
# คั่นด้วย comma เช่น "http://localhost:3000,https://xxx.vercel.app"
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000",
).split(",")


def require(name: str, value: str) -> str:
    """กันลืมตั้ง env สำคัญ — เรียกใน startup เพื่อ fail ไว ๆ พร้อมบอกชื่อ"""
    if not value:
        raise RuntimeError(f"ขาด environment variable: {name}")
    return value
