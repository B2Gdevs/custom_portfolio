#!/usr/bin/env node
'use strict';

/**
 * Copy repo-root `.env` / `.env.local` into `apps/portfolio/` so Next and `tsx` scripts
 * that only read `apps/portfolio/.env*` see the same keys (optional escape hatch).
 *
 * Root `.env` remains canonical; re-run after editing root env. Files are gitignored.
 *
 * Usage: `pnpm env:sync-portfolio` from monorepo root.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const destDir = path.join(repoRoot, 'apps', 'portfolio');

for (const name of ['.env', '.env.local']) {
  const src = path.join(repoRoot, name);
  const dest = path.join(destDir, name);
  if (!fs.existsSync(src)) {
    // eslint-disable-next-line no-console
    console.log(`[env:sync-portfolio] skip missing ${name}`);
    continue;
  }
  fs.copyFileSync(src, dest);
  // eslint-disable-next-line no-console
  console.log(`[env:sync-portfolio] wrote apps/portfolio/${name}`);
}
