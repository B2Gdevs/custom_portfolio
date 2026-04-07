import { runTsxJsonWorker } from '@/lib/tsx-json-worker';

type SiteAppsWorkerResult = {
  status: number;
  body: unknown;
};

const SITE_APPS_WORKER_TIMEOUT_MS = 3000;

export async function runSiteAppsWorker(): Promise<SiteAppsWorkerResult> {
  return runTsxJsonWorker<SiteAppsWorkerResult>({
    workerScriptRelative: 'scripts/site-apps-worker.ts',
    label: 'site apps',
    timeoutMs: SITE_APPS_WORKER_TIMEOUT_MS,
  });
}
