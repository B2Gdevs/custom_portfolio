import { runTsxJsonWorker } from '@/lib/tsx-json-worker';

type ResumeRecordsWorkerResult = {
  status: number;
  body: unknown;
};

const RESUME_RECORDS_WORKER_TIMEOUT_MS = 3000;

export async function runResumeRecordsWorker(): Promise<ResumeRecordsWorkerResult> {
  return runTsxJsonWorker<ResumeRecordsWorkerResult>({
    workerScriptRelative: 'scripts/resume-records-worker.ts',
    label: 'resume records',
    timeoutMs: RESUME_RECORDS_WORKER_TIMEOUT_MS,
  });
}
