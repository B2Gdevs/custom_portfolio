#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { appendInstallHookLogAtRoot, stderrLine } = require('./install-hook-log.cjs');

const repoRoot = path.resolve(__dirname, '..');

const isCi = process.env.CI === 'true' || process.env.CI === '1';
if (isCi) {
  appendInstallHookLogAtRoot(repoRoot, '[portfolio] postinstall skipped (CI=1, no shell-init)');
  process.exit(0);
}

const shell = (process.env.SHELL || '').toLowerCase();
const isBashLike =
  shell.includes('bash') ||
  process.env.MSYSTEM ||
  process.platform === 'win32';

if (!isBashLike) {
  appendInstallHookLogAtRoot(repoRoot, '[portfolio] postinstall: skip shell-init (non-bash-like)');
  stderrLine(
    '[portfolio] postinstall: skip magicborn shell-init (set SHELL to bash/zsh or use Git Bash on Windows to auto-apply).',
  );
  process.exit(0);
}

const cliJs = path.join(repoRoot, 'packages', 'magicborn-cli', 'dist', 'cli.js');

appendInstallHookLogAtRoot(repoRoot, '[portfolio] postinstall: magicborn shell-init start');
stderrLine('[portfolio] postinstall: magicborn shell-init bash --apply (~/.bashrc block)…');

const result = spawnSync(
  process.execPath,
  [cliJs, 'shell-init', 'bash', '--apply'],
  { stdio: 'inherit', cwd: repoRoot },
);

if (result.error) {
  appendInstallHookLogAtRoot(
    repoRoot,
    `[portfolio] postinstall: shell-init error ${result.error.message}`,
  );
  stderrLine(`[portfolio] postinstall: magicborn shell-init skipped (${result.error.message}).`);
  process.exit(0);
}

if (typeof result.status === 'number' && result.status !== 0) {
  appendInstallHookLogAtRoot(repoRoot, `[portfolio] postinstall: shell-init exit ${result.status}`);
  stderrLine(
    '[portfolio] postinstall: magicborn shell-init exited non-zero (install continues).',
  );
  process.exit(0);
}

appendInstallHookLogAtRoot(repoRoot, '[portfolio] postinstall: magicborn shell-init finished');
stderrLine('[portfolio] postinstall: magicborn shell-init finished.');
process.exit(0);
