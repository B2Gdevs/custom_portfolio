'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const BOOKS_ROOT = path.join(ROOT, 'books');
const OUT_ROOT = path.join(ROOT, 'apps', 'portfolio', 'public', 'books');
const REPUB_CLI = path.join(ROOT, 'packages', 'repub-builder', 'dist', 'cli.js');
const COVER_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

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
    return { title, author: '', description: '', epubPlanningDirs: [] };
  }
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const rawPlanning = Array.isArray(data.epubPlanningDirs)
    ? data.epubPlanningDirs
    : [];
  const epubPlanningDirs = [];
  for (const rel of rawPlanning) {
    if (typeof rel !== 'string' || !rel.trim()) continue;
    const abs = path.resolve(bookDir, rel.trim());
    if (fs.existsSync(abs)) {
      epubPlanningDirs.push(abs);
    } else {
      console.warn(
        `book.json epubPlanningDirs: path missing for "${slug}", skipping: ${abs}`,
      );
    }
  }
  return {
    title: data.title || slug,
    author: data.author || '',
    description: data.description || '',
    coverImage: typeof data.coverImage === 'string' ? data.coverImage : '',
    epubPlanningDirs,
  };
}

function resolveCoverAsset(bookDir, outDir, slug, meta) {
  const requested = typeof meta.coverImage === 'string' ? meta.coverImage.trim() : '';
  const candidates = [];

  if (requested) {
    candidates.push(path.resolve(bookDir, requested));
  }

  for (const ext of COVER_EXTENSIONS) {
    candidates.push(path.join(bookDir, `cover${ext}`));
  }

  const source = candidates.find((candidate) => fs.existsSync(candidate));
  if (!source) return undefined;

  const ext = path.extname(source).toLowerCase() || '.png';
  const targetName = `cover${ext}`;
  const targetPath = path.join(outDir, targetName);
  fs.copyFileSync(source, targetPath);
  return `/books/${slug}/${targetName}`;
}

function runRepub(sub, bookDir, outputPath, epubPlanningDirs = []) {
  const args = [REPUB_CLI, sub, bookDir];
  for (const d of epubPlanningDirs) {
    args.push('--planning', d);
  }
  args.push('--output', outputPath);
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  });
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
    const coverImage = resolveCoverAsset(bookDir, outDir, slug, meta);
    const epubPath = path.join(outDir, 'book.epub');
    const hasSourceFiles = hasBookSourceFiles(bookDir);
    const hasEpub = hasSourceFiles
      ? runRepub('epub', bookDir, epubPath, meta.epubPlanningDirs)
      : false;
    if (!hasSourceFiles) {
      console.log(`Skipping EPUB for ${slug}: no markdown source yet.`);
    } else if (!hasEpub) {
      console.error(`EPUB failed for ${slug}`);
    }
    manifest.push({
      slug,
      title: meta.title,
      author: meta.author || undefined,
      description: meta.description || undefined,
      coverImage,
      status: hasEpub ? 'available' : 'coming-soon',
      hasEpub: !!hasEpub,
    });
  }
  if (!fs.existsSync(OUT_ROOT)) fs.mkdirSync(OUT_ROOT, { recursive: true });
  const manifestPath = path.join(OUT_ROOT, 'manifest.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    'Wrote (autogenerated; do not edit — homepage reads this)',
    manifestPath,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
