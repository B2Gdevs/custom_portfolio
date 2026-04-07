import { runTsxJsonWorkerWithStdin } from '@/lib/tsx-json-worker';

type ReaderStateWorkerResult = {
  status: number;
  body: unknown;
  setCookie?: string;
};

export async function runReaderStateWorker(payload: unknown): Promise<ReaderStateWorkerResult> {
  return runTsxJsonWorkerWithStdin<ReaderStateWorkerResult>({
    workerScriptRelative: 'scripts/reader-state-worker.ts',
    label: 'reader state',
    payload,
  });
}
