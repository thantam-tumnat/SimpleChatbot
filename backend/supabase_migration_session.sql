-- Migration: เพิ่มระบบ session (ephemeral) ให้ตาราง documents
-- รันใน Supabase > SQL Editor ครั้งเดียว

-- 1) เพิ่มคอลัมน์ session_id : ติดป้ายว่า chunk นี้เป็นของเซสชันไหน
alter table documents add column if not exists session_id text;

-- 2) index ให้กรองตาม session ได้เร็ว
create index if not exists documents_session_idx on documents (session_id);

-- 3) ลบฟังก์ชันเดิม (2 อาร์กิวเมนต์) แล้วสร้างใหม่ที่กรองตาม session
drop function if exists match_documents(vector, int);

create or replace function match_documents(
  query_embedding vector(1024),
  match_count int default 4,
  p_session_id text default null
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  where session_id = p_session_id          -- กรองเฉพาะเอกสารของเซสชันที่ถาม
  order by embedding <=> query_embedding
  limit match_count;
$$;
