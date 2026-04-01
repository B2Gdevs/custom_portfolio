import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import path from 'node:path';

type AuthWorkerCommand = 'login' | 'session';

export type AuthWorkerResult = {
  status: number;
  body: unknown;
  setCookie?: string | null;
};

const DEFAULT_AUTH_WORKER_TIMEOUT_MS = 25_000;

function authWorkerTimeoutMs(): number {
  const raw = process.env.AUTH_WORKER_TIMEOUT_MS?.trim();
  if (!raw) return DEFAULT_AUTH_WORKER_TIMEOUT_MS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 3000 ? Math.floor(n) : DEFAULT_AUTH_WORKER_TIMEOUT_MS;
}

function resolveTsxCli() {
  return path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
}

function resolveWorkerScript() {
  return path.join(process.cwd(), 'scripts', 'auth-worker.ts');
}

function waitForAuthChild(child: ChildProcess, timeoutMs: number): Promise<number> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGTERM');
      setTimeout(() => {
        try {
          child.kill('SIGKILL');
        } catch {
          /* ignore */
        }
      }, 2000).unref();
      reject(new Error(`auth worker timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.once('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });

    child.once('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(code ?? 1);
    });
  });
}

export async function runAuthWorker(
  command: AuthWorkerCommand,
  payload: Record<string, unknown>,
): Promise<AuthWorkerResult> {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const child = spawn(
    process.execPath,
    [resolveTsxCli(), '--tsconfig', 'tsconfig.json', resolveWorkerScript(), command, encoded],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  const timeoutMs = authWorkerTimeoutMs();
  const exitCode = await waitForAuthChild(child, timeoutMs);

  if (exitCode !== 0) {
    throw new Error(stderr.trim() || `auth worker failed with exit code ${exitCode}`);
  }

  return JSON.parse(stdout) as AuthWorkerResult;
}
