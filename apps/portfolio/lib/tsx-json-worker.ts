import path from 'node:path';
import { spawn } from 'node:child_process';

import { unknownErrorMessage } from '@/lib/unknown-error';

export function resolveTsxCliPath(): string {
  return path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
}

function resolveWorkerScriptPath(relativeToCwd: string): string {
  return path.join(process.cwd(), relativeToCwd);
}

/**
 * Run a TS worker script that prints JSON to stdout (no stdin). Kills on timeout.
 * Used for site metadata workers that must not import `server-only` Payload in the Next process.
 */
export async function runTsxJsonWorker<T>(options: {
  /** e.g. `scripts/site-apps-worker.ts` */
  workerScriptRelative: string;
  /** Short label for errors, e.g. `site apps` -> `site apps worker timed out` */
  label: string;
  timeoutMs: number;
  /** Extra argv after the worker script path (e.g. serialized filter JSON). */
  extraArgs?: string[];
  env?: NodeJS.ProcessEnv;
}): Promise<T> {
  const tsx = resolveTsxCliPath();
  const worker = resolveWorkerScriptPath(options.workerScriptRelative);
  const argv = [tsx, worker, ...(options.extraArgs ?? [])];

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, argv, {
      cwd: process.cwd(),
      env: options.env ?? process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutHandle);
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const succeed = (result: T) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const timeoutHandle = setTimeout(() => {
      child.kill();
      fail(new Error(`${options.label} worker timed out after ${options.timeoutMs}ms`));
    }, options.timeoutMs);

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
      if (settled) return;

      if (code !== 0) {
        fail(new Error(stderr || `${options.label} worker exited with code ${code}`));
        return;
      }

      try {
        succeed(JSON.parse(stdout) as T);
      } catch (error) {
        fail(
          new Error(`${options.label} worker returned invalid JSON: ${unknownErrorMessage(error)}`),
        );
      }
    });
  });
}
