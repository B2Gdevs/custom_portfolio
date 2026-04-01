import path from 'node:path';
import { spawn } from 'node:child_process';

type ProjectRecordsWorkerResult = {
  status: number;
  body: unknown;
};

const PROJECT_RECORDS_WORKER_TIMEOUT_MS = 3000;

function resolveTsxCliPath() {
  return path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
}

function resolveWorkerPath() {
  return path.join(process.cwd(), 'scripts', 'project-records-worker.ts');
}

export async function runProjectRecordsWorker(): Promise<ProjectRecordsWorkerResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [resolveTsxCliPath(), resolveWorkerPath()], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutHandle);
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      reject(error);
    };

    const succeed = (result: ProjectRecordsWorkerResult) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(result);
    };

    const timeoutHandle = setTimeout(() => {
      child.kill();
      fail(
        new Error(
          `project records worker timed out after ${PROJECT_RECORDS_WORKER_TIMEOUT_MS}ms`,
        ),
      );
    }, PROJECT_RECORDS_WORKER_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      fail(error);
    });

    child.on('close', (code) => {
      if (settled) {
        return;
      }

      if (code !== 0) {
        fail(new Error(stderr || `project records worker exited with code ${code}`));
        return;
      }

      try {
        succeed(JSON.parse(stdout) as ProjectRecordsWorkerResult);
      } catch (error) {
        fail(
          new Error(
            `project records worker returned invalid JSON: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        );
      }
    });
  });
}
