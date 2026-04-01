/**
 * Load `.env` files without `@next/env` so `tsx scripts/magicborn/run.ts` resolves
 * the same keys as other scripts (same order as `rag-ingest-runner.cjs`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';

let loaded = false;

export function loadMagicbornEnv(): void {
  if (loaded) {
    return;
  }
  const appRoot = resolvePortfolioAppRoot();
  const envFiles = [
    path.join(appRoot, '.env.local'),
    path.join(appRoot, '.env'),
    path.join(appRoot, '..', '..', '.env.local'),
    path.join(appRoot, '..', '..', '.env'),
  ];

  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile)) {
      continue;
    }
    const contents = fs.readFileSync(envFile, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^(?!\s*#)([^=]+)=(.*)$/);
      if (!match) {
        continue;
      }
      const key = match[1].trim();
      if (!key || process.env[key]) {
        continue;
      }
      let value = match[2] ?? '';
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }

  loaded = true;
}
