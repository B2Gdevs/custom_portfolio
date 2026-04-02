#!/usr/bin/env node
/**
 * Isolated Next output for terminal chat: `apps/portfolio/.next-chat`
 * (matches PORTFOLIO_DIST_DIR in apps/portfolio/next.config.ts).
 *
 * Usage from repo root:
 *   node scripts/portfolio-chat-dist.mjs build
 *   node scripts/portfolio-chat-dist.mjs start [port]
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const keyPart = line.slice(0, eq).trim().replace(/^export\s+/i, '');
    const key = keyPart.split(/\s+/)[0];
    if (!key) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function mergeMonorepoRootEnv() {
  const merged = { ...process.env };
  const fromRoot = {
    ...parseEnvFile(path.join(root, '.env')),
    ...parseEnvFile(path.join(root, '.env.local')),
  };
  for (const [k, v] of Object.entries(fromRoot)) {
    if (merged[k] === undefined || merged[k] === '') {
      merged[k] = v;
    }
  }
  return merged;
}

const envBase = mergeMonorepoRootEnv();
const env = { ...envBase, PORTFOLIO_DIST_DIR: '.next-chat' };
const portfolioAppDir = path.join(root, 'apps', 'portfolio');
const syncChatStandalone = path.join(portfolioAppDir, 'scripts', 'sync-chat-standalone.mjs');

function findStandaloneServerJs(dir, depth = 0) {
  if (depth > 8 || !fs.existsSync(dir)) return null;
  const direct = path.join(dir, 'server.js');
  if (fs.existsSync(direct)) return direct;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const ent of entries) {
    if (!ent.isDirectory() || ent.name === 'node_modules') continue;
    const found = findStandaloneServerJs(path.join(dir, ent.name), depth + 1);
    if (found) return found;
  }
  return null;
}

const cmd = process.argv[2];
if (cmd === 'build') {
  const line =
    process.platform === 'win32'
      ? 'pnpm.cmd --filter @portfolio/app run build'
      : 'pnpm --filter @portfolio/app run build';
  const r = spawnSync(line, { shell: true, cwd: root, env, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
  spawnSync(process.execPath, [syncChatStandalone], {
    cwd: portfolioAppDir,
    env: { ...env },
    stdio: 'inherit',
  });
  process.exit(0);
}
if (cmd === 'start') {
  const port = process.argv[3] || '3010';
  const startEnv = { ...env, NODE_ENV: 'production', PORT: String(port), HOSTNAME: '127.0.0.1' };
  const noStandalone =
    process.env.MAGICBORN_CHAT_NO_STANDALONE === '1' || process.env.MAGICBORN_CHAT_NO_STANDALONE === 'true';
  if (!noStandalone) {
    spawnSync(process.execPath, [syncChatStandalone], {
      cwd: portfolioAppDir,
      env: { ...env },
      stdio: 'inherit',
    });
    const standaloneRoot = path.join(portfolioAppDir, '.next-chat', 'standalone');
    const serverJs = findStandaloneServerJs(standaloneRoot);
    if (serverJs) {
      const r = spawnSync(process.execPath, [serverJs], {
        cwd: path.dirname(serverJs),
        env: startEnv,
        stdio: 'inherit',
      });
      process.exit(r.status ?? 1);
    }
  }
  const line =
    process.platform === 'win32'
      ? `pnpm.cmd --filter @portfolio/app exec next start -p ${port}`
      : `pnpm --filter @portfolio/app exec next start -p ${port}`;
  const r = spawnSync(line, { shell: true, cwd: root, env: { ...startEnv, PORTFOLIO_DIST_DIR: '.next-chat' }, stdio: 'inherit' });
  process.exit(r.status ?? 1);
}

console.error('Usage: node scripts/portfolio-chat-dist.mjs build | start [port]');
process.exit(1);
