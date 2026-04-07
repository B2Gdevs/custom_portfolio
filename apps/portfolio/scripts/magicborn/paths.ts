/**
 * Repo paths for Magicborn CLI (runs from `apps/portfolio` cwd).
 * @see scripts/magicborn/run.ts — entry invoked via `pnpm magicborn` → @magicborn/cli.
 */
import path from 'node:path';

import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';

/** Monorepo root (two levels above the portfolio app). */
export function resolveMagicbornRepoRoot(): string {
  return path.resolve(resolvePortfolioAppRoot(), '..', '..');
}
