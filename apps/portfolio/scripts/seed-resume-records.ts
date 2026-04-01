import { getResumeSourceEntries } from '@/lib/resumes';
import { syncResumeRecordsSeed } from '@/lib/payload/public-record-seed-sync';
import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

async function main() {
  const summary = await syncResumeRecordsSeed(getResumeSourceEntries());
  console.log(
    `[resume-records:seed] ${summary.created} created, ${summary.updated} updated, ${summary.skipped} skipped`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[resume-records:seed] failed: ${message}`);
  process.exit(1);
});
