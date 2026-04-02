#!/usr/bin/env node
/**
 * After `PORTFOLIO_DIST_DIR=.next-chat` + `output: 'standalone'`, copy build outputs
 * next to the traced `server.js` so `node …/server.js` can serve static assets.
 *
 * Run from `apps/portfolio`: `node scripts/sync-chat-standalone.mjs`
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = process.env.PORTFOLIO_DIST_DIR || '.next-chat';
const standaloneRoot = path.join(appDir, distDir, 'standalone');
const staticSrc = path.join(appDir, distDir, 'static');
const publicSrc = path.join(appDir, 'public');

function findStandaloneServerJs(root, depth = 0) {
  if (depth > 8 || !fs.existsSync(root)) return null;
  const direct = path.join(root, 'server.js');
  if (fs.existsSync(direct)) return direct;
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (ent.name === 'node_modules') continue;
    const found = findStandaloneServerJs(path.join(root, ent.name), depth + 1);
    if (found) return found;
  }
  return null;
}

function cpDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

const serverJs = findStandaloneServerJs(standaloneRoot);
if (!serverJs) {
  console.error(`sync-chat-standalone: no server.js under ${standaloneRoot} (skip)`);
  process.exit(0);
}

const appRoot = path.dirname(serverJs);
const nextDir = path.join(appRoot, '.next');
fs.mkdirSync(nextDir, { recursive: true });
cpDir(staticSrc, path.join(nextDir, 'static'));
cpDir(publicSrc, path.join(appRoot, 'public'));

console.error(`sync-chat-standalone: synced static + public → ${appRoot}`);
