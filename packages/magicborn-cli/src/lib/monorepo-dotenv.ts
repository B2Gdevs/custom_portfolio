import fs from 'node:fs';
import path from 'node:path';

/**
 * Same parsing rules as `apps/portfolio/lib/monorepo-env.ts` so repo-root `.env`
 * matches what `next.config` applies when the portfolio app loads.
 */
export function parseEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(filePath)) {
    return out;
  }
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const keyPart = line.slice(0, eq).trim().replace(/^export\s+/i, '');
    const key = keyPart.split(/\s+/)[0];
    if (!key) {
      continue;
    }
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
 * Merge repo-root `.env` then `.env.local` into `process.env` when missing or empty
 * (same as `applyMonorepoEnvFromRepoRoot` fillUndefinedOrEmpty).
 */
export function applyMonorepoRootEnvToProcess(repoRoot: string): void {
  const repoEnv = {
    ...parseEnvFile(path.join(repoRoot, '.env')),
    ...parseEnvFile(path.join(repoRoot, '.env.local')),
  };
  for (const [key, value] of Object.entries(repoEnv)) {
    const cur = process.env[key];
    if (cur === undefined || cur === '') {
      process.env[key] = value;
    }
  }
}
