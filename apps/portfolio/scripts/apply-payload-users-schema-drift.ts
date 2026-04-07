/**
 * Aligns `users` with Payload config when Postgres predates fields (`disabled`, `externalIds`).
 * Safe to run multiple times. Requires Postgres Payload + DATABASE_URL.
 *
 * Pair with: `payload:fix-tenants-external-ids`, `payload:fix-locks-rels` when schema drifts.
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
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS external_ids_clerk_id varchar
    `);
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS external_ids_stripe_customer_id varchar
    `);

    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS disabled boolean
    `);
    await client.query(`
      UPDATE users SET disabled = false WHERE disabled IS NULL
    `);
    await client.query(`
      ALTER TABLE users
        ALTER COLUMN disabled SET DEFAULT false
    `);
    await client.query(`
      ALTER TABLE users
        ALTER COLUMN disabled SET NOT NULL
    `);

    await client.query('COMMIT');
    console.log(
      'OK · users now has disabled + external_ids_clerk_id / external_ids_stripe_customer_id (if they were missing).',
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
