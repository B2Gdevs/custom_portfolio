import { getAllContentEntries } from '@/lib/content';
import { syncProjectRecordsSeed } from '@/lib/payload/public-record-seed-sync';
import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

async function main() {
  const summary = await syncProjectRecordsSeed(getAllContentEntries('projects'));
  console.log(
    `[project-records:seed] ${summary.created} created, ${summary.updated} updated, ${summary.skipped} skipped`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[project-records:seed] failed: ${message}`);
  process.exit(1);
});
