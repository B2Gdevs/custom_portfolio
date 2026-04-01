-- Optional: run in Supabase SQL editor if you prefer to create objects before first ingest.
-- Otherwise the app runs equivalent DDL on first RAG ingest when using Postgres + pgvector.

CREATE EXTENSION IF NOT EXISTS vector;

-- Dimension must match RAG_LOCAL_EMBEDDING_DIMENSIONS (default 384 for MiniLM).
CREATE TABLE IF NOT EXISTS rag_search_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rag_chunk_search (
  chunk_id BIGINT PRIMARY KEY,
  run_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_kind TEXT NOT NULL,
  source_scope TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  heading TEXT NOT NULL DEFAULT '',
  anchor TEXT NOT NULL DEFAULT '',
  public_url TEXT NOT NULL DEFAULT '',
  source_path TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  embedding vector(384) NOT NULL
);

CREATE INDEX IF NOT EXISTS rag_chunk_search_run_id_idx ON rag_chunk_search(run_id);

CREATE INDEX IF NOT EXISTS rag_chunk_search_embedding_hnsw_idx
  ON rag_chunk_search USING hnsw (embedding vector_cosine_ops);
