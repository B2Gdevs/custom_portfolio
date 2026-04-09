'use strict';

/**
 * Merge monorepo root `.env` / `.env.local` into `process.env` with the same rules as
 * `apps/portfolio/lib/monorepo-env.ts` (`fillUndefinedOrEmpty`). Keep parsers in sync.
 *
 * Use at the top of **repo-root** Node scripts (e.g. `scripts/build-books.cjs`) and
 * `build-books.cjs`, which do not load `next.config.ts`.
 */

const fs = require('fs');
const path = require('path');

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

/**
 * @param {string} repoRoot Absolute path to monorepo root (directory containing `apps/portfolio`).
 */
function loadRepoRootEnv(repoRoot) {
  const abs = path.resolve(repoRoot);
  const portfolioPkg = path.join(abs, 'apps', 'portfolio', 'package.json');
  if (!fs.existsSync(portfolioPkg)) {
    return;
  }
  const repoEnv = {
    ...parseEnvFile(path.join(abs, '.env')),
    ...parseEnvFile(path.join(abs, '.env.local')),
  };
  for (const [key, value] of Object.entries(repoEnv)) {
    const cur = process.env[key];
    if (cur === undefined || cur === '') {
      process.env[key] = value;
    }
  }
  process.env.__REPO_ROOT_ENV_LOADED = '1';
}

module.exports = { loadRepoRootEnv, parseEnvFile };
