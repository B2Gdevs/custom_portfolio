import path from 'node:path';
import { spawn } from 'node:child_process';

type ReaderStateWorkerResult = {
  status: number;
  body: unknown;
  setCookie?: string;
};

function resolveTsxCliPath() {
  return path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
}

function resolveWorkerPath() {
  return path.join(process.cwd(), 'scripts', 'reader-state-worker.ts');
}

export async function runReaderStateWorker(payload: unknown): Promise<ReaderStateWorkerResult> {
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
        reject(new Error(stderr || `reader state worker exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout) as ReaderStateWorkerResult);
      } catch (error) {
        reject(
          new Error(
            `reader state worker returned invalid JSON: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        );
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}
