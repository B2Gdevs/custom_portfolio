import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { CHAT_PROD_DIST_DIR } from './chat-next-common.js';

const SKIP_NODE_MODULES = 'node_modules';

function walkStandaloneServerJs(dir: string, depth: number): string | null {
  if (depth > 8 || !fs.existsSync(dir)) return null;
  const direct = path.join(dir, 'server.js');
  if (fs.existsSync(direct)) return direct;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name === SKIP_NODE_MODULES) continue;
    const found = walkStandaloneServerJs(path.join(dir, ent.name), depth + 1);
    if (found) return found;
  }
  return null;
}

/** Resolved `server.js` from `.next-chat/standalone` after `next build` + sync script. */
export function findChatStandaloneServerJs(appDir: string): string | null {
  const root = path.join(appDir, CHAT_PROD_DIST_DIR, 'standalone');
  return walkStandaloneServerJs(root, 0);
}

/** Copy `.next-chat/static` and `public` next to traced `server.js` (idempotent). */
export function syncChatStandaloneAssets(appDir: string): void {
  const script = path.join(appDir, 'scripts', 'sync-chat-standalone.mjs');
  if (!fs.existsSync(script)) return;
  const r = spawnSync(process.execPath, [script], {
    cwd: appDir,
    env: { ...process.env, PORTFOLIO_DIST_DIR: CHAT_PROD_DIST_DIR },
    stdio: 'pipe',
  });
  if (r.status !== 0) {
    const err = (r.stderr?.toString('utf8') || r.stdout?.toString('utf8') || '').trim();
    throw new Error(`sync-chat-standalone failed (exit ${r.status ?? 'unknown'}). ${err || script}`);
  }
}

export function chatStandaloneStartDisabled(): boolean {
  return process.env.MAGICBORN_CHAT_NO_STANDALONE === '1' || process.env.MAGICBORN_CHAT_NO_STANDALONE === 'true';
}
