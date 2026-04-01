/**
 * RAG vector + lexical search: SQLite sidecar (`sqlite-vec` + FTS5) when Payload uses SQLite,
 * or Postgres + `pgvector` on the same `DATABASE_URL` when Payload uses Supabase Postgres.
 */
export * from './vector-store';
