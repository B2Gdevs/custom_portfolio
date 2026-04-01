/**
 * Adds missing FK columns on `payload_locked_documents_rels` when Payload’s document-lock
 * queries reference collections (e.g. project-records, resume-records) that exist in config
 * but were added after the table was first created on Postgres (Supabase schema drift).
 *
 * Safe to run multiple times (IF NOT EXISTS). Requires Postgres Payload + DATABASE_URL.
 */
import pg from 'pg';
import { getPayloadDatabaseUrl, isPayloadUsingPostgres } from '@/lib/payload/runtime-env';
import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

async function main() {
  if (!isPayloadUsingPostgres()) {
    console.log(
      'Skipping: Payload is not on Postgres (set PAYLOAD_DB_PROVIDER=postgres and DATABASE_URL).',
    );
    return;
  }

  const pool = new pg.Pool({ connectionString: getPayloadDatabaseUrl(), max: 2 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE payload_locked_documents_rels
        ADD COLUMN IF NOT EXISTS project_records_id integer
    `);
    await client.query(`
      ALTER TABLE payload_locked_documents_rels
        ADD COLUMN IF NOT EXISTS resume_records_id integer
    `);
    await client.query('COMMIT');
    console.log(
      'OK · payload_locked_documents_rels now has project_records_id / resume_records_id (if they were missing).',
    );
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
