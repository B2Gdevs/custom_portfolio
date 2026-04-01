import pg from 'pg';
import { getEmbeddingDimensions } from './config';
import { buildFtsQuery, buildSnippet, lexicalOverlap } from './lexical';
import type { InsertableSearchChunk } from './search-sqlite';
import type { RagSearchHit, RagSourceKind } from './types';

let pool: pg.Pool | null = null;
let schemaPromise: Promise<void> | null = null;

function getPool(): pg.Pool {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      'Postgres RAG vector store requires DATABASE_URL (same Supabase Postgres as Payload).',
    );
  }
  if (!pool) {
    pool = new pg.Pool({ connectionString: url, max: 8 });
  }
  return pool;
}

/** Release pg connections so Node can exit (CLI ingest holds the pool open otherwise). */
export async function endRagSearchPgPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
  schemaPromise = null;
}

function vectorParam(embedding: number[]): string {
  return `[${embedding.map((n) => (Number.isFinite(n) ? n : 0)).join(',')}]`;
}

async function ensureSchema(): Promise<void> {
  if (schemaPromise) {
    return schemaPromise;
  }

  const p = getPool();
  const dim = getEmbeddingDimensions();

  schemaPromise = (async () => {
    await p.query('CREATE EXTENSION IF NOT EXISTS vector');
    await p.query(`
      CREATE TABLE IF NOT EXISTS rag_search_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    await p.query(`
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
        embedding vector(${dim}) NOT NULL
      )
    `);
    await p.query(`
      CREATE INDEX IF NOT EXISTS rag_chunk_search_run_id_idx ON rag_chunk_search(run_id)
    `);
    try {
      await p.query(`
        CREATE INDEX IF NOT EXISTS rag_chunk_search_embedding_hnsw_idx
        ON rag_chunk_search USING hnsw (embedding vector_cosine_ops)
      `);
    } catch {
      // HNSW may be unavailable on older pgvector; queries still work without it.
    }
  })();

  return schemaPromise;
}

export async function setActiveRunId(runId: string): Promise<void> {
  await ensureSchema();
  const p = getPool();
  await p.query(
    `
    INSERT INTO rag_search_state(key, value)
    VALUES ('active_run_id', $1)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `,
    [runId],
  );
}

export async function getActiveRunId(): Promise<string | null> {
  await ensureSchema();
  const p = getPool();
  const r = await p.query<{ value: string }>(
    `SELECT value FROM rag_search_state WHERE key = 'active_run_id'`,
  );
  return r.rows[0]?.value ?? null;
}

/** Multi-row INSERT batch size (12 params/row; stay well under Postgres ~65535 param limit). */
const PG_VECTOR_INSERT_BATCH = 48;

export type ReplaceRunChunksPgOptions = {
  /** Fires after each batch completes (and at 0/total before work) so the CLI can show progress. */
  onProgress?: (written: number, total: number) => void;
};

export async function replaceRunChunks(
  runId: string,
  chunks: InsertableSearchChunk[],
  options?: ReplaceRunChunksPgOptions,
): Promise<void> {
  await ensureSchema();
  const onProgress = options?.onProgress;
  const client = await getPool().connect();
  const total = chunks.length;
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM rag_chunk_search WHERE run_id = $1`, [runId]);
    onProgress?.(0, total);

    for (let start = 0; start < chunks.length; start += PG_VECTOR_INSERT_BATCH) {
      const slice = chunks.slice(start, start + PG_VECTOR_INSERT_BATCH);
      const valueClauses: string[] = [];
      const params: unknown[] = [];
      let p = 1;
      for (const row of slice) {
        valueClauses.push(
          `($${p}, $${p + 1}, $${p + 2}, $${p + 3}, $${p + 4}, $${p + 5}, $${p + 6}, $${p + 7}, $${p + 8}, $${p + 9}, $${p + 10}, $${p + 11}::vector)`,
        );
        p += 12;
        params.push(
          row.chunkId,
          row.runId,
          row.sourceId,
          row.sourceKind,
          row.sourceScope,
          row.title,
          row.heading,
          row.anchor,
          row.publicUrl,
          row.sourcePath,
          row.content,
          vectorParam(row.embedding),
        );
      }
      await client.query(
        `
        INSERT INTO rag_chunk_search (
          chunk_id, run_id, source_id, source_kind, source_scope,
          title, heading, anchor, public_url, source_path, content, embedding
        ) VALUES ${valueClauses.join(', ')}
      `,
        params,
      );
      onProgress?.(Math.min(start + slice.length, total), total);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function clearRun(runId: string): Promise<void> {
  await ensureSchema();
  await getPool().query(`DELETE FROM rag_chunk_search WHERE run_id = $1`, [runId]);
}

export async function pruneInactiveRuns(activeRunId: string): Promise<void> {
  await ensureSchema();
  await getPool().query(`DELETE FROM rag_chunk_search WHERE run_id <> $1`, [activeRunId]);
}

export async function searchSemanticRagHits(
  queryEmbedding: number[],
  query: string,
  options?: { candidateLimit?: number },
): Promise<RagSearchHit[]> {
  await ensureSchema();
  const activeRunId = await getActiveRunId();
  if (!activeRunId) {
    return [];
  }

  const candidateLimit = options?.candidateLimit ?? 12;
  const p = getPool();
  const vec = vectorParam(queryEmbedding);
  const r = await p.query<{
    chunkId: string;
    distance: string;
    sourceId: string;
    sourceKind: RagSourceKind;
    sourceScope: string;
    title: string;
    heading: string;
    anchor: string;
    publicUrl: string;
    sourcePath: string;
    content: string;
  }>(
    `
    SELECT
      chunk_id AS "chunkId",
      (embedding <=> $1::vector) AS distance,
      source_id AS "sourceId",
      source_kind AS "sourceKind",
      source_scope AS "sourceScope",
      title AS "title",
      heading AS "heading",
      anchor AS "anchor",
      public_url AS "publicUrl",
      source_path AS "sourcePath",
      content AS "content"
    FROM rag_chunk_search
    WHERE run_id = $2
    ORDER BY embedding <=> $1::vector
    LIMIT $3
  `,
    [vec, activeRunId, candidateLimit],
  );

  return r.rows.map((row) => {
    const chunkId = Number(row.chunkId);
    const distance = Number(row.distance);
    return {
      chunkId,
      sourceId: row.sourceId,
      sourceKind: row.sourceKind,
      sourceScope: row.sourceScope,
      title: row.title,
      heading: row.heading,
      anchor: row.anchor,
      publicUrl: row.publicUrl,
      sourcePath: row.sourcePath,
      content: row.content,
      snippet: buildSnippet(row.content, query),
      distance,
      score: 1 / (1 + distance),
    };
  });
}

export async function rerankRagHits(
  query: string,
  hits: RagSearchHit[],
  options?: { resultLimit?: number },
): Promise<RagSearchHit[]> {
  if (!hits.length) {
    return [];
  }

  const activeRunId = await getActiveRunId();
  const ftsQuery = buildFtsQuery(query);
  if (!activeRunId || !ftsQuery) {
    return hits.slice(0, options?.resultLimit ?? 6);
  }

  return [...hits]
    .map((hit) => {
      const semanticScore = 1 / (1 + hit.distance);
      const lexicalScore = lexicalOverlap(
        `${hit.content} ${hit.title} ${hit.heading}`,
        query,
      );
      return {
        ...hit,
        score: semanticScore + lexicalScore * 0.35,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, options?.resultLimit ?? 6);
}
