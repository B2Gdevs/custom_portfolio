#!/usr/bin/env node
/**
 * Watches repo-root books/ and re-runs scripts/build-books.cjs (debounced).
 * Used by `pnpm dev` in @portfolio/app. Keeps public/books/manifest.json and EPUBs fresh.
 * build-books skips unchanged books via `.tmp/book-build-cache.json`; use BOOKS_FORCE_REBUILD=1 to rebuild all.
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/** Monorepo root (`apps/portfolio/scripts` → repo). */
const REPO_ROOT = path.join(__dirname, '..', '..', '..');
const BOOKS_ROOT = path.join(REPO_ROOT, 'books');
const BUILD_BOOKS = path.join(REPO_ROOT, 'scripts', 'build-books.cjs');

function runBuildBooks() {
  console.log('[watch-books] Running repo scripts/build-books.cjs …');
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
  console.log('[watch-books] No books/ at repo root; watcher idle (Next.js still runs).');
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
      console.log('[watch-books]', event, rel);
      schedule();
    }
  });

  console.log('[watch-books] Watching', BOOKS_ROOT, `(debounce ${DEBOUNCE_MS}ms)`);
}
