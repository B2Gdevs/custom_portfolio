import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { loadScriptEnv } from './load-script-env';
import { getListenCatalog } from '@/lib/listen-catalog';
import type { PublicMediaManifest } from '@/lib/public-media';
import { isPublicMediaSourcePath } from '@/lib/public-media';
import { getPayloadClient } from '@/lib/payload';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';
import {
  shouldUpdatePublishedListenMedia,
  shouldUpdatePublishedSiteMedia,
  type ListenMediaPublishComparable,
  type SiteMediaPublishComparable,
} from '@/lib/payload/media-publish';
import {
  getListenMediaAssetFileURL,
  LISTEN_MEDIA_ASSET_COLLECTION_SLUG,
} from '@/lib/payload/collections/listenMediaAssets';
import {
  getSiteMediaAssetFileURL,
  SITE_MEDIA_ASSET_COLLECTION_SLUG,
} from '@/lib/payload/collections/siteMediaAssets';

type PayloadDoc = Record<string, unknown>;

type SiteMediaInput = {
  absolutePath: string;
  sourcePath: string;
  title: string;
  contentScope: 'project' | 'blog' | 'og' | 'home' | 'brand' | 'site';
  contentSlug?: string;
  mediaKind: 'image' | 'video' | 'audio' | 'document' | 'other';
};

type ListenMediaInput = {
  absolutePath: string;
  sourcePath: string;
  title: string;
  listenSlug: string;
  mediaRole: 'artwork' | 'gallery-image' | 'downloadable' | 'other';
  mediaKind: 'image' | 'video' | 'audio' | 'document' | 'other';
};

type PublishSummary = {
  created: number;
  updated: number;
  skipped: number;
};

const APP_ROOT = resolvePortfolioAppRoot();
const REPO_ROOT = path.resolve(APP_ROOT, '..', '..');
const PUBLIC_ROOT = path.join(APP_ROOT, 'public');
const MEDIA_MANIFEST_PATH = path.join(PUBLIC_ROOT, 'media', 'manifest.json');

function asString(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function isRecord(value: unknown): value is PayloadDoc {
  return Boolean(value) && typeof value === 'object';
}

function ensureParentDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function sha256File(filePath: string) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function fileSizeBytes(filePath: string) {
  return fs.statSync(filePath).size;
}

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

function sanitizeStem(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function inferMediaKind(
  filePath: string,
): 'image' | 'video' | 'audio' | 'document' | 'other' {
  const ext = path.extname(filePath).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) return 'image';
  if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
  if (['.pdf', '.zip', '.epub'].includes(ext)) return 'document';
  return 'other';
}

function isPublishableMediaFile(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (!ext) {
    return false;
  }

  return inferMediaKind(filePath) !== 'other';
}

function buildStoredFilename(prefix: string, sourcePath: string, checksumSha256: string) {
  const ext = path.extname(sourcePath) || '';
  const stem = sanitizeStem(sourcePath.replace(ext, '').replace(/^\//, '').replace(/\//g, '--'));
  return `${prefix}--${stem}--${checksumSha256.slice(0, 12)}${ext.toLowerCase()}`;
}

function createTempCopy(sourcePath: string, filename: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-public-media-'));
  const tempPath = path.join(tempDir, filename);
  fs.copyFileSync(sourcePath, tempPath);
  return {
    filePath: tempPath,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }),
  };
}

function normalizeUploadUrl(doc: PayloadDoc, collection: 'site' | 'listen') {
  const filename = asString(doc.filename);
  if (filename) {
    return collection === 'site'
      ? getSiteMediaAssetFileURL(filename)
      : getListenMediaAssetFileURL(filename);
  }

  return asString(doc.url);
}

function collectFiles(rootPath: string): string[] {
  if (!fs.existsSync(rootPath)) {
    return [];
  }

  return fs.readdirSync(rootPath, { withFileTypes: true }).flatMap((entry): string[] => {
    const fullPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(fullPath);
    }

    return [fullPath];
  });
}

function collectSiteMediaInputs(): SiteMediaInput[] {
  const projectFiles = collectFiles(path.join(PUBLIC_ROOT, 'images', 'projects'))
    .filter(isPublishableMediaFile)
    .map((absolutePath: string) => {
    const relative = path.relative(path.join(PUBLIC_ROOT, 'images', 'projects'), absolutePath).replace(/\\/g, '/');
    const sourcePath = `/images/projects/${relative}`;
    const segments = relative.split('/');
    const contentSlug = segments.length > 1 ? segments[0] : undefined;
    const titleStem = path.basename(relative, path.extname(relative)).replace(/[-_]+/g, ' ').trim();

    return {
      absolutePath,
      sourcePath,
      title: titleStem || sourcePath,
      contentScope: 'project' as const,
      contentSlug,
      mediaKind: inferMediaKind(absolutePath),
    };
    });

  const blogFiles = collectFiles(path.join(PUBLIC_ROOT, 'images', 'blog'))
    .filter(isPublishableMediaFile)
    .map((absolutePath: string) => {
    const relative = path.relative(path.join(PUBLIC_ROOT, 'images', 'blog'), absolutePath).replace(/\\/g, '/');
    return {
      absolutePath,
      sourcePath: `/images/blog/${relative}`,
      title: path.basename(relative, path.extname(relative)).replace(/[-_]+/g, ' ').trim() || relative,
      contentScope: 'blog' as const,
      mediaKind: inferMediaKind(absolutePath),
    };
    });

  const ogFiles = collectFiles(path.join(PUBLIC_ROOT, 'images', 'og'))
    .filter(isPublishableMediaFile)
    .map((absolutePath: string) => {
    const relative = path.relative(path.join(PUBLIC_ROOT, 'images', 'og'), absolutePath).replace(/\\/g, '/');
    return {
      absolutePath,
      sourcePath: `/images/og/${relative}`,
      title: path.basename(relative, path.extname(relative)).replace(/[-_]+/g, ' ').trim() || relative,
      contentScope: 'og' as const,
      mediaKind: inferMediaKind(absolutePath),
    };
    });

  const singles: SiteMediaInput[] = [];
  for (const entry of [
    { relativePath: 'images/avatar.jpg', title: 'avatar' },
    { relativePath: 'images/my_avatar.jpeg', title: 'my avatar' },
  ]) {
    const absolutePath = path.join(PUBLIC_ROOT, ...entry.relativePath.split('/'));
    if (!fs.existsSync(absolutePath) || !isPublishableMediaFile(absolutePath)) {
      continue;
    }

    singles.push({
      absolutePath,
      sourcePath: `/${entry.relativePath}`,
      title: entry.title,
      contentScope: 'home',
      mediaKind: inferMediaKind(absolutePath),
    });
  }

  return [...projectFiles, ...blogFiles, ...ogFiles, ...singles].sort((a, b) =>
    a.sourcePath.localeCompare(b.sourcePath),
  );
}

function collectListenMediaInputs(): ListenMediaInput[] {
  return getListenCatalog()
    .flatMap((entry) => {
      const artworkUrl = entry.artworkUrl?.trim();
      if (!artworkUrl || !isPublicMediaSourcePath(artworkUrl)) {
        return [];
      }

      const absolutePath = path.join(PUBLIC_ROOT, artworkUrl.replace(/^\//, ''));
      if (!fs.existsSync(absolutePath) || !isPublishableMediaFile(absolutePath)) {
        return [];
      }

      return [
        {
          absolutePath,
          sourcePath: artworkUrl,
          title: `${entry.title} artwork`,
          listenSlug: entry.slug,
          mediaRole: 'artwork' as const,
          mediaKind: inferMediaKind(absolutePath),
        },
      ];
    })
    .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
}

async function markPreviousCurrentDocs(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  collection: string,
  existingDocsByKey: Map<string, PayloadDoc[]>,
  currentId: string,
  currentKey: string,
) {
  const existingDocs = existingDocsByKey.get(currentKey) ?? [];

  for (const doc of existingDocs) {
    const id = asString(isRecord(doc) ? doc.id : null);
    if (!id || id === currentId) {
      continue;
    }

    if (!isRecord(doc) || doc.isCurrent !== true) {
      continue;
    }

    await payload.update({
      collection,
      id,
      overrideAccess: true,
      depth: 0,
      data: {
        isCurrent: false,
      },
    });

    doc.isCurrent = false;
  }
}

function siteMediaKey(input: Pick<SiteMediaInput, 'sourcePath'>) {
  return input.sourcePath;
}

function listenMediaKey(input: Pick<ListenMediaInput, 'listenSlug' | 'sourcePath'>) {
  return `${input.listenSlug}::${input.sourcePath}`;
}

function toSiteMediaComparable(input: SiteMediaInput, checksumSha256: string): SiteMediaPublishComparable {
  return {
    title: input.title,
    sourcePath: input.sourcePath,
    contentScope: input.contentScope,
    contentSlug: input.contentSlug ?? null,
    mediaKind: input.mediaKind,
    isCurrent: true,
    checksumSha256,
    fileSizeBytes: fileSizeBytes(input.absolutePath),
  };
}

function toListenMediaComparable(
  input: ListenMediaInput,
  checksumSha256: string,
): ListenMediaPublishComparable {
  return {
    title: input.title,
    listenSlug: input.listenSlug,
    sourcePath: input.sourcePath,
    mediaRole: input.mediaRole,
    mediaKind: input.mediaKind,
    isCurrent: true,
    checksumSha256,
    fileSizeBytes: fileSizeBytes(input.absolutePath),
  };
}

async function loadExistingMediaDocs(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  collection: string,
  getKey: (doc: PayloadDoc) => string | null,
) {
  const existing = await payload.find({
    collection,
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
  });

  const docsByKey = new Map<string, PayloadDoc[]>();

  for (const doc of existing.docs) {
    if (!isRecord(doc)) {
      continue;
    }

    const key = getKey(doc);
    if (!key) {
      continue;
    }

    const docs = docsByKey.get(key) ?? [];
    docs.push(doc);
    docsByKey.set(key, docs);
  }

  return docsByKey;
}

async function publishSiteMediaInput(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  existingDocsByKey: Map<string, PayloadDoc[]>,
  input: SiteMediaInput,
  sourceCommit: string,
) {
  const checksumSha256 = sha256File(input.absolutePath);
  const mediaKey = siteMediaKey(input);
  const existingDocs = existingDocsByKey.get(mediaKey) ?? [];
  const matchingDoc = existingDocs.find(
    (doc) => isRecord(doc) && asString(doc.checksumSha256) === checksumSha256,
  );
  let resolvedDoc: PayloadDoc;
  let action: keyof PublishSummary = 'created';
  const comparable = toSiteMediaComparable(input, checksumSha256);

  if (matchingDoc && isRecord(matchingDoc)) {
    const id = asString(matchingDoc.id);
    if (!id) {
      throw new Error(`site media doc missing id for ${input.sourcePath}`);
    }

    if (shouldUpdatePublishedSiteMedia(matchingDoc, comparable)) {
      resolvedDoc = (await payload.update({
        collection: SITE_MEDIA_ASSET_COLLECTION_SLUG,
        id,
        overrideAccess: true,
        depth: 0,
        data: {
          title: input.title,
          contentScope: input.contentScope,
          contentSlug: input.contentSlug,
          mediaKind: input.mediaKind,
          isCurrent: true,
          fileSizeBytes: comparable.fileSizeBytes,
          sourceCommit,
          publishedAt: new Date().toISOString(),
        },
      })) as PayloadDoc;
      action = 'updated';
    } else {
      resolvedDoc = matchingDoc;
      action = 'skipped';
    }
  } else {
    const tempCopy = createTempCopy(
      input.absolutePath,
      buildStoredFilename('site-media', input.sourcePath, checksumSha256),
    );

    try {
      resolvedDoc = (await payload.create({
        collection: SITE_MEDIA_ASSET_COLLECTION_SLUG,
        overrideAccess: true,
        depth: 0,
        filePath: tempCopy.filePath,
        data: {
          title: input.title,
          sourcePath: input.sourcePath,
          contentScope: input.contentScope,
          contentSlug: input.contentSlug,
          mediaKind: input.mediaKind,
          isCurrent: true,
          checksumSha256,
          fileSizeBytes: comparable.fileSizeBytes,
          sourceCommit,
          publishedAt: new Date().toISOString(),
        },
      })) as PayloadDoc;
    } finally {
      tempCopy.cleanup();
    }
  }

  const currentId = asString(resolvedDoc.id);
  if (!currentId) {
    throw new Error(`site media publish missing id for ${input.sourcePath}`);
  }

  const docs = existingDocsByKey.get(mediaKey) ?? [];
  const existingIndex = docs.findIndex((doc) => asString(doc.id) === currentId);
  if (existingIndex >= 0) {
    docs[existingIndex] = resolvedDoc;
  } else {
    docs.push(resolvedDoc);
  }
  existingDocsByKey.set(mediaKey, docs);

  await markPreviousCurrentDocs(
    payload,
    SITE_MEDIA_ASSET_COLLECTION_SLUG,
    existingDocsByKey,
    currentId,
    mediaKey,
  );

  const remoteUrl = normalizeUploadUrl(resolvedDoc, 'site');
  if (!remoteUrl) {
    throw new Error(`site media publish missing url for ${input.sourcePath}`);
  }

  return {
    action,
    scope: 'site' as const,
    sourcePath: input.sourcePath,
    remoteUrl,
    collectionSlug: SITE_MEDIA_ASSET_COLLECTION_SLUG,
    title: input.title,
    mediaKind: input.mediaKind,
  };
}

async function publishListenMediaInput(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  existingDocsByKey: Map<string, PayloadDoc[]>,
  listenCatalogRowsBySlug: Map<string, PayloadDoc>,
  input: ListenMediaInput,
  sourceCommit: string,
) {
  const checksumSha256 = sha256File(input.absolutePath);
  const mediaKey = listenMediaKey(input);
  const existingDocs = existingDocsByKey.get(mediaKey) ?? [];
  const matchingDoc = existingDocs.find(
    (doc) => isRecord(doc) && asString(doc.checksumSha256) === checksumSha256,
  );
  let resolvedDoc: PayloadDoc;
  let action: keyof PublishSummary = 'created';
  const comparable = toListenMediaComparable(input, checksumSha256);

  if (matchingDoc && isRecord(matchingDoc)) {
    const id = asString(matchingDoc.id);
    if (!id) {
      throw new Error(`listen media doc missing id for ${input.listenSlug}`);
    }

    if (shouldUpdatePublishedListenMedia(matchingDoc, comparable)) {
      resolvedDoc = (await payload.update({
        collection: LISTEN_MEDIA_ASSET_COLLECTION_SLUG,
        id,
        overrideAccess: true,
        depth: 0,
        data: {
          title: input.title,
          listenSlug: input.listenSlug,
          mediaRole: input.mediaRole,
          mediaKind: input.mediaKind,
          isCurrent: true,
          fileSizeBytes: comparable.fileSizeBytes,
          sourceCommit,
          publishedAt: new Date().toISOString(),
        },
      })) as PayloadDoc;
      action = 'updated';
    } else {
      resolvedDoc = matchingDoc;
      action = 'skipped';
    }
  } else {
    const tempCopy = createTempCopy(
      input.absolutePath,
      buildStoredFilename('listen-media', input.sourcePath, checksumSha256),
    );

    try {
      resolvedDoc = (await payload.create({
        collection: LISTEN_MEDIA_ASSET_COLLECTION_SLUG,
        overrideAccess: true,
        depth: 0,
        filePath: tempCopy.filePath,
        data: {
          title: input.title,
          listenSlug: input.listenSlug,
          sourcePath: input.sourcePath,
          mediaRole: input.mediaRole,
          mediaKind: input.mediaKind,
          isCurrent: true,
          checksumSha256,
          fileSizeBytes: comparable.fileSizeBytes,
          sourceCommit,
          publishedAt: new Date().toISOString(),
        },
      })) as PayloadDoc;
    } finally {
      tempCopy.cleanup();
    }
  }

  const currentId = asString(resolvedDoc.id);
  if (!currentId) {
    throw new Error(`listen media publish missing id for ${input.listenSlug}`);
  }

  const docs = existingDocsByKey.get(mediaKey) ?? [];
  const existingIndex = docs.findIndex((doc) => asString(doc.id) === currentId);
  if (existingIndex >= 0) {
    docs[existingIndex] = resolvedDoc;
  } else {
    docs.push(resolvedDoc);
  }
  existingDocsByKey.set(mediaKey, docs);

  await markPreviousCurrentDocs(
    payload,
    LISTEN_MEDIA_ASSET_COLLECTION_SLUG,
    existingDocsByKey,
    currentId,
    mediaKey,
  );

  const remoteUrl = normalizeUploadUrl(resolvedDoc, 'listen');
  if (!remoteUrl) {
    throw new Error(`listen media publish missing url for ${input.listenSlug}`);
  }

  const listenRow = listenCatalogRowsBySlug.get(input.listenSlug);
  const listenRowId = asString(listenRow?.id);
  if (listenRowId && asString(listenRow?.artworkUrl) !== remoteUrl) {
    await payload.update({
      collection: 'listen-catalog-records',
      id: listenRowId,
      overrideAccess: true,
      depth: 0,
      data: {
        artworkUrl: remoteUrl,
      },
    });
    if (listenRow) {
      listenRow.artworkUrl = remoteUrl;
    }
  }

  return {
    action,
    scope: 'listen' as const,
    sourcePath: input.sourcePath,
    remoteUrl,
    collectionSlug: LISTEN_MEDIA_ASSET_COLLECTION_SLUG,
    title: input.title,
    mediaKind: input.mediaKind,
    listenSlug: input.listenSlug,
    mediaRole: input.mediaRole,
  };
}

function writeManifest(manifest: PublicMediaManifest) {
  ensureParentDir(MEDIA_MANIFEST_PATH);
  fs.writeFileSync(MEDIA_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  loadScriptEnv();

  const payload = await getPayloadClient();
  const sourceCommit = getGitShortCommit();
  const siteInputs = collectSiteMediaInputs();
  const listenInputs = collectListenMediaInputs();
  const [existingSiteMediaDocs, existingListenMediaDocs, listenCatalogRows] = await Promise.all([
    loadExistingMediaDocs(payload, SITE_MEDIA_ASSET_COLLECTION_SLUG, (doc) =>
      asString(doc.sourcePath),
    ),
    loadExistingMediaDocs(payload, LISTEN_MEDIA_ASSET_COLLECTION_SLUG, (doc) => {
      const listenSlug = asString(doc.listenSlug);
      const sourcePath = asString(doc.sourcePath);
      return listenSlug && sourcePath ? `${listenSlug}::${sourcePath}` : null;
    }),
    payload.find({
      collection: 'listen-catalog-records',
      depth: 0,
      limit: 200,
      overrideAccess: true,
      pagination: false,
    }),
  ]);
  const listenCatalogEntries: [string, PayloadDoc][] = [];
  for (const doc of listenCatalogRows.docs.filter(isRecord)) {
    const slug = asString(doc.slug);
    if (slug) {
      listenCatalogEntries.push([slug, doc]);
    }
  }
  const listenCatalogRowsBySlug = new Map(listenCatalogEntries);

  const manifest: PublicMediaManifest = {
    site: [],
    listen: [],
  };
  const siteSummary: PublishSummary = { created: 0, updated: 0, skipped: 0 };
  const listenSummary: PublishSummary = { created: 0, updated: 0, skipped: 0 };

  for (const input of siteInputs) {
    const result = await publishSiteMediaInput(payload, existingSiteMediaDocs, input, sourceCommit);
    siteSummary[result.action] += 1;
    manifest.site.push(result);
  }

  for (const input of listenInputs) {
    const result = await publishListenMediaInput(
      payload,
      existingListenMediaDocs,
      listenCatalogRowsBySlug,
      input,
      sourceCommit,
    );
    listenSummary[result.action] += 1;
    manifest.listen.push(result);
  }

  manifest.site.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
  manifest.listen.sort((a, b) =>
    `${a.listenSlug ?? ''}:${a.sourcePath}`.localeCompare(`${b.listenSlug ?? ''}:${b.sourcePath}`),
  );

  writeManifest(manifest);

  console.log(
    `[publish-public-media] site ${siteSummary.created} created, ${siteSummary.updated} updated, ${siteSummary.skipped} skipped; listen ${listenSummary.created} created, ${listenSummary.updated} updated, ${listenSummary.skipped} skipped`,
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('[publish-public-media] failed:', error);
    process.exit(1);
  });
