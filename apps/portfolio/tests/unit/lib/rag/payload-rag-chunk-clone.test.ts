import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { bulkCloneRagChunksForFullReuse } from '@/lib/rag/payload-rag-chunk-clone';

const envKeys = ['PAYLOAD_DB_PROVIDER', 'DATABASE_FILE', 'DATABASE_URL'] as const;
let envSnapshot: Partial<Record<(typeof envKeys)[number], string | undefined>> = {};

describe('bulkCloneRagChunksForFullReuse (sqlite)', () => {
  let tmpDir: string;
  let dbPath: string;

  beforeEach(() => {
    envSnapshot = {};
    for (const key of envKeys) {
      envSnapshot[key] = process.env[key];
    }

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-bulk-clone-'));
    dbPath = path.join(tmpDir, 'payload-test.db');

    process.env.PAYLOAD_DB_PROVIDER = 'sqlite';
    process.env.DATABASE_FILE = dbPath;
    delete process.env.DATABASE_URL;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('libsql') as typeof import('libsql');
    const db = new Database(dbPath);
    db.exec(`
      CREATE TABLE rag_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vector_key TEXT NOT NULL UNIQUE,
        source_id INTEGER NOT NULL,
        run_id INTEGER NOT NULL,
        source_external_id TEXT NOT NULL,
        source_title TEXT NOT NULL,
        source_kind TEXT NOT NULL,
        source_scope TEXT NOT NULL,
        source_slug TEXT NOT NULL,
        source_path TEXT NOT NULL,
        public_url TEXT NOT NULL,
        chunk_index REAL NOT NULL,
        heading TEXT,
        anchor TEXT,
        content TEXT NOT NULL,
        token_count REAL NOT NULL,
        content_checksum TEXT NOT NULL,
        embedding_model TEXT NOT NULL,
        embedding_dimensions REAL NOT NULL,
        embedding TEXT NOT NULL,
        is_active INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    const ins = db.prepare(`
      INSERT INTO rag_chunks (
        vector_key, source_id, run_id, source_external_id, source_title, source_kind, source_scope,
        source_slug, source_path, public_url, chunk_index, heading, anchor, content,
        token_count, content_checksum, embedding_model, embedding_dimensions, embedding,
        is_active, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);

    ins.run(
      '5:docs:a:0',
      1,
      5,
      'docs:a',
      'A',
      'doc',
      'docs',
      'a',
      'apps/x.mdx',
      '/docs/a',
      0,
      '',
      '',
      'body',
      1,
      'chk',
      'm',
      384,
      '[0.1,0.2]',
      1,
      '2020-01-01T00:00:00.000Z',
      '2020-01-01T00:00:00.000Z',
    );
    ins.run(
      '5:docs:b:0',
      1,
      5,
      'docs:b',
      'B',
      'doc',
      'docs',
      'b',
      'apps/y.mdx',
      '/docs/b',
      0,
      '',
      '',
      'body2',
      1,
      'chk2',
      'm',
      384,
      '[0.3]',
      1,
      '2020-01-01T00:00:00.000Z',
      '2020-01-01T00:00:00.000Z',
    );
    db.close();
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* Windows may hold libsql handles briefly */
    }
    for (const key of envKeys) {
      const v = envSnapshot[key];
      if (v === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = v;
      }
    }
  });

  it('clones all rows for a new run and returns search rows', async () => {
    const rows = await bulkCloneRagChunksForFullReuse({
      oldRunId: 5,
      newRunId: 7,
      newRunPartitionKey: '7',
      expectedRowCount: 2,
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].runId).toBe('7');
    expect(rows[0].sourceId).toBe('docs:a');
    expect(rows[0].embedding).toEqual([0.1, 0.2]);
    expect(rows[1].sourceId).toBe('docs:b');
    expect(rows[1].embedding).toEqual([0.3]);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('libsql') as typeof import('libsql');
    const db = new Database(dbPath);
    const count7 = db.prepare('SELECT COUNT(*) AS c FROM rag_chunks WHERE run_id = ?').get(7) as {
      c: number;
    };
    const keys7 = db
      .prepare('SELECT vector_key FROM rag_chunks WHERE run_id = ? ORDER BY vector_key')
      .all(7) as Array<{ vector_key: string }>;
    db.close();

    expect(count7.c).toBe(2);
    expect(keys7.map((r) => r.vector_key)).toEqual(['7:docs:a:0', '7:docs:b:0']);
  });
});
