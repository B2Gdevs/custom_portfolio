import { readFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { unknownErrorMessage } from '@/lib/unknown-error';
import { resolveTsxCliPath } from '@/lib/tsx-json-worker';

const RESULT_MARKER_PREFIX = 'READER_WORKSPACE_JSON_PATH=';

type ReaderWorkspaceWorkerResult = {
  status: number;
  body: unknown;
  setCookie?: string;
};

function resolveWorkerPath() {
  return path.join(process.cwd(), 'scripts', 'reader-workspace-worker.ts');
}

export async function runReaderWorkspaceWorker(payload: {
  cookieHeader: string;
}): Promise<ReaderWorkspaceWorkerResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [resolveTsxCliPath(), resolveWorkerPath()], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        /** Reduce accidental HF/transformers stdout noise in the worker process. */
        TRANSFORMERS_OFFLINE: process.env.TRANSFORMERS_OFFLINE ?? '1',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `reader workspace worker exited with code ${code}`));
        return;
      }

      try {
        const markerLine = stdout
          .split(/\r?\n/)
          .find((line) => line.startsWith(RESULT_MARKER_PREFIX));
        if (markerLine) {
          const filePath = markerLine.slice(RESULT_MARKER_PREFIX.length).trim();
          const raw = readFileSync(filePath, 'utf8');
          try {
            unlinkSync(filePath);
          } catch {
            // best-effort cleanup
          }
          resolve(JSON.parse(raw) as ReaderWorkspaceWorkerResult);
          return;
        }
        resolve(JSON.parse(stdout.trim()) as ReaderWorkspaceWorkerResult);
      } catch (error) {
        reject(
          new Error(
            `reader workspace worker returned invalid JSON: ${unknownErrorMessage(error)}; stdout (first 800 chars): ${stdout.slice(0, 800)}`,
          ),
        );
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}
