import fs from 'node:fs';
import path from 'node:path';

/**
 * Walk up from `start` until `pnpm-workspace.yaml` exists (monorepo root).
 */
export function findRepoRoot(start = process.cwd()): string {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        'Could not find monorepo root (missing pnpm-workspace.yaml). Run magicborn from inside the portfolio-v2 repo.',
      );
    }
    dir = parent;
  }
}
