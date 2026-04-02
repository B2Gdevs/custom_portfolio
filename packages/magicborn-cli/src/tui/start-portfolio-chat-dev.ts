import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  CHAT_SERVER_STARTUP_WAIT_MS,
  killChatServerProcess,
  portfolioDir,
  resolveNextCliPath,
  resolveChatServePort,
  waitForNextListening,
} from './chat-next-common.js';

/** @deprecated use resolveChatServePort — same default port for dev and serve */
export const resolveChatDevPort = resolveChatServePort;

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

  let stderr = '';
  const child = spawn(process.execPath, [nextCli, 'dev', '--webpack', '-p', String(port)], {
    cwd: appDir,
    stdio: ['ignore', 'ignore', 'pipe'],
    env: { ...process.env },
  });

  child.stderr?.setEncoding('utf8');
  child.stderr?.on('data', (chunk: string) => {
    stderr += chunk;
    if (stderr.length > 24_000) {
      stderr = stderr.slice(-24_000);
    }
  });

  child.on('error', (err) => {
    console.error('magicborn chat --dev: failed to start Next:', err instanceof Error ? err.message : err);
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForNextListening(baseUrl, CHAT_SERVER_STARTUP_WAIT_MS, child, () => stderr, {
      mode: 'dev',
      timeoutHint: 'No stderr captured — check port is free or run `pnpm dev:chat-api` for full logs.',
    });
  } catch (e) {
    killChatServerProcess(child);
    throw e;
  }

  return child;
}

export function killChatDevServer(proc: ChildProcess | undefined): void {
  killChatServerProcess(proc);
}
