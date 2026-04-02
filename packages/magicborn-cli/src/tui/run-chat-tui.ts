import type { ChildProcess } from 'node:child_process';
import { renderOperatorChat, resolvePortfolioChatApiUrl } from '@magicborn/mb-cli-framework';
import { findRepoRoot } from '../repo-root.js';
import { killChatDevServer, resolveChatDevPort, startPortfolioChatDevServer } from './start-portfolio-chat-dev.js';

export type RunChatTuiOptions = {
  /** Start Next for @portfolio/app on a spare port (default 3010); does not use :3000. */
  withDev?: boolean;
  devPort?: string;
};

export async function runChatStubTui(opts?: RunChatTuiOptions): Promise<void> {
  let devProc: ChildProcess | undefined;
  try {
    if (opts?.withDev) {
      const root = findRepoRoot();
      const port = resolveChatDevPort(opts.devPort);
      delete process.env.MAGICBORN_CHAT_URL;
      process.env.MAGICBORN_CHAT_BASE_URL = `http://127.0.0.1:${port}`;
      devProc = await startPortfolioChatDevServer(root, port);
    }
    await renderOperatorChat({ chatApiUrl: resolvePortfolioChatApiUrl() });
  } finally {
    killChatDevServer(devProc);
  }
}
