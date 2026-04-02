import type { ChildProcess } from 'node:child_process';
import {
  clearPortfolioChatDevRuntime,
  renderOperatorChat,
  resolvePortfolioChatApiUrl,
  writePortfolioChatDevRuntime,
} from '@magicborn/mb-cli-framework';
import { findRepoRoot } from '../repo-root.js';
import { killChatDevServer, resolveChatDevPort, startPortfolioChatDevServer } from './start-portfolio-chat-dev.js';

export type RunChatTuiOptions = {
  /** Start Next for @portfolio/app on a spare port (default 3010); does not use :3000. */
  withDev?: boolean;
  devPort?: string;
};

export async function runChatStubTui(opts?: RunChatTuiOptions): Promise<void> {
  let devProc: ChildProcess | undefined;
  let devRepoRoot: string | undefined;
  try {
    if (opts?.withDev) {
      const root = findRepoRoot();
      devRepoRoot = root;
      const port = resolveChatDevPort(opts.devPort);
      delete process.env.MAGICBORN_CHAT_URL;
      process.env.MAGICBORN_CHAT_BASE_URL = `http://127.0.0.1:${port}`;
      devProc = await startPortfolioChatDevServer(root, port);
      const baseUrl = `http://127.0.0.1:${port}`;
      writePortfolioChatDevRuntime(root, {
        port,
        baseUrl,
        chatApiUrl: `${baseUrl}/api/chat`,
        pnpmPid: devProc.pid,
      });
    }
    await renderOperatorChat({ chatApiUrl: resolvePortfolioChatApiUrl() });
  } finally {
    killChatDevServer(devProc);
    if (devRepoRoot) {
      clearPortfolioChatDevRuntime(devRepoRoot);
    }
  }
}
