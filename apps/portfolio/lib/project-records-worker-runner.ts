import { runTsxJsonWorker } from '@/lib/tsx-json-worker';

type ProjectRecordsWorkerResult = {
  status: number;
  body: unknown;
};

const PROJECT_RECORDS_WORKER_TIMEOUT_MS = 3000;

export async function runProjectRecordsWorker(): Promise<ProjectRecordsWorkerResult> {
  return runTsxJsonWorker<ProjectRecordsWorkerResult>({
    workerScriptRelative: 'scripts/project-records-worker.ts',
    label: 'project records',
    timeoutMs: PROJECT_RECORDS_WORKER_TIMEOUT_MS,
  });
}
