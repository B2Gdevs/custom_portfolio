import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  CHAT_PROD_DIST_DIR,
  CHAT_SERVER_STARTUP_WAIT_MS,
  killChatServerProcess,
  portfolioDir,
  resolveNextCliPath,
  waitForNextListening,
} from './chat-next-common.js';
import {
  chatStandaloneStartDisabled,
  findChatStandaloneServerJs,
  syncChatStandaloneAssets,
} from './chat-standalone.js';

const STDERR_CAP = 24_000;

function startNextStartChild(appDir: string, port: number): ChildProcess {
  const nextCli = resolveNextCliPath(appDir);
  return spawn(process.execPath, [nextCli, 'start', '-p', String(port)], {
    cwd: appDir,
    stdio: ['ignore', 'ignore', 'pipe'],
    env: {
      ...process.env,
      PORTFOLIO_DIST_DIR: CHAT_PROD_DIST_DIR,
      NODE_ENV: 'production',
    },
  });
}

function attachStderrCapture(child: ChildProcess, cap: { value: string }): void {
  child.stderr?.setEncoding('utf8');
  child.stderr?.on('data', (chunk: string) => {
    cap.value += chunk;
    if (cap.value.length > STDERR_CAP) {
      cap.value = cap.value.slice(-STDERR_CAP);
    }
  });
}

/**
 * Production chat server: prefers `node …/standalone/.../server.js` when present (lean Node server),
 * else `next start` on `.next-chat`.
 * Caller is responsible for running `runPortfolioChatProductionBuild` first when needed.
 */
export async function startPortfolioChatProductionListenOnly(repoRoot: string, port: number): Promise<ChildProcess> {
  const appDir = portfolioDir(repoRoot);
  const pkg = path.join(appDir, 'package.json');
  if (!fs.existsSync(pkg)) {
    throw new Error(`Missing ${pkg}; chat server only works inside this monorepo.`);
  }

  const stderrCap = { value: '' };
  let child: ChildProcess;

  if (!chatStandaloneStartDisabled()) {
    try {
      syncChatStandaloneAssets(appDir);
    } catch (e) {
      throw e instanceof Error ? e : new Error(String(e));
    }
    const serverJs = findChatStandaloneServerJs(appDir);
    if (serverJs) {
      const cwd = path.dirname(serverJs);
      child = spawn(process.execPath, [serverJs], {
        cwd,
        stdio: ['ignore', 'ignore', 'pipe'],
        env: {
          ...process.env,
          PORT: String(port),
          HOSTNAME: '127.0.0.1',
          NODE_ENV: 'production',
        },
      });
    } else {
      child = startNextStartChild(appDir, port);
    }
  } else {
    child = startNextStartChild(appDir, port);
  }

  attachStderrCapture(child, stderrCap);

  child.on('error', (err) => {
    console.error('magicborn chat: failed to start Next:', err instanceof Error ? err.message : err);
  });

  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await waitForNextListening(baseUrl, CHAT_SERVER_STARTUP_WAIT_MS, child, () => stderrCap.value, {
      mode: 'start',
      timeoutHint: 'Try `pnpm chat:start` in another terminal for full logs.',
    });
  } catch (e) {
    killChatServerProcess(child);
    throw e;
  }

  return child;
}
