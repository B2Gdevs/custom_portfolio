import * as sqliteVec from 'sqlite-vec';
import { getEmbeddingDimensions, getRagDatabaseFilePath } from './config';
import { buildFtsQuery, buildSnippet } from './lexical';
import type { RagSearchHit, RagSourceKind } from './types';

// `libsql` exposes a synchronous SQLite API with `loadExtension`, which is enough for `sqlite-vec`
// and avoids the native `better-sqlite3` binding issues in this environment.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require('libsql');

type SqliteStatement = {
  all: (...args: unknown[]) => unknown[];
  get: (...args: unknown[]) => unknown;
  run: (...args: unknown[]) => unknown;
};

type SqliteDatabase = {
  exec: (sql: string) => void;
  loadExtension: (file: string, entrypoint?: string) => void;
  prepare: (sql: string) => SqliteStatement;
  transaction: <T extends unknown[]>(fn: (...args: T) => void) => (...args: T) => void;
  pragma?: (sql: string, options?: Record<string, unknown>) => unknown;
};

export interface InsertableSearchChunk {
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
}

let searchDb: SqliteDatabase | null = null;

function ensureSearchSchema(db: SqliteDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rag_search_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS rag_chunk_fts USING fts5(
      content,
      title,
      heading,
      source_scope,
      source_kind,
      public_url UNINDEXED,
      source_path UNINDEXED,
      source_id UNINDEXED,
      anchor UNINDEXED,
      run_id UNINDEXED,
      tokenize = 'porter unicode61 remove_diacritics 2'
    );
  `);

  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS rag_chunk_vectors USING vec0(
      chunk_id INTEGER PRIMARY KEY,
      run_id TEXT PARTITION KEY,
      embedding FLOAT[${getEmbeddingDimensions()}]
    );
  `);
}

function getDb(): SqliteDatabase {
  if (!searchDb) {
    const opened = new Database(getRagDatabaseFilePath()) as SqliteDatabase;
    opened.pragma?.('journal_mode = WAL');
    sqliteVec.load(opened);
    ensureSearchSchema(opened);
    searchDb = opened;
  }

  return searchDb;
}

export function setActiveRunId(runId: string) {
  const db = getDb();
  db.prepare(`
    INSERT INTO rag_search_state(key, value)
    VALUES ('active_run_id', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(runId);
}

export function getActiveRunId(): string | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT value FROM rag_search_state WHERE key = 'active_run_id'`)
    .get() as { value: string } | undefined;
  return row?.value ?? null;
}

export function replaceRunChunks(runId: string, chunks: InsertableSearchChunk[]) {
  const db = getDb();
  const clearFts = db.prepare('DELETE FROM rag_chunk_fts WHERE run_id = ?');
  const clearVec = db.prepare('DELETE FROM rag_chunk_vectors WHERE run_id = ?');
  const insertFts = db.prepare(`
    INSERT INTO rag_chunk_fts(
      rowid,
      content,
      title,
      heading,
      source_scope,
      source_kind,
      public_url,
      source_path,
      source_id,
      anchor,
      run_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertVec = db.prepare(`
    INSERT INTO rag_chunk_vectors(chunk_id, run_id, embedding)
    VALUES (?, ?, ?)
  `);

  const transaction = db.transaction((rows: InsertableSearchChunk[]) => {
    clearFts.run(runId);
    clearVec.run(runId);

    for (const row of rows) {
      const chunkId = Number(row.chunkId);
      const vectorChunkId = BigInt(chunkId);
      insertFts.run(
        chunkId,
        row.content,
        row.title,
        row.heading,
        row.sourceScope,
        row.sourceKind,
        row.publicUrl,
        row.sourcePath,
        row.sourceId,
        row.anchor,
        row.runId,
      );
      insertVec.run(vectorChunkId, row.runId, new Float32Array(row.embedding));
    }
  });

  transaction(chunks);
}

export function clearRun(runId: string) {
  const db = getDb();
  db.prepare('DELETE FROM rag_chunk_fts WHERE run_id = ?').run(runId);
  db.prepare('DELETE FROM rag_chunk_vectors WHERE run_id = ?').run(runId);
}

export function pruneInactiveRuns(activeRunId: string) {
  const db = getDb();
  db.prepare('DELETE FROM rag_chunk_fts WHERE run_id != ?').run(activeRunId);
  db.prepare('DELETE FROM rag_chunk_vectors WHERE run_id != ?').run(activeRunId);
}

export function searchSemanticRagHits(
  queryEmbedding: number[],
  query: string,
  options?: { candidateLimit?: number },
): RagSearchHit[] {
  const activeRunId = getActiveRunId();
  if (!activeRunId) {
    return [];
  }

  const candidateLimit = options?.candidateLimit ?? 12;
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT
        rag_chunk_vectors.chunk_id AS chunkId,
        rag_chunk_vectors.distance AS distance,
        rag_chunk_fts.source_id AS sourceId,
        rag_chunk_fts.source_kind AS sourceKind,
        rag_chunk_fts.source_scope AS sourceScope,
        rag_chunk_fts.title AS title,
        rag_chunk_fts.heading AS heading,
        rag_chunk_fts.anchor AS anchor,
        rag_chunk_fts.public_url AS publicUrl,
        rag_chunk_fts.source_path AS sourcePath,
        rag_chunk_fts.content AS content
      FROM rag_chunk_vectors
      JOIN rag_chunk_fts ON rag_chunk_fts.rowid = rag_chunk_vectors.chunk_id
      WHERE rag_chunk_vectors.embedding MATCH ?
        AND k = ?
        AND rag_chunk_vectors.run_id = ?
      ORDER BY rag_chunk_vectors.distance ASC
    `)
    .all(
      new Float32Array(queryEmbedding),
      candidateLimit,
      activeRunId,
    ) as Array<{
      chunkId: number;
      distance: number;
      sourceId: string;
      sourceKind: RagSourceKind;
      sourceScope: string;
      title: string;
      heading: string;
      anchor: string;
      publicUrl: string;
      sourcePath: string;
      content: string;
    }>;

  return rows.map((row) => ({
    ...row,
    snippet: buildSnippet(row.content, query),
    score: 1 / (1 + row.distance),
  }));
}

export function rerankRagHits(
  query: string,
  hits: RagSearchHit[],
  options?: { resultLimit?: number },
): RagSearchHit[] {
  if (!hits.length) {
    return [];
  }

  const activeRunId = getActiveRunId();
  const ftsQuery = buildFtsQuery(query);
  if (!activeRunId || !ftsQuery) {
    return hits.slice(0, options?.resultLimit ?? 6);
  }

  const db = getDb();
  const rowIds = hits.map((hit) => hit.chunkId);
  const placeholders = rowIds.map(() => '?').join(', ');
  const lexicalRows = db
    .prepare(`
      SELECT rowid AS chunkId, bm25(rag_chunk_fts) AS score
      FROM rag_chunk_fts
      WHERE rag_chunk_fts MATCH ?
        AND run_id = ?
        AND rowid IN (${placeholders})
      ORDER BY score ASC
    `)
    .all(ftsQuery, activeRunId, ...rowIds) as Array<{ chunkId: number; score: number }>;

  const lexicalScoreByChunk = new Map<number, number>();
  const total = lexicalRows.length || 1;
  lexicalRows.forEach((row, index) => {
    lexicalScoreByChunk.set(row.chunkId, (total - index) / total);
  });

  return [...hits]
    .map((hit) => {
      const semanticScore = 1 / (1 + hit.distance);
      const lexicalScore = lexicalScoreByChunk.get(hit.chunkId) ?? 0;
      return {
        ...hit,
        score: semanticScore + lexicalScore * 0.35,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, options?.resultLimit ?? 6);
}
