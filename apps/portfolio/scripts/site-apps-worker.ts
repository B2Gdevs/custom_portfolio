/**
 * Optional: run `pnpm exec tsx scripts/site-apps-worker.ts` locally to print the same JSON as production.
 * Runtime `/apps` uses `loadSiteAppsFromPayload()` in-process (no subprocess).
 */
import { loadSiteAppsFromPayload } from '@/lib/site-apps-load';

async function main() {
  const { apps, loadError } = await loadSiteAppsFromPayload();
  process.stdout.write(
    JSON.stringify({
      apps,
      loadError,
    }),
  );
}

main().catch((error) => {
  process.stderr.write(String(error));
  process.exitCode = 1;
});
