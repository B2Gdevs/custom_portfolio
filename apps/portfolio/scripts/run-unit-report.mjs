#!/usr/bin/env node
/**
 * Runs Vitest with coverage, then always generates the HTML hub (cross-platform).
 * Exit code reflects Vitest so CI still fails on test failures.
 *
 * After the hub is written, opens `test-reports/index.html` in the default browser
 * unless CI is set or OPEN_TEST_REPORT=0.
 */
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');

const vitest = spawnSync('pnpm', ['exec', 'vitest', 'run', '--coverage'], {
  cwd: appRoot,
  stdio: 'inherit',
  shell: true,
});

spawnSync(
  'pnpm',
  ['exec', 'tsx', '--tsconfig', 'tsconfig.json', 'scripts/render-test-report-hub.tsx'],
  {
    cwd: appRoot,
    stdio: 'inherit',
    shell: true,
  },
);

const hubHtml = path.join(appRoot, 'test-reports', 'index.html');
if (!process.env.CI && process.env.OPEN_TEST_REPORT !== '0') {
  const opts = { detached: true, stdio: 'ignore' };
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', hubHtml], opts).unref();
  } else if (process.platform === 'darwin') {
    spawn('open', [hubHtml], opts).unref();
  } else {
    spawn('xdg-open', [hubHtml], opts).unref();
  }
  console.log(`[test-report-hub] opened ${path.relative(appRoot, hubHtml)}`);
}

process.exit(vitest.status ?? 1);
