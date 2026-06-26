-- รันใน Supabase > SQL Editor ครั้งเดียวตอนตั้งค่า
-- (มิติ 1024 = jina-embeddings-v3 ; ถ้าเปลี่ยน model ต้องแก้เลขให้ตรง)

-- 1) เปิด pgvector
create extension if not exists vector;

-- 2) ตารางเก็บ chunk + embedding
--    session_id : ติดป้ายว่า chunk นี้ของเซสชันไหน (โหมด ephemeral ใช้แล้วทิ้ง)
create table if not exists documents (
  id         bigserial primary key,
  content    text,
  embedding  vector(1024),
  metadata   jsonb default '{}'::jsonb,
  session_id text,
  created_at timestamptz default now()
);

-- 3) index แบบ cosine (HNSW) ให้ค้นเร็ว + index session ให้กรองเร็ว
create index if not exists documents_embedding_idx
  on documents
  using hnsw (embedding vector_cosine_ops);
create index if not exists documents_session_idx on documents (session_id);

-- 4) function ค้น top-k ที่ใกล้ที่สุด เฉพาะใน session ของผู้ถาม
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
  where session_id = p_session_id
  order by embedding <=> query_embedding
  limit match_count;
$$;
