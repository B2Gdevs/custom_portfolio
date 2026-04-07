/**
 * Adds `tenants.externalIds` group columns on Postgres when the table was created before
 * those fields existed (schema drift). Payload queries always SELECT these columns.
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
      ALTER TABLE tenants
        ADD COLUMN IF NOT EXISTS external_ids_clerk_org_id varchar
    `);
    await client.query(`
      ALTER TABLE tenants
        ADD COLUMN IF NOT EXISTS external_ids_stripe_account_id varchar
    `);
    await client.query('COMMIT');
    console.log(
      'OK · tenants now has external_ids_clerk_org_id / external_ids_stripe_account_id (if they were missing).',
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
