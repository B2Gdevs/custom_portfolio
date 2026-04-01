#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const isCi = process.env.CI === 'true' || process.env.CI === '1';
if (isCi) {
  process.exit(0);
}

const shell = (process.env.SHELL || '').toLowerCase();
const isBashLike =
  shell.includes('bash') ||
  process.env.MSYSTEM ||
  process.platform === 'win32';

if (!isBashLike) {
  process.exit(0);
}

const result = spawnSync(
  process.execPath,
  ['packages/magicborn-cli/dist/cli.js', 'shell-init', 'bash', '--apply'],
  { stdio: 'inherit' },
);

if (result.error) {
  process.exit(0);
}

if (typeof result.status === 'number' && result.status !== 0) {
  process.exit(0);
}

process.exit(0);
