import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_DEV_PORT = 3010;
const STARTUP_WAIT_MS = 120_000;
const POLL_MS = 500;

function portfolioDir(repoRoot: string): string {
  return path.join(repoRoot, 'apps', 'portfolio');
}

export function resolveChatDevPort(raw?: string): number {
  const n = raw !== undefined && raw !== '' ? Number.parseInt(String(raw), 10) : DEFAULT_DEV_PORT;
  if (!Number.isFinite(n) || n < 1 || n > 65535) {
    return DEFAULT_DEV_PORT;
  }
  return n;
}

async function waitForPortfolioDev(baseUrl: string, maxMs: number): Promise<void> {
  const deadline = Date.now() + maxMs;
  const tryOnce = async (): Promise<boolean> => {
    try {
      const r = await fetch(baseUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(4000),
      });
      return r.status > 0;
    } catch {
      return false;
    }
  };

  while (Date.now() < deadline) {
    if (await tryOnce()) {
      return;
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  throw new Error(
    `Timed out after ${Math.round(maxMs / 1000)}s waiting for Next at ${baseUrl}. Check install and try again.`,
  );
}

/**
 * Spawns `next dev` for @portfolio/app on `port` (default 3010) so it does not compete with :3000.
 * Caller should kill the process when done.
 */
export async function startPortfolioChatDevServer(repoRoot: string, port: number): Promise<ChildProcess> {
  const appDir = portfolioDir(repoRoot);
  const pkg = path.join(appDir, 'package.json');
  if (!fs.existsSync(pkg)) {
    throw new Error(`Missing ${pkg}; --dev only works inside this monorepo.`);
  }

  console.error(`magicborn chat --dev: starting Next on 127.0.0.1:${port} (waiting until it responds)…`);

  const child = spawn(
    'pnpm',
    ['--filter', '@portfolio/app', 'exec', 'next', 'dev', '--webpack', '--', '--port', String(port)],
    {
      cwd: repoRoot,
      shell: true,
      stdio: 'ignore',
      env: { ...process.env },
    },
  );

  child.on('error', (err) => {
    console.error('magicborn chat --dev: failed to start Next:', err instanceof Error ? err.message : err);
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForPortfolioDev(baseUrl, STARTUP_WAIT_MS);
  } catch (e) {
    try {
      child.kill('SIGTERM');
    } catch {
      /* ignore */
    }
    throw e;
  }

  return child;
}

export function killChatDevServer(proc: ChildProcess | undefined): void {
  if (!proc?.pid) return;
  try {
    proc.kill('SIGTERM');
  } catch {
    /* ignore */
  }
}
