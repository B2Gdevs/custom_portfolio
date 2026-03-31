/** Use `fs` / `path` (not `node:`) for compatibility with Next’s config loader. */
import fs from 'fs';
import path from 'path';

export function parseEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
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
 * Merge repo-root `.env` / `.env.local` into `process.env` so Next.js (and workers) see the same
 * keys as a single `apps/portfolio/.env` would.
 *
 * - `fillUndefined`: only set when the key is missing (app wins).
 * - `fillUndefinedOrEmpty`: also fill when the value is `''` (root overrides empty placeholders).
 */
export function applyMonorepoEnvFromRepoRoot(options: {
  portfolioRoot: string;
  mode?: 'fillUndefined' | 'fillUndefinedOrEmpty';
}): void {
  const { portfolioRoot, mode = 'fillUndefinedOrEmpty' } = options;
  const repoRoot = path.resolve(portfolioRoot, '..', '..');
  const repoEnv = {
    ...parseEnvFile(path.join(repoRoot, '.env')),
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
  };
  for (const [key, value] of Object.entries(repoEnv)) {
    const cur = process.env[key];
    if (mode === 'fillUndefined') {
      if (cur === undefined) process.env[key] = value;
    } else if (cur === undefined || cur === '') {
      process.env[key] = value;
    }
  }
  process.env.__MONOREPO_ROOT_ENV_LOADED = '1';
}
