import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Run portfolio-side magicborn handler (`scripts/magicborn/run.ts`).
 * `argv` is the full tail after the `magicborn` binary, e.g.
 * `['book', 'generate', '--prompt', '…']` or `['book', 'scenes', 'list']`.
 */
export function forwardMagicborn(repoRoot: string, argv: string[]): number {
  const appDir = path.join(repoRoot, 'apps', 'portfolio');
  const tsxCli = path.join(appDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  if (!fs.existsSync(tsxCli)) {
    console.error(
      `Missing tsx at ${tsxCli}. Run pnpm install from the repo root (apps/portfolio must have devDependency tsx).`,
    );
    return 1;
  }
  const result = spawnSync(
    process.execPath,
    [tsxCli, '--tsconfig', 'tsconfig.json', 'scripts/magicborn/run.ts', ...argv],
    {
      cwd: appDir,
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        MAGICBORN_CLI: '1',
      },
    },
  );
  return result.status ?? 1;
}
