import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import JSZip from 'jszip';
import { loadScriptEnv } from './load-script-env';
import type { BookEntry } from '@/lib/books';
import { coerceUnknownToString as asString } from '@/lib/coerce-unknown-to-string';
import { isUnknownRecord as isRecord } from '@/lib/is-unknown-record';
import {
  buildDefaultArtifactVersionTag,
  buildPublishedBookArtifactFilename,
  normalizePlanningSourcePaths,
  shouldReuseCurrentPublishedBookArtifact,
  shouldUpdatePublishedBookArtifact,
  sanitizeArtifactVersionTag,
  type PublishedBookArtifactKind,
  type PublishedBookArtifactComparable,
} from '@/lib/book-artifacts';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';
import { getPayloadClient } from '@/lib/payload';
import {
  getPublishedBookArtifactFileURL,
  PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
} from '@/lib/payload/collections/publishedBookArtifacts';

type BookSourceMeta = {
  title: string;
  planningDirs: string[];
};

type PayloadDoc = Record<string, unknown>;

type PublishSummary = {
  slug: string;
  versionTag: string;
  remoteEpubUrl: string | null;
  planningPackUrl: string | null;
  epubAction: 'created' | 'updated' | 'skipped' | 'none';
  planningPackAction: 'created' | 'updated' | 'skipped' | 'none';
};

const APP_ROOT = resolvePortfolioAppRoot();
const REPO_ROOT = path.resolve(APP_ROOT, '..', '..');
const BOOKS_SOURCE_ROOT = path.join(REPO_ROOT, 'books');
const BOOKS_PUBLIC_ROOT = path.join(APP_ROOT, 'public', 'books');
const MANIFEST_PATH = path.join(BOOKS_PUBLIC_ROOT, 'manifest.json');
const ZIP_MANIFEST_NAME = 'portfolio-book-planning-pack.json';
const ZIP_ENTRY_DATE = new Date('2000-01-01T00:00:00.000Z');
const ALLOWED_PLANNING_EXTENSIONS = new Set([
  '.json',
  '.md',
  '.mdx',
  '.toml',
  '.txt',
  '.xml',
  '.yaml',
  '.yml',
]);
const IGNORED_DIRECTORIES = new Set(['.git', '.next', 'dist', 'node_modules']);

function getGitShortCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'local';
  }
}

function resolveVersionTag() {
  const explicit = process.env.BOOK_ARTIFACT_VERSION?.trim();
  if (explicit) {
    const sanitized = sanitizeArtifactVersionTag(explicit);
    if (!sanitized) {
      throw new Error('BOOK_ARTIFACT_VERSION only produced invalid characters after sanitization.');
    }

    return sanitized;
  }

  return buildDefaultArtifactVersionTag({ shortCommit: getGitShortCommit() });
}

function readManifest(): BookEntry[] {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`book manifest missing: ${MANIFEST_PATH}. Run pnpm run build:books first.`);
  }

  const parsed = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(parsed)) {
    throw new Error(`book manifest is not an array: ${MANIFEST_PATH}`);
  }

  return parsed as BookEntry[];
}

function writeManifest(entries: BookEntry[]) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(entries, null, 2)}\n`);
}

function loadBookSourceMeta(slug: string): BookSourceMeta {
  const bookDir = path.join(BOOKS_SOURCE_ROOT, slug);
  const bookJsonPath = path.join(bookDir, 'book.json');

  if (!fs.existsSync(bookJsonPath)) {
    return { title: slug, planningDirs: [] };
  }

  const raw = JSON.parse(fs.readFileSync(bookJsonPath, 'utf8')) as Record<string, unknown>;
  const planningDirs = Array.isArray(raw.epubPlanningDirs)
    ? raw.epubPlanningDirs
        .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        .map((entry) => path.resolve(bookDir, entry.trim()))
        .filter((entry) => fs.existsSync(entry))
    : [];

  return {
    title: typeof raw.title === 'string' && raw.title.trim().length > 0 ? raw.title : slug,
    planningDirs,
  };
}

function sha256File(filePath: string) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function sha256StringParts(parts: Array<string | Buffer>) {
  const hash = crypto.createHash('sha256');
  for (const part of parts) {
    hash.update(part);
    hash.update('\n---\n');
  }
  return hash.digest('hex');
}

function sizeOfFile(filePath: string) {
  return fs.statSync(filePath).size;
}

function normalizeUploadedArtifactUrl(doc: PayloadDoc) {
  const filename = asString(doc.filename);
  if (filename) {
    return getPublishedBookArtifactFileURL(filename);
  }

  const directUrl = asString(doc.url);
  return directUrl ?? null;
}

function createTempCopy(sourcePath: string, filename: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-book-artifacts-'));
  const tempPath = path.join(tempDir, filename);
  fs.copyFileSync(sourcePath, tempPath);
  return {
    filePath: tempPath,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }),
  };
}

function addPlanningDirectoryToZip(zip: JSZip, dirPath: string) {
  const zipWriter = zip as unknown as {
    file: (path: string, data: string, options?: { date?: Date }) => void;
  };
  const entries = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      addPlanningDirectoryToZip(zip, fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!ALLOWED_PLANNING_EXTENSIONS.has(ext)) {
      continue;
    }

    const zipPath = path.relative(REPO_ROOT, fullPath).replace(/\\/g, '/');
    zipWriter.file(zipPath, fs.readFileSync(fullPath, 'utf8'), { date: ZIP_ENTRY_DATE });
  }
}

function appendPlanningDirectoryToChecksum(
  parts: Array<string | Buffer>,
  dirPath: string,
) {
  const entries = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      appendPlanningDirectoryToChecksum(parts, fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!ALLOWED_PLANNING_EXTENSIONS.has(ext)) {
      continue;
    }

    parts.push(path.relative(REPO_ROOT, fullPath).replace(/\\/g, '/'));
    parts.push(fs.readFileSync(fullPath));
  }
}

function buildPlanningPackSemanticChecksum(input: {
  slug: string;
  title: string;
  planningDirs: string[];
}) {
  const parts: Array<string | Buffer> = [
    input.slug,
    input.title,
    ...input.planningDirs
      .map((dirPath) => path.relative(REPO_ROOT, dirPath).replace(/\\/g, '/'))
      .sort(),
  ];

  for (const planningDir of input.planningDirs) {
    appendPlanningDirectoryToChecksum(parts, planningDir);
  }

  return sha256StringParts(parts);
}

async function createPlanningPackZip(input: {
  slug: string;
  title: string;
  versionTag: string;
  sourceCommit: string;
  planningDirs: string[];
}) {
  const zip = new JSZip();
  const zipWriter = zip as unknown as {
    file: (path: string, data: string, options?: { date?: Date }) => void;
  };
  for (const planningDir of input.planningDirs) {
    addPlanningDirectoryToZip(zip, planningDir);
  }

  const manifest = {
    bookSlug: input.slug,
    title: input.title,
    sourceCommit: input.sourceCommit,
    planningDirs: input.planningDirs
      .map((dirPath) => path.relative(REPO_ROOT, dirPath).replace(/\\/g, '/'))
      .sort(),
  };

  zipWriter.file(ZIP_MANIFEST_NAME, `${JSON.stringify(manifest, null, 2)}\n`, {
    date: ZIP_ENTRY_DATE,
  });

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-book-planning-pack-'));
  const filePath = path.join(
    tempDir,
    buildPublishedBookArtifactFilename(
      input.slug,
      'planning-pack',
      input.versionTag,
      'zip',
    ),
  );
  fs.writeFileSync(filePath, buffer);

  return {
    filePath,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }),
  };
}

async function markPreviousCurrentArtifacts(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  input: {
    bookSlug: string;
    artifactKind: PublishedBookArtifactKind;
    currentId: string;
  },
) {
  const currentArtifacts = await payload.find({
    collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { bookSlug: { equals: input.bookSlug } },
        { artifactKind: { equals: input.artifactKind } },
        { isCurrent: { equals: true } },
      ],
    },
  });

  for (const doc of currentArtifacts.docs) {
    const id = asString(isRecord(doc) ? doc.id : null);
    if (!id || id === input.currentId) {
      continue;
    }

    await payload.update({
      collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
      id,
      data: {
        isCurrent: false,
      },
      depth: 0,
      overrideAccess: true,
    });
  }
}

async function publishVersionedArtifact(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  input: {
    title: string;
    bookSlug: string;
    artifactKind: PublishedBookArtifactKind;
    versionTag: string;
    artifactPath: string;
    artifactChecksumSha256?: string;
    sourceCommit: string;
    sourcePath: string;
    planningSourcePaths?: string[];
  },
) {
  const checksumSha256 = input.artifactChecksumSha256 ?? sha256File(input.artifactPath);
  const fileSizeBytes = sizeOfFile(input.artifactPath);
  const desiredComparable: PublishedBookArtifactComparable = {
    title: input.title,
    bookSlug: input.bookSlug,
    artifactKind: input.artifactKind,
    versionTag: input.versionTag,
    isCurrent: true,
    checksumSha256,
    fileSizeBytes,
    sourceCommit: input.sourceCommit,
    sourcePath: input.sourcePath,
    planningSourcePaths: normalizePlanningSourcePaths(input.planningSourcePaths),
  };
  const currentArtifacts = await payload.find({
    collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { bookSlug: { equals: input.bookSlug } },
        { artifactKind: { equals: input.artifactKind } },
        { isCurrent: { equals: true } },
      ],
    },
  });
  const currentArtifact = currentArtifacts.docs.find(isRecord);

  if (currentArtifact && shouldReuseCurrentPublishedBookArtifact(currentArtifact, checksumSha256)) {
    const remoteUrl = normalizeUploadedArtifactUrl(currentArtifact);
    if (!remoteUrl) {
      throw new Error('current published artifact is missing a URL');
    }

    return {
      remoteUrl,
      versionTag: asString(currentArtifact.versionTag) ?? input.versionTag,
      action: 'skipped' as const,
    };
  }

  const existing = await payload.find({
    collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
    depth: 0,
    limit: 10,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { bookSlug: { equals: input.bookSlug } },
        { artifactKind: { equals: input.artifactKind } },
        { versionTag: { equals: input.versionTag } },
      ],
    },
  });

  const existingDoc = existing.docs.find(isRecord);
  let resolvedDoc: PayloadDoc;

  if (existingDoc) {
    const existingChecksum = asString(existingDoc.checksumSha256);
    if (existingChecksum && existingChecksum !== checksumSha256) {
      throw new Error(
        `artifact version conflict for ${input.bookSlug}/${input.artifactKind}/${input.versionTag}. ` +
          'That version already exists with different bytes. Publish a new version tag instead.',
      );
    }

    const id = asString(existingDoc.id);
    if (!id) {
      throw new Error('existing published artifact is missing an id');
    }

    if (shouldUpdatePublishedBookArtifact(existingDoc, desiredComparable)) {
      resolvedDoc = (await payload.update({
        collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
        id,
        data: {
          title: input.title,
          isCurrent: true,
          checksumSha256,
          fileSizeBytes,
          sourceCommit: input.sourceCommit,
          sourcePath: input.sourcePath,
          planningSourcePaths: input.planningSourcePaths,
          publishedAt: new Date().toISOString(),
        },
        depth: 0,
        overrideAccess: true,
      })) as PayloadDoc;
    } else {
      resolvedDoc = existingDoc;
    }
  } else {
    resolvedDoc = (await payload.create({
      collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
      data: {
        title: input.title,
        bookSlug: input.bookSlug,
        artifactKind: input.artifactKind,
        versionTag: input.versionTag,
        isCurrent: true,
        checksumSha256,
        fileSizeBytes,
        sourceCommit: input.sourceCommit,
        sourcePath: input.sourcePath,
        planningSourcePaths: input.planningSourcePaths,
        publishedAt: new Date().toISOString(),
      },
      filePath: input.artifactPath,
      depth: 0,
      overrideAccess: true,
    })) as PayloadDoc;
  }

  const currentId = asString(resolvedDoc.id);
  if (!currentId) {
    throw new Error('published artifact is missing an id');
  }

  await markPreviousCurrentArtifacts(payload, {
    bookSlug: input.bookSlug,
    artifactKind: input.artifactKind,
    currentId,
  });

  const action: 'created' | 'updated' | 'skipped' = existingDoc
    ? shouldUpdatePublishedBookArtifact(existingDoc, desiredComparable)
      ? 'updated'
      : 'skipped'
    : 'created';

  return {
    remoteUrl: normalizeUploadedArtifactUrl(resolvedDoc),
    versionTag: asString(resolvedDoc.versionTag) ?? input.versionTag,
    action,
  };
}

async function publishBuiltBook(entry: BookEntry, versionTag: string, sourceCommit: string) {
  const localEpubPath = path.join(BOOKS_PUBLIC_ROOT, entry.slug, 'book.epub');
  if (!entry.hasEpub || !fs.existsSync(localEpubPath)) {
    return {
      slug: entry.slug,
      versionTag,
      remoteEpubUrl: entry.remoteEpubUrl ?? null,
      planningPackUrl: entry.planningPackUrl ?? null,
      epubAction: 'none',
      planningPackAction: 'none',
    } satisfies PublishSummary;
  }

  const payload = await getPayloadClient();
  const sourceMeta = loadBookSourceMeta(entry.slug);
  const epubTemp = createTempCopy(
    localEpubPath,
    buildPublishedBookArtifactFilename(entry.slug, 'epub', versionTag, 'epub'),
  );

  try {
    const epubResult = await publishVersionedArtifact(payload, {
      title: `${sourceMeta.title} EPUB (${versionTag})`,
      bookSlug: entry.slug,
      artifactKind: 'epub',
      versionTag,
      artifactPath: epubTemp.filePath,
      sourceCommit,
      sourcePath: path.relative(REPO_ROOT, localEpubPath).replace(/\\/g, '/'),
    });

    let planningPackUrl: string | null = null;
    let planningPackAction: PublishSummary['planningPackAction'] = 'none';
    let effectiveVersionTag = epubResult.versionTag;
    if (sourceMeta.planningDirs.length > 0) {
      const planningPackChecksum = buildPlanningPackSemanticChecksum({
        slug: entry.slug,
        title: sourceMeta.title,
        planningDirs: sourceMeta.planningDirs,
      });
      const planningPackZip = await createPlanningPackZip({
        slug: entry.slug,
        title: sourceMeta.title,
        versionTag,
        sourceCommit,
        planningDirs: sourceMeta.planningDirs,
      });

      try {
        const planningPackResult = await publishVersionedArtifact(payload, {
          title: `${sourceMeta.title} planning pack (${versionTag})`,
          bookSlug: entry.slug,
          artifactKind: 'planning-pack',
          versionTag,
          artifactPath: planningPackZip.filePath,
          artifactChecksumSha256: planningPackChecksum,
          sourceCommit,
          sourcePath: 'generated:planning-pack',
          planningSourcePaths: sourceMeta.planningDirs.map((dirPath) =>
            path.relative(REPO_ROOT, dirPath).replace(/\\/g, '/'),
          ),
        });
        planningPackUrl = planningPackResult.remoteUrl;
        planningPackAction = planningPackResult.action;
        effectiveVersionTag = planningPackResult.action === 'created' || planningPackResult.action === 'updated'
          ? planningPackResult.versionTag
          : effectiveVersionTag;
      } finally {
        planningPackZip.cleanup();
      }
    }

    return {
      slug: entry.slug,
      versionTag: effectiveVersionTag,
      remoteEpubUrl: epubResult.remoteUrl,
      planningPackUrl,
      epubAction: epubResult.action,
      planningPackAction,
    } satisfies PublishSummary;
  } finally {
    epubTemp.cleanup();
  }
}

async function main() {
  loadScriptEnv();

  const sourceCommit = getGitShortCommit();
  const versionTag = resolveVersionTag();
  const manifest = readManifest();
  const publishResults = new Map<string, PublishSummary>();

  for (const entry of manifest) {
    const result = await publishBuiltBook(entry, versionTag, sourceCommit);
    publishResults.set(entry.slug, result);
  }

  const updatedManifest = manifest.map((entry) => {
    const published = publishResults.get(entry.slug);
    if (!published) {
      return entry;
    }

    return {
      ...entry,
      remoteEpubUrl: published.remoteEpubUrl ?? entry.remoteEpubUrl,
      planningPackUrl: published.planningPackUrl ?? entry.planningPackUrl,
      artifactVersion:
        published.epubAction !== 'none' || published.planningPackAction !== 'none'
          ? published.versionTag
          : entry.artifactVersion ?? null,
    } satisfies BookEntry;
  });

  writeManifest(updatedManifest);

  console.log(`[publish-book-artifacts] published version ${versionTag}`);
  for (const entry of updatedManifest) {
    const published = publishResults.get(entry.slug);
    const epubStatus = published?.epubAction ?? 'none';
    const planningStatus = published?.planningPackAction ?? 'none';
    console.log(
      `[publish-book-artifacts] ${entry.slug}: epub=${epubStatus}, planning-pack=${planningStatus}, version=${entry.artifactVersion ?? '-'}`,
    );
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('[publish-book-artifacts] failed:', error);
    process.exit(1);
  });
