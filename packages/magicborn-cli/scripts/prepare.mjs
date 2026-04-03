/**
 * Avoid failing `pnpm install` when:
 * - Vercel (or similar) builds only the Next app — CLI dist is not needed.
 * - `vendor/mb-cli-framework` was not checked out (git submodule not initialized).
 *
 * Local full clone: run `pnpm --filter @magicborn/cli run build` if prepare was skipped.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const monorepoRoot = path.resolve(pkgRoot, '../..');
const fwPkg = path.join(monorepoRoot, 'vendor', 'mb-cli-framework', 'package.json');

if (process.env.SKIP_MAGICBORN_CLI_PREPARE === '1' || process.env.VERCEL === '1') {
  process.stderr.write(
    '[@magicborn/cli] prepare skipped (VERCEL=1 or SKIP_MAGICBORN_CLI_PREPARE=1 — Next deploy does not need the CLI binary).\n',
  );
  process.exit(0);
}

if (!existsSync(fwPkg)) {
  process.stderr.write(
    '[@magicborn/cli] prepare skipped: vendor/mb-cli-framework missing. Run: git submodule update --init --recursive vendor/mb-cli-framework\n' +
      '  Then: pnpm --filter @magicborn/cli run build\n',
  );
  process.exit(0);
}

const steps = ['prepare-notice.mjs', 'run-tsc-with-heartbeat.mjs', 'prepare-done.mjs'];
for (const script of steps) {
  const r = spawnSync(process.execPath, [path.join(__dirname, script)], {
    stdio: 'inherit',
    cwd: pkgRoot,
    env: process.env,
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}
