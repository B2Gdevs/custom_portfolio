import type { FindSiteDownloadAssetsInput } from '@/lib/site-download-assets';
import { runTsxJsonWorker } from '@/lib/tsx-json-worker';

type SiteDownloadAssetsWorkerResult = {
  status: number;
  body: unknown;
};

const SITE_DOWNLOAD_ASSETS_WORKER_TIMEOUT_MS = 3000;

export async function runSiteDownloadAssetsWorker(
  filters: FindSiteDownloadAssetsInput,
): Promise<SiteDownloadAssetsWorkerResult> {
  return runTsxJsonWorker<SiteDownloadAssetsWorkerResult>({
    workerScriptRelative: 'scripts/site-download-assets-worker.ts',
    label: 'site download assets',
    timeoutMs: SITE_DOWNLOAD_ASSETS_WORKER_TIMEOUT_MS,
    extraArgs: [JSON.stringify(filters)],
  });
}
