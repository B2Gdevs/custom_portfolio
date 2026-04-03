#!/usr/bin/env node
/**
 * Append one timestamped line to `.tmp/pnpm-install-hooks.log` (gitignored).
 * Set INSTALL_HOOK_LOG=0 to disable. Used to debug pnpm lifecycle ordering / hangs.
 *
 * CLI: node scripts/install-hook-log.cjs "your message"
 * API: require('./install-hook-log.cjs').appendInstallHookLog('msg')
 */
'use strict';
const fs = require('fs');
const path = require('path');

function findRepoRoot(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return null;
}

function appendInstallHookLogAtRoot(repoRoot, message) {
  if (process.env.INSTALL_HOOK_LOG === '0' || !repoRoot) {
    return;
  }
  const logDir = path.join(repoRoot, '.tmp');
  try {
    fs.mkdirSync(logDir, { recursive: true });
    const line = `${new Date().toISOString()} ${message}\n`;
    fs.appendFileSync(path.join(logDir, 'pnpm-install-hooks.log'), line, 'utf8');
  } catch (err) {
    try {
      fs.writeSync(2, `[install-hook-log] ${err.message}\n`);
    } catch (_) {
      /* ignore */
    }
  }
}

function appendInstallHookLog(message) {
  if (process.env.INSTALL_HOOK_LOG === '0') {
    return;
  }
  const root = findRepoRoot(process.cwd());
  appendInstallHookLogAtRoot(root, message);
}

function stderrLine(msg) {
  try {
    fs.writeSync(2, `${msg}\n`);
  } catch (_) {
    process.stderr.write(`${msg}\n`);
  }
}

module.exports = {
  appendInstallHookLog,
  appendInstallHookLogAtRoot,
  findRepoRoot,
  stderrLine,
};

if (require.main === module) {
  appendInstallHookLog(process.argv.slice(2).join(' ') || '(empty message)');
}
