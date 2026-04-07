import path from 'node:path';
import { spawn } from 'node:child_process';

import { unknownErrorMessage } from '@/lib/unknown-error';
import { resolveTsxCliPath } from '@/lib/tsx-json-worker';

type ListenCatalogWorkerResult = {
  status: number;
  body: unknown;
  setCookie?: string;
};

function resolveWorkerPath() {
  return path.join(process.cwd(), 'scripts', 'listen-catalog-worker.ts');
}

export async function runListenCatalogWorker(payload: {
  cookieHeader: string;
}): Promise<ListenCatalogWorkerResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [resolveTsxCliPath(), resolveWorkerPath()], {
      cwd: process.cwd(),
      env: process.env,
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
        reject(new Error(stderr || `listen catalog worker exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout) as ListenCatalogWorkerResult);
      } catch (error) {
        reject(
          new Error(`listen catalog worker returned invalid JSON: ${unknownErrorMessage(error)}`),
        );
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}
