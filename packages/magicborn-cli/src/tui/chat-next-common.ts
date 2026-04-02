import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { syncChatStandaloneAssets } from './chat-standalone.js';

/** Isolated Next output under apps/portfolio (see apps/portfolio/next.config.ts `PORTFOLIO_DIST_DIR`). */
export const CHAT_PROD_DIST_DIR = '.next-chat';

export const DEFAULT_CHAT_SERVE_PORT = 3010;
export const CHAT_SERVER_STARTUP_WAIT_MS = 180_000;
export const CHAT_SERVER_POLL_MS = 500;
const STDERR_CAP = 12_000;

export function portfolioDir(repoRoot: string): string {
  return path.join(repoRoot, 'apps', 'portfolio');
}

export function chatProductionBuildIdPath(appDir: string): string {
  return path.join(appDir, CHAT_PROD_DIST_DIR, 'BUILD_ID');
}

export function hasChatProductionBuild(appDir: string): boolean {
  return fs.existsSync(chatProductionBuildIdPath(appDir));
}

/** Resolve Next's `dist/bin/next` from @portfolio/app (pnpm-safe). */
export function resolveNextCliPath(appDir: string): string {
  const req = createRequire(path.join(appDir, 'package.json'));
  const nextRoot = path.dirname(req.resolve('next/package.json'));
  const bin = path.join(nextRoot, 'dist', 'bin', 'next');
  if (!fs.existsSync(bin)) {
    throw new Error(`Next CLI missing at ${bin}. From repo root run: pnpm install`);
  }
  return bin;
}

export function resolveChatServePort(raw?: string): number {
  const n = raw !== undefined && raw !== '' ? Number.parseInt(String(raw), 10) : DEFAULT_CHAT_SERVE_PORT;
  if (!Number.isFinite(n) || n < 1 || n > 65535) {
    return DEFAULT_CHAT_SERVE_PORT;
  }
  return n;
}

function trimCap(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : `…${t.slice(-(max - 1))}`;
}

export async function waitForNextListening(
  baseUrl: string,
  maxMs: number,
  child: ChildProcess,
  getStderr: () => string,
  opts: { mode: 'dev' | 'start'; timeoutHint: string },
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

  const modeLabel = opts.mode === 'dev' ? 'Next dev' : 'Next start';

  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode) {
      throw new Error(
        `${modeLabel} exited before listening (code=${child.exitCode}, signal=${child.signalCode ?? 'none'}). ${trimCap(getStderr(), STDERR_CAP) || '(no stderr)'}`,
      );
    }
    if (await tryOnce()) {
      return;
    }
    await new Promise((r) => setTimeout(r, CHAT_SERVER_POLL_MS));
  }

  throw new Error(
    `Timed out after ${Math.round(maxMs / 1000)}s waiting for ${baseUrl}. ${trimCap(getStderr(), STDERR_CAP) || opts.timeoutHint}`,
  );
}

export function killChatServerProcess(proc: ChildProcess | undefined): void {
  if (!proc?.pid) return;
  try {
    proc.kill('SIGTERM');
  } catch {
    /* ignore */
  }
}

/**
 * `pnpm --filter @portfolio/app run build` with `PORTFOLIO_DIST_DIR=.next-chat` (full app build, no HMR).
 * Uses `shell: true` + one command string so Windows (Git Bash / cmd) avoids `spawn EINVAL` with `pnpm.cmd` + `stdio: 'inherit'`.
 */
export async function runPortfolioChatProductionBuild(repoRoot: string): Promise<void> {
  const env = { ...process.env, PORTFOLIO_DIST_DIR: CHAT_PROD_DIST_DIR };
  const command =
    process.platform === 'win32'
      ? 'pnpm.cmd --filter @portfolio/app run build'
      : 'pnpm --filter @portfolio/app run build';

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, {
      cwd: repoRoot,
      env,
      shell: true,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        try {
          syncChatStandaloneAssets(portfolioDir(repoRoot));
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
          return;
        }
        resolve();
        return;
      }
      reject(
        new Error(
          `Production chat build failed (exit ${code}). Fix errors above, or run from repo root: pnpm chat:build`,
        ),
      );
    });
  });
}
