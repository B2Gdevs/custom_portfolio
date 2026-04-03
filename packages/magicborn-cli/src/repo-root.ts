import fs from 'node:fs';
import path from 'node:path';

const WORKSPACE_MARKER = 'pnpm-workspace.yaml';

function isMonorepoRoot(dir: string): boolean {
  return fs.existsSync(path.join(dir, WORKSPACE_MARKER));
}

/**
 * When `magicborn shell-init` (or the user) sets `MAGICBORN_REPO` / `MB_CLI_REPO`, use it so the CLI
 * works from any cwd (e.g. Git Bash starting in `~`). Same pattern for other repos using mb-cli-framework.
 */
export function tryResolveRepoRootFromEnv(): string | null {
  const candidates = [process.env.MAGICBORN_REPO?.trim(), process.env.MB_CLI_REPO?.trim()].filter(
    (v): v is string => Boolean(v),
  );
  for (const raw of candidates) {
    const dir = path.resolve(raw);
    if (isMonorepoRoot(dir)) {
      return dir;
    }
  }
  return null;
}

/**
 * Walk up from `start` until `pnpm-workspace.yaml` exists (monorepo root).
 * Prefer {@link tryResolveRepoRootFromEnv} when set (global / any-cwd use).
 */
export function findRepoRoot(start = process.cwd()): string {
  const fromEnv = tryResolveRepoRootFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  let dir = path.resolve(start);
  for (;;) {
    if (isMonorepoRoot(dir)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        `Could not find monorepo root (missing ${WORKSPACE_MARKER}). ` +
          `cd into the repo, or set MAGICBORN_REPO to the repo root (see: magicborn shell-init bash --apply).`,
      );
    }
    dir = parent;
  }
}
