#!/usr/bin/env node
/**
 * Watches repo-root books/ and re-runs scripts/build-books.cjs (debounced).
 * Used by `pnpm dev` in @portfolio/app. Keeps public/books/manifest.json and EPUBs fresh.
 * build-books skips unchanged books via `.tmp/book-build-cache.json` (see `scripts/build-books.cjs`,
 * `BOOK_BUILD_CACHE_VERSION`). Images are fingerprinted by size only so repub touches do not force rebuilds.
 * Use BOOKS_FORCE_REBUILD=1 to rebuild all.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const A = { reset: '\x1b[0m', dim: '\x1b[2m', gray: '\x1b[90m', cyan: '\x1b[36m' };
function colorOn() {
  if (process.env.NO_COLOR || process.env.FORCE_COLOR === '0') return false;
  return Boolean(process.stdout && process.stdout.isTTY);
}
function wbLabel() {
  const s = '[watch-books]';
  return colorOn() ? `${A.gray}${s}${A.reset}` : s;
}

/** Monorepo root (`apps/portfolio/scripts` → repo). */
const REPO_ROOT = path.join(__dirname, '..', '..', '..');
const BOOKS_ROOT = path.join(REPO_ROOT, 'books');
const BUILD_BOOKS = path.join(REPO_ROOT, 'scripts', 'build-books.cjs');

function runBuildBooks() {
  console.log(`${wbLabel()} ${colorOn() ? `${A.dim}` : ''}running${colorOn() ? A.reset : ''} scripts/build-books.cjs`);
  const result = spawnSync(process.execPath, [BUILD_BOOKS], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) {
    console.error('[watch-books] build-books exited', result.status);
  }
}

if (!fs.existsSync(BOOKS_ROOT)) {
  console.log(`${wbLabel()} ${colorOn() ? A.dim : ''}no books/ at repo root — idle${colorOn() ? A.reset : ''}`);
  setInterval(() => {}, 60 * 60 * 1000);
} else {

  // Initial build so manifest exists before Next serves the homepage
  runBuildBooks();

  let debounceTimer = null;
  const DEBOUNCE_MS = 600;

  function schedule() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      runBuildBooks();
    }, DEBOUNCE_MS);
  }

  const chokidar = require('chokidar');

  const watcher = chokidar.watch(BOOKS_ROOT, {
    ignoreInitial: true,
    ignored: (p) => path.basename(p).startsWith('.'),
    persistent: true,
  });

  watcher.on('all', (event, filePath) => {
    if (
      event === 'add' ||
      event === 'change' ||
      event === 'unlink' ||
      event === 'addDir' ||
      event === 'unlinkDir'
    ) {
      const rel = path.relative(REPO_ROOT, filePath);
      console.log(`${wbLabel()} ${colorOn() ? A.cyan : ''}${event}${colorOn() ? A.reset : ''} ${rel}`);
      schedule();
    }
  });

  console.log(`${wbLabel()} ${colorOn() ? A.dim : ''}watching${colorOn() ? A.reset : ''}`, BOOKS_ROOT, `(debounce ${DEBOUNCE_MS}ms)`);
}
