import { runTsxJsonWorkerWithStdin } from '@/lib/tsx-json-worker';

type ListenCatalogWorkerResult = {
  status: number;
  body: unknown;
  setCookie?: string;
};

export async function runListenCatalogWorker(payload: {
  cookieHeader: string;
}): Promise<ListenCatalogWorkerResult> {
  return runTsxJsonWorkerWithStdin<ListenCatalogWorkerResult>({
    workerScriptRelative: 'scripts/listen-catalog-worker.ts',
    label: 'listen catalog',
    payload,
  });
}
