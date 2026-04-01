import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { findRepoRoot } from './repo-root.js';

/**
 * Walk up from `startDir` until a directory containing package.json is found.
 */
export function findNearestPackageJsonRoot(startDir: string): string | null {
  let dir = path.resolve(startDir);
  const { root } = path.parse(dir);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir || dir === root) {
      return null;
    }
    dir = parent;
  }
}

/**
 * Prefer nearest package.json from cwd; fall back to monorepo root (pnpm-workspace.yaml).
 */
export function resolvePnpmCwd(): string {
  const nearest = findNearestPackageJsonRoot(process.cwd());
  if (nearest) {
    return nearest;
  }
  try {
    return findRepoRoot();
  } catch {
    throw new Error(
      'magicborn pnpm: no package.json in the current path and no monorepo root (pnpm-workspace.yaml) found.',
    );
  }
}

/**
 * Run `pnpm` with args; cwd = nearest package.json or monorepo root.
 */
export function runMagicbornPnpm(args: string[]): number {
  const cwd = resolvePnpmCwd();
  if (process.env.MAGICBORN_PNPM_VERBOSE === '1') {
    console.error(`[magicborn pnpm] cwd=${cwd}`);
  }
  const result = spawnSync('pnpm', args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
    // Windows: resolve pnpm.cmd / PATH reliably in some non-interactive environments
    shell: process.platform === 'win32',
  });
  return result.status ?? 1;
}
