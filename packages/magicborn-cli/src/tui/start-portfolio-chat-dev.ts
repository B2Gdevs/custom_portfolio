import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const DEFAULT_DEV_PORT = 3010;
/** First `next dev` compile can exceed 2m on cold machines. */
const STARTUP_WAIT_MS = 180_000;
const POLL_MS = 500;
const STDERR_CAP = 12_000;

function portfolioDir(repoRoot: string): string {
  return path.join(repoRoot, 'apps', 'portfolio');
}

/** Resolve Next's `dist/bin/next` from @portfolio/app (pnpm-safe). */
function resolveNextCliPath(appDir: string): string {
  const req = createRequire(path.join(appDir, 'package.json'));
  const nextRoot = path.dirname(req.resolve('next/package.json'));
  const bin = path.join(nextRoot, 'dist', 'bin', 'next');
  if (!fs.existsSync(bin)) {
    throw new Error(`Next CLI missing at ${bin}. From repo root run: pnpm install`);
  }
  return bin;
}

export function resolveChatDevPort(raw?: string): number {
  const n = raw !== undefined && raw !== '' ? Number.parseInt(String(raw), 10) : DEFAULT_DEV_PORT;
  if (!Number.isFinite(n) || n < 1 || n > 65535) {
    return DEFAULT_DEV_PORT;
  }
  return n;
}

function trimCap(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : `…${t.slice(-(max - 1))}`;
}

async function waitForPortfolioDev(
  baseUrl: string,
  maxMs: number,
  child: ChildProcess,
  getStderr: () => string,
): Promise<void> {
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
    if (child.exitCode !== null || child.signalCode) {
      throw new Error(
        `Next dev exited before listening (code=${child.exitCode}, signal=${child.signalCode ?? 'none'}). ${trimCap(getStderr(), STDERR_CAP) || '(no stderr)'}`,
      );
    }
    if (await tryOnce()) {
      return;
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  throw new Error(
    `Timed out after ${Math.round(maxMs / 1000)}s waiting for Next at ${baseUrl}. ${trimCap(getStderr(), STDERR_CAP) || 'No stderr captured — check that port is free and run \`pnpm dev:chat-api\` in another terminal to see full logs.'}`,
  );
}

/**
 * Spawns `next dev` for @portfolio/app on `port` (default 3010) so it does not compete with :3000.
 * Uses `node …/next/dist/bin/next` (no pnpm shell) so Git Bash / Windows is reliable.
 * Caller should kill the process when done.
 */
export async function startPortfolioChatDevServer(repoRoot: string, port: number): Promise<ChildProcess> {
  const appDir = portfolioDir(repoRoot);
  const pkg = path.join(appDir, 'package.json');
  if (!fs.existsSync(pkg)) {
    throw new Error(`Missing ${pkg}; --dev only works inside this monorepo.`);
  }

  const nextCli = resolveNextCliPath(appDir);
  console.error(`magicborn chat --dev: starting Next on 127.0.0.1:${port} (waiting until it responds)…`);

  let stderr = '';
  const child = spawn(process.execPath, [nextCli, 'dev', '--webpack', '-p', String(port)], {
    cwd: appDir,
    stdio: ['ignore', 'ignore', 'pipe'],
    env: { ...process.env },
  });

  child.stderr?.setEncoding('utf8');
  child.stderr?.on('data', (chunk: string) => {
    stderr += chunk;
    if (stderr.length > STDERR_CAP * 2) {
      stderr = stderr.slice(-STDERR_CAP * 2);
    }
  });

  child.on('error', (err) => {
    console.error('magicborn chat --dev: failed to start Next:', err instanceof Error ? err.message : err);
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForPortfolioDev(baseUrl, STARTUP_WAIT_MS, child, () => stderr);
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
