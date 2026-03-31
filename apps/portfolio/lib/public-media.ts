import fs from 'node:fs';
import path from 'node:path';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';

export type PublicMediaManifestScope = 'site' | 'listen';

export type PublicMediaManifestEntry = {
  scope: PublicMediaManifestScope;
  sourcePath: string;
  remoteUrl: string;
  collectionSlug: string;
  title?: string;
  mediaKind?: string;
  listenSlug?: string;
  mediaRole?: string;
};

export type PublicMediaManifest = {
  site: PublicMediaManifestEntry[];
  listen: PublicMediaManifestEntry[];
};

const APP_ROOT = resolvePortfolioAppRoot();
const MEDIA_MANIFEST_PATH = path.join(APP_ROOT, 'public', 'media', 'manifest.json');

let cachedManifest: PublicMediaManifest | null = null;

function emptyManifest(): PublicMediaManifest {
  return {
    site: [],
    listen: [],
  };
}

function isManifestEntry(value: unknown): value is PublicMediaManifestEntry {
  return Boolean(value) && typeof value === 'object';
}

function normalizeEntries(
  entries: unknown,
  scope: PublicMediaManifestScope,
): PublicMediaManifestEntry[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .filter(isManifestEntry)
    .map((entry) => ({
      scope,
      sourcePath:
        typeof entry.sourcePath === 'string' ? entry.sourcePath : '',
      remoteUrl:
        typeof entry.remoteUrl === 'string' ? entry.remoteUrl : '',
      collectionSlug:
        typeof entry.collectionSlug === 'string' ? entry.collectionSlug : '',
      ...(typeof entry.title === 'string' ? { title: entry.title } : {}),
      ...(typeof entry.mediaKind === 'string' ? { mediaKind: entry.mediaKind } : {}),
      ...(typeof entry.listenSlug === 'string' ? { listenSlug: entry.listenSlug } : {}),
      ...(typeof entry.mediaRole === 'string' ? { mediaRole: entry.mediaRole } : {}),
    }))
    .filter((entry) => entry.sourcePath.length > 0 && entry.remoteUrl.length > 0);
}

export function readPublicMediaManifest(): PublicMediaManifest {
  if (process.env.NODE_ENV === 'production' && cachedManifest) {
    return cachedManifest;
  }

  if (!fs.existsSync(MEDIA_MANIFEST_PATH)) {
    return emptyManifest();
  }

  try {
    const raw = JSON.parse(fs.readFileSync(MEDIA_MANIFEST_PATH, 'utf8')) as Record<string, unknown>;
    const manifest: PublicMediaManifest = {
      site: normalizeEntries(raw.site, 'site'),
      listen: normalizeEntries(raw.listen, 'listen'),
    };

    if (process.env.NODE_ENV === 'production') {
      cachedManifest = manifest;
    }

    return manifest;
  } catch {
    return emptyManifest();
  }
}

export function isPublicMediaSourcePath(value: string) {
  return value.startsWith('/images/') || value.startsWith('/trademarks/');
}

function findPublicMediaEntry(
  manifest: PublicMediaManifest,
  sourcePath: string,
) {
  return [...manifest.site, ...manifest.listen].find((entry) => entry.sourcePath === sourcePath);
}

export function resolvePublicMediaUrlFromManifest(
  manifest: PublicMediaManifest,
  value: string,
) {
  if (!isPublicMediaSourcePath(value)) {
    return value;
  }

  return findPublicMediaEntry(manifest, value)?.remoteUrl ?? value;
}

export function resolvePublicMediaUrl(value: string) {
  return resolvePublicMediaUrlFromManifest(readPublicMediaManifest(), value);
}

export function replacePublicMediaReferencesInSourceFromManifest(
  manifest: PublicMediaManifest,
  source: string,
) {
  return source.replace(/\/(?:images|trademarks)\/[^\s)"'}\]>]+/g, (match) =>
    resolvePublicMediaUrlFromManifest(manifest, match),
  );
}

export function replacePublicMediaReferencesInSource(source: string) {
  return replacePublicMediaReferencesInSourceFromManifest(readPublicMediaManifest(), source);
}

export function resolvePublicMediaRecordFromManifest<
  T extends Record<string, unknown>,
>(manifest: PublicMediaManifest, record: T): T {
  const next = { ...record } as Record<string, unknown>;
  const urlFields = ['src', 'thumbnail', 'poster', 'image', 'featuredImage', 'url'];

  for (const field of urlFields) {
    const value = next[field];
    if (typeof value === 'string' && isPublicMediaSourcePath(value)) {
      next[field] = resolvePublicMediaUrlFromManifest(manifest, value);
    }
  }

  return next as T;
}

export function getListenMediaEntries(listenSlug: string) {
  return readPublicMediaManifest().listen.filter((entry) => entry.listenSlug === listenSlug);
}
