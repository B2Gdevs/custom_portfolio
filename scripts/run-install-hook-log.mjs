/**
 * Call from workspace prepare scripts: log a line to `.tmp/pnpm-install-hooks.log`.
 * Repo root = parent of `scripts/`. Set INSTALL_HOOK_LOG=0 to disable.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.dirname(scriptsDir);

export function installHookLog(message) {
  if (process.env.INSTALL_HOOK_LOG === '0') {
    return;
  }
  const logScript = path.join(repoRoot, 'scripts', 'install-hook-log.cjs');
  spawnSync(process.execPath, [logScript, message], {
    cwd: repoRoot,
    stdio: 'ignore',
    env: process.env,
  });
}
