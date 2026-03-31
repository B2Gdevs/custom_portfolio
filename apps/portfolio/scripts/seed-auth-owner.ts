import { ensureOwnerSeed } from '@/lib/auth/seed';
import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

async function main() {
  const result = await ensureOwnerSeed();
  const status = [
    result.createdTenant ? 'created tenant' : 'reused tenant',
    result.createdUser ? 'created owner user' : 'reused owner user',
  ].join(', ');

  console.log(
    `[auth:seed] ${status} (${result.tenantId} / ${result.userId})`,
  );

  process.exit(0);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[auth:seed] failed: ${message}`);
  process.exit(1);
});
