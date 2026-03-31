'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const BOOK_BUILD_CACHE_PATH = path.join(ROOT, '.tmp', 'book-build-cache.json');
/** Bump when fingerprint inputs change so stale entries rebuild. */
const BOOK_BUILD_CACHE_VERSION = 1;
const BOOKS_ROOT = path.join(ROOT, 'books');
const OUT_ROOT = path.join(ROOT, 'apps', 'portfolio', 'public', 'books');
const REPUB_CLI = path.join(ROOT, 'vendor', 'repub-builder', 'dist', 'cli.js');
const COVER_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const BUILD_TMP_ROOT = path.join(ROOT, '.tmp', 'book-build');
const AUTO_PUBLISH_FLAG = (process.env.BOOK_ARTIFACTS_AUTO_PUBLISH || '').trim().toLowerCase();

function shouldAutoPublishArtifacts() {
  return ['1', 'true', 'yes', 'on'].includes(AUTO_PUBLISH_FLAG);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
      continue;
    }
    fs.copyFileSync(srcPath, destPath);
  }
}

function removeDirRecursive(targetDir) {
  if (!fs.existsSync(targetDir)) return;
  fs.rmSync(targetDir, { recursive: true, force: true });
}

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
  const rawAnnotationsFile =
    typeof data.epubAnnotationsFile === 'string' ? data.epubAnnotationsFile.trim() : '';
  const rawPartition =
    data && typeof data.epubPartition === 'object' && !Array.isArray(data.epubPartition)
      ? data.epubPartition
      : undefined;
  const epubPlanningDirs = [];
  let epubAnnotationsFile;
  const rawGenres = Array.isArray(data.genres) ? data.genres : [];
  const genres = [];
  for (const g of rawGenres) {
    if (typeof g === 'string' && g.trim()) genres.push(g.trim());
  }
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
  if (rawAnnotationsFile) {
    const abs = path.resolve(bookDir, rawAnnotationsFile);
    if (fs.existsSync(abs)) {
      epubAnnotationsFile = abs;
    } else {
      console.warn(
        `book.json epubAnnotationsFile: path missing for "${slug}", skipping: ${abs}`,
      );
    }
  }
  return {
    title: data.title || slug,
    author: data.author || '',
    description: data.description || '',
    coverImage: typeof data.coverImage === 'string' ? data.coverImage : '',
    genres,
    epubPlanningDirs,
    epubAnnotationsFile,
    epubPartition: rawPartition,
  };
}

function loadExistingManifest() {
  const manifestPath = path.join(OUT_ROOT, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return new Map();
  }

  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const entries = Array.isArray(raw) ? raw : [];
    return new Map(
      entries
        .filter((entry) => entry && typeof entry === 'object' && typeof entry.slug === 'string')
        .map((entry) => [entry.slug, entry]),
    );
  } catch {
    return new Map();
  }
}

function shouldForceBookRebuild() {
  const v = (process.env.BOOKS_FORCE_REBUILD || '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(v);
}

function loadBookBuildCache() {
  try {
    if (!fs.existsSync(BOOK_BUILD_CACHE_PATH)) {
      return { version: BOOK_BUILD_CACHE_VERSION, books: {} };
    }
    const raw = JSON.parse(fs.readFileSync(BOOK_BUILD_CACHE_PATH, 'utf8'));
    if (!raw || typeof raw !== 'object' || raw.version !== BOOK_BUILD_CACHE_VERSION) {
      return { version: BOOK_BUILD_CACHE_VERSION, books: {} };
    }
    const books = raw.books && typeof raw.books === 'object' ? raw.books : {};
    return { version: BOOK_BUILD_CACHE_VERSION, books };
  } catch {
    return { version: BOOK_BUILD_CACHE_VERSION, books: {} };
  }
}

function saveBookBuildCache(cache) {
  const dir = path.dirname(BOOK_BUILD_CACHE_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(BOOK_BUILD_CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
}

/**
 * Stable hash of a directory tree: relative path, size, mtime per file.
 */
function dirFingerprint(absDir) {
  if (!fs.existsSync(absDir)) {
    return 'missing';
  }
  const lines = [];
  function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile()) {
        const rel = path.relative(absDir, full);
        const st = fs.statSync(full);
        lines.push(`${rel}:${st.size}:${st.mtimeMs}`);
      }
    }
  }
  walk(absDir);
  lines.sort();
  return crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
}

function computeBookInputFingerprint(slug, bookDir, meta) {
  const parts = [String(BOOK_BUILD_CACHE_VERSION)];
  try {
    parts.push(String(fs.statSync(REPUB_CLI).mtimeMs));
  } catch {
    parts.push('no-repub-cli');
  }
  parts.push(dirFingerprint(bookDir));
  const partition = meta.epubPartition;
  if (partition && typeof partition.sourceBook === 'string' && partition.sourceBook.trim()) {
    const sourceBookDir = path.join(BOOKS_ROOT, partition.sourceBook.trim());
    parts.push(dirFingerprint(sourceBookDir));
    parts.push(
      crypto
        .createHash('sha256')
        .update(
          JSON.stringify({
            chapterStart: partition.chapterStart,
            chapterEnd: partition.chapterEnd,
            renumberChapters: partition.renumberChapters,
            renumberStart: partition.renumberStart,
          }),
        )
        .digest('hex'),
    );
  }
  for (const planDir of meta.epubPlanningDirs || []) {
    if (typeof planDir === 'string' && planDir.trim() && fs.existsSync(planDir)) {
      parts.push(dirFingerprint(planDir));
    }
  }
  if (meta.epubAnnotationsFile && fs.existsSync(meta.epubAnnotationsFile)) {
    const st = fs.statSync(meta.epubAnnotationsFile);
    parts.push(
      `${path.basename(meta.epubAnnotationsFile)}:${st.size}:${st.mtimeMs}`,
    );
  }
  return crypto.createHash('sha256').update(parts.join(':')).digest('hex');
}

function preserveArtifactManifestFields(nextEntry, previousEntry) {
  if (!previousEntry || typeof previousEntry !== 'object') {
    return nextEntry;
  }

  return {
    ...nextEntry,
    remoteEpubUrl: nextEntry.remoteEpubUrl ?? previousEntry.remoteEpubUrl,
    planningPackUrl: nextEntry.planningPackUrl ?? previousEntry.planningPackUrl,
    artifactVersion: nextEntry.artifactVersion ?? previousEntry.artifactVersion ?? null,
  };
}

function parseChapterNumber(name) {
  const m = name.match(/^(\d+)-/);
  if (!m) return Number.NaN;
  return Number.parseInt(m[1], 10);
}

function chapterDirSort(a, b) {
  const aNum = parseChapterNumber(a);
  const bNum = parseChapterNumber(b);
  if (Number.isNaN(aNum) && Number.isNaN(bNum)) return a.localeCompare(b);
  if (Number.isNaN(aNum)) return 1;
  if (Number.isNaN(bNum)) return -1;
  if (aNum !== bNum) return aNum - bNum;
  return a.localeCompare(b);
}

function buildRenumberedChapterDirName(sourceName, nextNumber) {
  if (nextNumber === 0) return '00-prologue';
  const n = String(nextNumber).padStart(2, '0');
  const m = sourceName.match(/^\d+-chapter-\d+-(.+)$/);
  if (m) return `${n}-chapter-${nextNumber}-${m[1]}`;
  const fallback = sourceName.replace(/^\d+-/, '');
  return `${n}-${fallback}`;
}

function rewriteChapterMetaLabels(chapterMetaPath, nextNumber) {
  if (!fs.existsSync(chapterMetaPath)) return;
  let data;
  try {
    data = JSON.parse(fs.readFileSync(chapterMetaPath, 'utf8'));
  } catch {
    return;
  }
  if (!data || typeof data !== 'object') return;
  if (typeof data.chapterLabel === 'string') {
    data.chapterLabel = data.chapterLabel.replace(/^Chapter\s+\d+/i, `Chapter ${nextNumber}`);
  }
  if (typeof data.tocTitle === 'string') {
    data.tocTitle = data.tocTitle.replace(/^Chapter\s+\d+:/i, `Chapter ${nextNumber}:`);
  }
  fs.writeFileSync(chapterMetaPath, `${JSON.stringify(data, null, 2)}\n`);
}

function materializePartitionSource(slug, meta) {
  const partition = meta.epubPartition;
  if (!partition) return null;
  const sourceBook = typeof partition.sourceBook === 'string' ? partition.sourceBook.trim() : '';
  const chapterStart = Number.isInteger(partition.chapterStart) ? partition.chapterStart : null;
  const chapterEnd = Number.isInteger(partition.chapterEnd) ? partition.chapterEnd : null;
  const renumberChapters = Boolean(partition.renumberChapters);
  const renumberStart = Number.isInteger(partition.renumberStart)
    ? partition.renumberStart
    : 1;

  if (!sourceBook || chapterStart === null || chapterEnd === null) {
    throw new Error(
      `Invalid epubPartition for "${slug}". Required: sourceBook, chapterStart, chapterEnd.`,
    );
  }
  if (chapterEnd < chapterStart) {
    throw new Error(`Invalid epubPartition for "${slug}": chapterEnd must be >= chapterStart.`);
  }

  const sourceBookDir = path.join(BOOKS_ROOT, sourceBook);
  const sourceChaptersDir = path.join(sourceBookDir, 'chapters');
  if (!fs.existsSync(sourceBookDir) || !fs.existsSync(sourceChaptersDir)) {
    throw new Error(
      `epubPartition sourceBook missing for "${slug}": ${sourceBookDir}`,
    );
  }

  const stageDir = path.join(BUILD_TMP_ROOT, slug);
  removeDirRecursive(stageDir);
  fs.mkdirSync(path.join(stageDir, 'chapters'), { recursive: true });

  // Keep source-level shared assets (images, annotations, etc.) available to repub epub.
  copyDirRecursive(path.join(sourceBookDir, 'images'), path.join(stageDir, 'images'));
  const sourceAnnotationsPath = path.join(sourceBookDir, 'repub-author-annotations.json');
  if (fs.existsSync(sourceAnnotationsPath)) {
    fs.copyFileSync(sourceAnnotationsPath, path.join(stageDir, 'repub-author-annotations.json'));
  }

  const chapterDirs = fs.readdirSync(sourceChaptersDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(chapterDirSort);

  let renumbered = 0;
  for (const chapterName of chapterDirs) {
    const sourceNumber = parseChapterNumber(chapterName);
    if (Number.isNaN(sourceNumber)) continue;
    if (sourceNumber < chapterStart || sourceNumber > chapterEnd) continue;

    const targetNumber = renumberChapters ? (renumberStart + renumbered) : sourceNumber;
    const targetDirName = renumberChapters
      ? buildRenumberedChapterDirName(chapterName, targetNumber)
      : chapterName;
    const sourceDir = path.join(sourceChaptersDir, chapterName);
    const targetDir = path.join(stageDir, 'chapters', targetDirName);
    copyDirRecursive(sourceDir, targetDir);
    if (renumberChapters && targetNumber > 0) {
      rewriteChapterMetaLabels(path.join(targetDir, 'chapter.json'), targetNumber);
    }
    renumbered += 1;
  }

  return {
    dir: stageDir,
    cleanup: () => removeDirRecursive(stageDir),
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

function runRepub(sub, bookDir, outputPath, epubPlanningDirs = [], epubAnnotationsFile) {
  const args = [REPUB_CLI, sub, bookDir];
  for (const d of epubPlanningDirs) {
    args.push('--planning', d);
  }
  if (epubAnnotationsFile) {
    args.push('--annotations', epubAnnotationsFile);
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
  const previousManifest = loadExistingManifest();
  const manifest = [];
  const bookCache = loadBookBuildCache();
  const forceRebuild = shouldForceBookRebuild();
  removeDirRecursive(BUILD_TMP_ROOT);
  fs.mkdirSync(BUILD_TMP_ROOT, { recursive: true });
  for (const slug of slugs) {
    console.log('Building book:', slug);
    const bookDir = path.join(BOOKS_ROOT, slug);
    const meta = loadBookMeta(bookDir, slug);
    const outDir = path.join(OUT_ROOT, slug);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    removeStaleRepubArtifacts(outDir);
    const coverImage = resolveCoverAsset(bookDir, outDir, slug, meta);
    const epubPath = path.join(outDir, 'book.epub');
    const inputFingerprint = computeBookInputFingerprint(slug, bookDir, meta);
    const cacheHit =
      !forceRebuild &&
      bookCache.books[slug] === inputFingerprint &&
      fs.existsSync(epubPath);

    let partitionSource = null;
    let hasEpub = false;

    if (cacheHit) {
      console.log(
        `  (cache) skipped EPUB rebuild for ${slug} — inputs unchanged. Set BOOKS_FORCE_REBUILD=1 to rebuild all.`,
      );
      hasEpub = true;
    } else {
      partitionSource = materializePartitionSource(slug, meta);
      const sourceDir = partitionSource ? partitionSource.dir : bookDir;
      const hasSourceFiles = hasBookSourceFiles(sourceDir);
      hasEpub = hasSourceFiles
        ? runRepub('epub', sourceDir, epubPath, meta.epubPlanningDirs, meta.epubAnnotationsFile)
        : false;
      if (!hasSourceFiles) {
        console.log(`Skipping EPUB for ${slug}: no markdown source yet.`);
      } else if (!hasEpub) {
        console.error(`EPUB failed for ${slug}`);
      } else {
        bookCache.books[slug] = inputFingerprint;
      }
      if (partitionSource) partitionSource.cleanup();
    }

    manifest.push(preserveArtifactManifestFields({
      slug,
      title: meta.title,
      author: meta.author || undefined,
      description: meta.description || undefined,
      coverImage,
      genres: meta.genres.length ? meta.genres : undefined,
      status: hasEpub ? 'available' : 'coming-soon',
      hasEpub: !!hasEpub,
    }, previousManifest.get(slug)));
  }
  saveBookBuildCache(bookCache);
  removeDirRecursive(BUILD_TMP_ROOT);
  if (!fs.existsSync(OUT_ROOT)) fs.mkdirSync(OUT_ROOT, { recursive: true });
  const manifestPath = path.join(OUT_ROOT, 'manifest.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    'Wrote (autogenerated; do not edit — homepage reads this)',
    manifestPath,
  );

  if (shouldAutoPublishArtifacts()) {
    const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
    console.log('Auto-publishing built book artifacts to storage...');
    const publishResult = spawnSync(
      pnpmCommand,
      [
        '--filter',
        '@portfolio/app',
        'exec',
        'tsx',
        '--tsconfig',
        'tsconfig.json',
        'scripts/publish-book-artifacts.ts',
      ],
      {
        cwd: path.join(ROOT, 'apps', 'portfolio'),
        stdio: 'inherit',
        shell: false,
      },
    );

    if (publishResult.status !== 0) {
      process.exit(publishResult.status ?? 1);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
