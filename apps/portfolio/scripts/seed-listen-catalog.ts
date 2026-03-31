import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

async function main() {
  process.env.PAYLOAD_MIGRATING = 'true';

  const { seedListenCatalog } = await import('@/lib/listen/seed');
  const result = await seedListenCatalog();
  console.log(
    `[listen:seed] seeded ${result.total} rows (${result.created} created, ${result.updated} updated) for tenant ${result.tenantId}`,
  );

  process.exit(0);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[listen:seed] failed: ${message}`);
  process.exit(1);
});
