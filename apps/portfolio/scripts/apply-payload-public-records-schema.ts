import fs from 'node:fs';
import path from 'node:path';
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

  const sqlPath = path.join(process.cwd(), 'scripts', 'sql', 'payload-public-records.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const pool = new pg.Pool({ connectionString: getPayloadDatabaseUrl(), max: 2 });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(
      'OK · project_records / resume_records schema patch applied (tables, rels, helper columns).',
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
