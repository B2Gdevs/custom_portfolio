/**
 * Full-run fast path: clone all `rag_chunks` rows from the active ingest run to the new run
 * via one INSERT…SELECT (SQLite + Postgres). Skips hundreds of `payload.create` calls when
 * every source is checksum reuse–eligible. Falls back to Payload API on error (caller).
 */
import pg from 'pg';
import { getPayloadDatabaseFilePath, getPayloadDatabaseUrl, isPayloadUsingPostgres } from '@/lib/payload/runtime-env';
import type { RagSourceKind } from './types';

export type BulkClonedSearchRow = {
  chunkId: number;
  runId: string;
  sourceId: string;
  sourceKind: RagSourceKind;
  sourceScope: string;
  title: string;
  heading: string;
  anchor: string;
  publicUrl: string;
  sourcePath: string;
  content: string;
  embedding: number[];
};

export type BulkCloneRagChunksArgs = {
  oldRunId: number;
  newRunId: number;
  newRunPartitionKey: string;
  expectedRowCount: number;
};

function parseEmbedding(raw: unknown): number[] {
  if (Array.isArray(raw)) {
    return raw.map((n) => Number(n));
  }
  if (typeof raw === 'string') {
    try {
      const v = JSON.parse(raw) as unknown;
      return Array.isArray(v) ? v.map((n) => Number(n)) : [];
    } catch {
      return [];
    }
  }
  if (raw && typeof raw === 'object' && 'length' in (raw as object)) {
    return Array.from(raw as ArrayLike<number>).map(Number);
  }
  return [];
}

function mapReturningRow(
  row: Record<string, unknown>,
  runPartitionKey: string,
): BulkClonedSearchRow {
  return {
    chunkId: Number(row.id),
    runId: runPartitionKey,
    sourceId: String(row.source_external_id ?? ''),
    sourceKind: String(row.source_kind ?? 'doc') as RagSourceKind,
    sourceScope: String(row.source_scope ?? ''),
    title: String(row.source_title ?? ''),
    heading: row.heading == null ? '' : String(row.heading),
    anchor: row.anchor == null ? '' : String(row.anchor),
    publicUrl: String(row.public_url ?? ''),
    sourcePath: String(row.source_path ?? ''),
    content: String(row.content ?? ''),
    embedding: parseEmbedding(row.embedding),
  };
}

export async function bulkCloneRagChunksForFullReuse(
  args: BulkCloneRagChunksArgs,
): Promise<BulkClonedSearchRow[]> {
  if (isPayloadUsingPostgres()) {
    return bulkCloneRagChunksPostgres(args);
  }
  return bulkCloneRagChunksSqlite(args);
}

async function bulkCloneRagChunksPostgres(args: BulkCloneRagChunksArgs): Promise<BulkClonedSearchRow[]> {
  const { oldRunId, newRunId, newRunPartitionKey, expectedRowCount } = args;
  const pool = new pg.Pool({ connectionString: getPayloadDatabaseUrl(), max: 2 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertSql = `
      INSERT INTO rag_chunks (
        vector_key, source_id, run_id, source_external_id, source_title, source_kind, source_scope,
        source_slug, source_path, public_url, chunk_index, heading, anchor, content,
        token_count, content_checksum, embedding_model, embedding_dimensions, embedding,
        is_active, created_at, updated_at
      )
      SELECT
        $1::text || ':' || source_external_id || ':' || (trunc(chunk_index::numeric))::bigint::text,
        source_id,
        $2,
        source_external_id,
        source_title,
        source_kind,
        source_scope,
        source_slug,
        source_path,
        public_url,
        chunk_index,
        heading,
        anchor,
        content,
        token_count,
        content_checksum,
        embedding_model,
        embedding_dimensions,
        embedding,
        false,
        created_at,
        updated_at
      FROM rag_chunks
      WHERE run_id = $3
      ORDER BY source_external_id, chunk_index
      RETURNING id, source_external_id, source_kind, source_scope, source_title,
        heading, anchor, public_url, source_path, content, embedding
    `;
    const result = await client.query<Record<string, unknown>>(insertSql, [
      newRunPartitionKey,
      newRunId,
      oldRunId,
    ]);
    if (result.rows.length !== expectedRowCount) {
      throw new Error(
        `bulk clone row count mismatch: inserted ${result.rows.length}, expected ${expectedRowCount}`,
      );
    }
    await client.query('COMMIT');
    return result.rows.map((row) => mapReturningRow(row, newRunPartitionKey));
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

function bulkCloneRagChunksSqlite(args: BulkCloneRagChunksArgs): BulkClonedSearchRow[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('libsql') as typeof import('libsql');
  const { oldRunId, newRunId, newRunPartitionKey, expectedRowCount } = args;
  const db = new Database(getPayloadDatabaseFilePath());
  try {
    db.exec('BEGIN');
    const insertSql = `
      INSERT INTO rag_chunks (
        vector_key, source_id, run_id, source_external_id, source_title, source_kind, source_scope,
        source_slug, source_path, public_url, chunk_index, heading, anchor, content,
        token_count, content_checksum, embedding_model, embedding_dimensions, embedding,
        is_active, created_at, updated_at
      )
      SELECT
        ? || ':' || source_external_id || ':' || printf('%d', chunk_index),
        source_id,
        ?,
        source_external_id,
        source_title,
        source_kind,
        source_scope,
        source_slug,
        source_path,
        public_url,
        chunk_index,
        heading,
        anchor,
        content,
        token_count,
        content_checksum,
        embedding_model,
        embedding_dimensions,
        embedding,
        0,
        created_at,
        updated_at
      FROM rag_chunks
      WHERE run_id = ?
      ORDER BY source_external_id, chunk_index
      RETURNING id, source_external_id, source_kind, source_scope, source_title,
        heading, anchor, public_url, source_path, content, embedding
    `;
    const stmt = db.prepare(insertSql);
    const rows = stmt.all(newRunPartitionKey, newRunId, oldRunId) as Record<string, unknown>[];
    if (rows.length !== expectedRowCount) {
      db.exec('ROLLBACK');
      throw new Error(
        `bulk clone row count mismatch: inserted ${rows.length}, expected ${expectedRowCount}`,
      );
    }
    db.exec('COMMIT');
    return rows.map((row) => mapReturningRow(row, newRunPartitionKey));
  } catch (e) {
    try {
      db.exec('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw e;
  } finally {
    db.close();
  }
}
