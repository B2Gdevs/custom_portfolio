'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const BOOKS_ROOT = path.join(ROOT, 'books');
const OUT_ROOT = path.join(ROOT, 'apps', 'portfolio', 'public', 'books');
const REPUB_CLI = path.join(ROOT, 'packages', 'repub-builder', 'dist', 'cli.js');

function removeStaleRepubArtifacts(targetDir) {
  if (!fs.existsSync(targetDir)) return;

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      removeStaleRepubArtifacts(fullPath);
      continue;
    }

    if (entry.isFile() && /\.repub$/i.test(entry.name)) {
      fs.unlinkSync(fullPath);
    }
  }
}

function loadBookMeta(bookDir, slug) {
  const p = path.join(bookDir, 'book.json');
  if (!fs.existsSync(p)) {
    const title = slug
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    return { title, author: '', description: '' };
  }
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return {
    title: data.title || slug,
    author: data.author || '',
    description: data.description || '',
  };
}

function runRepub(sub, bookDir, outputPath) {
  const result = spawnSync(
    process.execPath,
    [REPUB_CLI, sub, bookDir, '--output', outputPath],
    { cwd: ROOT, stdio: 'inherit', shell: false }
  );
  return result.status === 0;
}

function hasBookSourceFiles(bookDir) {
  const chaptersDir = path.join(bookDir, 'chapters');
  if (fs.existsSync(chaptersDir)) {
    const chapterDirs = fs.readdirSync(chaptersDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(chaptersDir, entry.name));

    for (const chapterDir of chapterDirs) {
      const files = fs.readdirSync(chapterDir, { withFileTypes: true });
      if (files.some((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name))) {
        return true;
      }
    }
    return false;
  }

  const rootFiles = fs.readdirSync(bookDir, { withFileTypes: true });
  return rootFiles.some((entry) => entry.isFile() && /\.(md|mdx)$/i.test(entry.name));
}

async function main() {
  if (!fs.existsSync(BOOKS_ROOT)) {
    console.log('No books/ directory at repo root. Skipping.');
    process.exit(0);
  }
  if (!fs.existsSync(REPUB_CLI)) {
    console.error('repub-builder not built. Run: pnpm run build --workspace=@portfolio/repub-builder');
    process.exit(1);
  }
  const slugs = fs
    .readdirSync(BOOKS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  if (slugs.length === 0) {
    console.log('No book directories in books/. Skipping.');
    process.exit(0);
  }
  const manifest = [];
  for (const slug of slugs) {
    console.log('Building book:', slug);
    const bookDir = path.join(BOOKS_ROOT, slug);
    const meta = loadBookMeta(bookDir, slug);
    const outDir = path.join(OUT_ROOT, slug);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    removeStaleRepubArtifacts(outDir);
    const epubPath = path.join(outDir, 'book.epub');
    const hasSourceFiles = hasBookSourceFiles(bookDir);
    const hasEpub = hasSourceFiles ? runRepub('epub', bookDir, epubPath) : false;
    if (!hasSourceFiles) {
      console.log(`Skipping EPUB for ${slug}: no markdown source yet.`);
    } else if (!hasEpub) {
      console.error(`EPUB failed for ${slug}`);
    }
    manifest.push({
      slug,
      title: meta.title,
      description: meta.description || undefined,
      hasEpub: !!hasEpub,
    });
  }
  if (!fs.existsSync(OUT_ROOT)) fs.mkdirSync(OUT_ROOT, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_ROOT, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('Wrote', path.join(OUT_ROOT, 'manifest.json'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
