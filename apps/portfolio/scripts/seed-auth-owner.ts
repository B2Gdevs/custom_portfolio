import 'dotenv/config';
import { ensureOwnerSeed } from '@/lib/auth/seed';

async function main() {
  const result = await ensureOwnerSeed();
  const status = [
    result.createdTenant ? 'created tenant' : 'reused tenant',
    result.createdUser ? 'created owner user' : 'reused owner user',
  ].join(', ');

  console.log(
    `[auth:seed] ${status} (${result.tenantId} / ${result.userId})`,
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[auth:seed] failed: ${message}`);
  process.exitCode = 1;
});
