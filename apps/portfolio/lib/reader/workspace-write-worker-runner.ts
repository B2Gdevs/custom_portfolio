import { runTsxJsonWorkerWithStdin } from '@/lib/tsx-json-worker';

type ReaderWorkspaceWriteWorkerResult = {
  status: number;
  body: unknown;
  setCookie?: string;
};

export async function runReaderWorkspaceWriteWorker(
  payload: unknown,
): Promise<ReaderWorkspaceWriteWorkerResult> {
  return runTsxJsonWorkerWithStdin<ReaderWorkspaceWriteWorkerResult>({
    workerScriptRelative: 'scripts/reader-workspace-write-worker.ts',
    label: 'reader workspace write',
    payload,
  });
}
