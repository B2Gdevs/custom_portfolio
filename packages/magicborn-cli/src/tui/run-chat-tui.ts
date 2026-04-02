import type { ChildProcess } from 'node:child_process';
import path from 'node:path';
import {
  clearPortfolioChatDevRuntime,
  renderOperatorChat,
  resolvePortfolioChatApiUrl,
  writePortfolioChatDevRuntime,
} from '@magicborn/mb-cli-framework';
import { applyMonorepoRootEnvToProcess } from '../lib/monorepo-dotenv.js';
import { findRepoRoot } from '../repo-root.js';
import {
  CHAT_PROD_DIST_DIR,
  hasChatProductionBuild,
  killChatServerProcess,
  portfolioDir,
  runPortfolioChatProductionBuild,
} from './chat-next-common.js';
import {
  printChatCliBanner,
  printChatCliConfigInkOnly,
  printChatCliConfigSnapshot,
  printChatCliConfigSnapshotDev,
  printChatCliReady,
  printChatCliStep,
  printChatCliStepDone,
  readChatBuildIdSnippet,
} from './chat-cli-output.js';
import { resolveChatDevPort, startPortfolioChatDevServer } from './start-portfolio-chat-dev.js';
import { startPortfolioChatProductionListenOnly } from './start-portfolio-chat-serve.js';

export type RunChatTuiOptions = {
  /** `next dev` + HMR instead of default production `.next-chat` + `next start`. */
  withDev?: boolean;
  /** Force `chat:build` into `.next-chat` before `next start`. */
  rebuild?: boolean;
  /** @deprecated use `rebuild` */
  serveRebuild?: boolean;
  /** Only open Ink; POST to env/default URL (no local Next). */
  noServer?: boolean;
  /** Listen port for local server (default 3010). */
  devPort?: string;
};

export async function runChatStubTui(opts?: RunChatTuiOptions): Promise<void> {
  let serverProc: ChildProcess | undefined;
  let chatRepoRoot: string | undefined;
  const rebuild = Boolean(opts?.rebuild || opts?.serveRebuild);
  const withDev = Boolean(opts?.withDev);
  const noServer = Boolean(opts?.noServer);

  if (withDev && noServer) {
    throw new Error('Use either --dev or --no-server, not both.');
  }

  const prepStarted = Date.now();

  try {
    const root = findRepoRoot();
    if (!noServer) {
      applyMonorepoRootEnvToProcess(root);
    }
    const appDir = portfolioDir(root);
    const port = resolveChatDevPort(opts?.devPort);
    const targetChatUrl = `http://127.0.0.1:${port}/api/chat`;
    const openaiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());
    const distAbs = path.join(appDir, CHAT_PROD_DIST_DIR);

    if (noServer) {
      printChatCliBanner({ mode: 'ink-only', repoRoot: root, portfolioRoot: appDir });
      const url = resolvePortfolioChatApiUrl();
      printChatCliConfigInkOnly({ chatApiUrl: url });
      printChatCliReady({ chatApiUrl: url, totalPrepMs: Date.now() - prepStarted });
      await renderOperatorChat({ chatApiUrl: url });
      return;
    }

    chatRepoRoot = root;
    delete process.env.MAGICBORN_CHAT_URL;
    process.env.MAGICBORN_CHAT_BASE_URL = `http://127.0.0.1:${port}`;

    if (withDev) {
      printChatCliBanner({ mode: 'dev', repoRoot: root, portfolioRoot: appDir });
      printChatCliConfigSnapshotDev({ port, targetChatUrl });
      printChatCliStep(1, 'next dev', `127.0.0.1:${port} · webpack`);
      const t0 = Date.now();
      serverProc = await startPortfolioChatDevServer(root, port);
      printChatCliStepDone('next dev (listening)', Date.now() - t0);
    } else {
      const hadBuild = hasChatProductionBuild(appDir);
      const needBuild = rebuild || !hadBuild;
      printChatCliBanner({ mode: 'production', repoRoot: root, portfolioRoot: appDir });
      printChatCliConfigSnapshot({
        port,
        targetChatUrl,
        distDir: CHAT_PROD_DIST_DIR,
        distAbs,
        hadBuild,
        willRebuild: rebuild,
        openaiConfigured,
      });

      let step = 1;
      if (needBuild) {
        printChatCliStep(step++, 'chat:build', 'PORTFOLIO_DIST_DIR=.next-chat · full @portfolio/app build');
        const tBuild = Date.now();
        await runPortfolioChatProductionBuild(root);
        printChatCliStepDone('chat:build', Date.now() - tBuild);
      } else {
        const bid = readChatBuildIdSnippet(appDir, CHAT_PROD_DIST_DIR);
        printChatCliStep(step++, 'reuse build', bid ? `BUILD_ID ${bid}` : CHAT_PROD_DIST_DIR);
        printChatCliStepDone('reuse .next-chat');
      }

      printChatCliStep(step, 'next start', `production · 127.0.0.1:${port}`);
      const tStart = Date.now();
      serverProc = await startPortfolioChatProductionListenOnly(root, port);
      printChatCliStepDone('next start (listening)', Date.now() - tStart);
    }

    const baseUrl = `http://127.0.0.1:${port}`;
    writePortfolioChatDevRuntime(root, {
      port,
      baseUrl,
      chatApiUrl: `${baseUrl}/api/chat`,
      pnpmPid: serverProc.pid,
    });

    const chatApiUrl = resolvePortfolioChatApiUrl();
    const buildId =
      !withDev && !noServer ? readChatBuildIdSnippet(appDir, CHAT_PROD_DIST_DIR) : undefined;
    printChatCliReady({
      chatApiUrl,
      buildId,
      totalPrepMs: Date.now() - prepStarted,
    });

    await renderOperatorChat({ chatApiUrl });
  } finally {
    killChatServerProcess(serverProc);
    if (chatRepoRoot) {
      clearPortfolioChatDevRuntime(chatRepoRoot);
    }
  }
}
