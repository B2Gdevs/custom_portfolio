import path from 'node:path';
import type { Payload } from 'payload';
import { sanitizeFilename } from 'payload/shared';
import type { PublishedBookArtifactKind } from '@/lib/book-artifacts';
import { resolvePortfolioAppPath } from '@/lib/payload/app-root';
import { PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG } from '@/lib/payload/collections/publishedBookArtifacts';

const ARTIFACT_FILENAME_RE = /^(.+?)--(epub|planning-pack)--(.+)\.(epub|zip)$/i;

/**
 * Some uploads (Payload `sanitizeFilename` / older publishes) stored objects as
 * `slug--epub-cp-...` instead of `slug--epub--cp-...`. URLs and manifest still use the
 * canonical double-hyphen form, so S3 HeadObject must try both shapes.
 */
export function legacyHyphenSanitizedFilename(filename: string): string | null {
  const m = filename
    .trim()
    .match(/^(.+?)--(epub|planning-pack)--(cp-.+)\.(epub|zip)$/i);
  if (!m) {
    return null;
  }
  return `${m[1]}--${m[2]}-${m[3]}.${m[4]}`;
}

/** Inverse of {@link legacyHyphenSanitizedFilename} for DB rows keyed by legacy names. */
export function canonicalFromLegacyHyphenFilename(filename: string): string | null {
  const m = filename
    .trim()
    .match(/^(.+?)--(epub|planning-pack)-(cp-.+)\.(epub|zip)$/i);
  if (!m) {
    return null;
  }
  return `${m[1]}--${m[2]}--${m[3]}.${m[4]}`;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function sanitizeArtifactPrefix(prefix: string) {
  return prefix
    .replace(/\\/g, '/')
    .split('/')
    .filter((segment) => segment !== '..' && segment !== '.')
    .join('/')
    .replace(/^\/+/, '')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '');
}

/**
 * Parses filenames produced by `buildPublishedBookArtifactFilename` in `lib/book-artifacts.ts`.
 */
export function parsePublishedArtifactFilename(filename: string): {
  bookSlug: string;
  artifactKind: PublishedBookArtifactKind;
  versionTag: string;
  extension: string;
} | null {
  const m = filename.trim().match(ARTIFACT_FILENAME_RE);
  if (!m) {
    return null;
  }

  const [, bookSlug, kind, versionTag, ext] = m;
  if (kind !== 'epub' && kind !== 'planning-pack') {
    return null;
  }

  return {
    bookSlug,
    artifactKind: kind,
    versionTag,
    extension: ext.toLowerCase(),
  };
}

/**
 * Resolves a published artifact row when the exact `filename` in the URL is missing (e.g. manifest
 * points at an old version tag after a republish). Order: exact filename → same book/kind/version →
 * current artifact for that book/kind.
 */
export async function findPublishedBookArtifactForFile(
  payload: Payload,
  requestedFilename: string,
): Promise<Record<string, unknown> | null> {
  const exact = await payload.find({
    collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    where: {
      filename: {
        equals: requestedFilename,
      },
    },
  });

  const first = exact.docs[0];
  if (first && typeof first === 'object') {
    return first as Record<string, unknown>;
  }

  const legacyName = legacyHyphenSanitizedFilename(requestedFilename);
  if (legacyName && legacyName !== requestedFilename) {
    const legacyExact = await payload.find({
      collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: {
        filename: {
          equals: legacyName,
        },
      },
    });
    const legacyDoc = legacyExact.docs[0];
    if (legacyDoc && typeof legacyDoc === 'object') {
      return legacyDoc as Record<string, unknown>;
    }
  }

  const canonicalFromLegacy = canonicalFromLegacyHyphenFilename(requestedFilename);
  if (canonicalFromLegacy && canonicalFromLegacy !== requestedFilename) {
    const canonExact = await payload.find({
      collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: {
        filename: {
          equals: canonicalFromLegacy,
        },
      },
    });
    const canonDoc = canonExact.docs[0];
    if (canonDoc && typeof canonDoc === 'object') {
      return canonDoc as Record<string, unknown>;
    }
  }

  let parsed = parsePublishedArtifactFilename(requestedFilename);
  if (!parsed && legacyName) {
    parsed = parsePublishedArtifactFilename(legacyName);
  }
  if (!parsed && canonicalFromLegacy) {
    parsed = parsePublishedArtifactFilename(canonicalFromLegacy);
  }
  if (!parsed) {
    return null;
  }

  const byVersion = await payload.find({
    collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    where: {
      and: [
        { bookSlug: { equals: parsed.bookSlug } },
        { artifactKind: { equals: parsed.artifactKind } },
        { versionTag: { equals: parsed.versionTag } },
      ],
    },
  });

  const vDoc = byVersion.docs[0];
  if (vDoc && typeof vDoc === 'object') {
    return vDoc as Record<string, unknown>;
  }

  const current = await payload.find({
    collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    sort: '-publishedAt',
    where: {
      and: [
        { bookSlug: { equals: parsed.bookSlug } },
        { artifactKind: { equals: parsed.artifactKind } },
        { isCurrent: { equals: true } },
      ],
    },
  });

  const cDoc = current.docs[0];
  if (cDoc && typeof cDoc === 'object') {
    return cDoc as Record<string, unknown>;
  }

  return null;
}

/**
 * S3 object keys to try for a document. Storage layout can differ (empty prefix vs collection slug folder).
 */
export function buildPublishedArtifactS3KeyCandidates(
  doc: Record<string, unknown>,
  requestedFilename: string,
): string[] {
  const prefix = sanitizeArtifactPrefix(asString(doc.prefix) ?? '');
  const name = asString(doc.filename) ?? requestedFilename;
  const bases = new Set<string>();
  bases.add(sanitizeFilename(name));
  const legacyFromDoc = legacyHyphenSanitizedFilename(name);
  if (legacyFromDoc) {
    bases.add(sanitizeFilename(legacyFromDoc));
  }
  const legacyFromRequest = legacyHyphenSanitizedFilename(requestedFilename);
  if (legacyFromRequest) {
    bases.add(sanitizeFilename(legacyFromRequest));
  }

  const keys: string[] = [];
  for (const base of bases) {
    keys.push(path.posix.join(prefix, base).replace(/\/+/g, '/'));
    if (prefix !== '') {
      keys.push(base);
    }
    keys.push(path.posix.join(PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG, base));
  }

  return [...new Set(keys)];
}

/**
 * Built EPUB output from `pnpm run build:books` (see `scripts/build-books.cjs`).
 * Used when Payload has no row or blob storage misses, so preview/prod can still serve reading.
 */
export function getStaticPublicBuiltEpubPath(bookSlug: string): string {
  return path.join(resolvePortfolioAppPath('public', 'books', bookSlug, 'book.epub'));
}
