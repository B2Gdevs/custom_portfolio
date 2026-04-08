import {
  normalizeOptionalTrimmedString,
} from '@/lib/coerce-unknown-to-string';
import {
  parseUnknownFiniteNumber,
  unknownToBoolean,
} from '@/lib/coerce-unknown';

export type PublishedBookArtifactKind = 'epub' | 'planning-pack';

export type PublishedBookManifestFields = {
  remoteEpubUrl?: string;
  planningPackUrl?: string;
  artifactVersion?: string | null;
};

export type PublishedBookArtifactComparable = {
  title: string;
  bookSlug: string;
  artifactKind: PublishedBookArtifactKind;
  versionTag: string;
  isCurrent: boolean;
  checksumSha256: string;
  fileSizeBytes: number;
  sourceCommit: string | null;
  sourcePath: string | null;
  planningSourcePaths: string[];
};

export function sanitizeArtifactVersionTag(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function buildDefaultArtifactVersionTag(input?: {
  now?: Date;
  shortCommit?: string | null;
}) {
  const now = input?.now ?? new Date();
  const shortCommit = sanitizeArtifactVersionTag(input?.shortCommit ?? 'local') || 'local';
  const date = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
  ].join('');
  const time = [
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0'),
  ].join('');

  return `cp-${date}-${time}-${shortCommit}`;
}

export function buildPublishedBookArtifactFilename(
  bookSlug: string,
  artifactKind: PublishedBookArtifactKind,
  versionTag: string,
  extension: string,
) {
  const normalizedVersion = sanitizeArtifactVersionTag(versionTag) || 'current';
  const normalizedExt = extension.replace(/^\./, '').toLowerCase();
  return `${bookSlug}--${artifactKind}--${normalizedVersion}.${normalizedExt}`;
}

export function normalizePlanningSourcePaths(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => normalizeOptionalTrimmedString(entry))
    .filter((entry): entry is string => Boolean(entry))
    .sort((a, b) => a.localeCompare(b));
}

export function normalizePublishedBookArtifactComparable(
  value: unknown,
): PublishedBookArtifactComparable | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = normalizeOptionalTrimmedString(record.title);
  const bookSlug = normalizeOptionalTrimmedString(record.bookSlug);
  const artifactKind = normalizeOptionalTrimmedString(record.artifactKind);
  const versionTag = normalizeOptionalTrimmedString(record.versionTag);
  const checksumSha256 = normalizeOptionalTrimmedString(record.checksumSha256);
  const fileSizeBytes = parseUnknownFiniteNumber(record.fileSizeBytes);

  if (!title || !bookSlug || !artifactKind || !versionTag || !checksumSha256 || fileSizeBytes === null) {
    return null;
  }

  return {
    title,
    bookSlug,
    artifactKind: artifactKind as PublishedBookArtifactKind,
    versionTag,
    isCurrent: unknownToBoolean(record.isCurrent) ?? false,
    checksumSha256,
    fileSizeBytes,
    sourceCommit: normalizeOptionalTrimmedString(record.sourceCommit),
    sourcePath: normalizeOptionalTrimmedString(record.sourcePath),
    planningSourcePaths: normalizePlanningSourcePaths(record.planningSourcePaths),
  };
}

export function shouldUpdatePublishedBookArtifact(
  existing: unknown,
  desired: PublishedBookArtifactComparable,
) {
  const normalizedExisting = normalizePublishedBookArtifactComparable(existing);
  if (!normalizedExisting) {
    return true;
  }

  return JSON.stringify(normalizedExisting) !== JSON.stringify(desired);
}

export function shouldReuseCurrentPublishedBookArtifact(
  currentArtifact: unknown,
  checksumSha256: string,
) {
  const normalizedCurrent = normalizePublishedBookArtifactComparable(currentArtifact);
  if (!normalizedCurrent || !normalizedCurrent.isCurrent) {
    return false;
  }

  return normalizedCurrent.checksumSha256 === checksumSha256;
}

export function preservePublishedBookManifestFields<
  T extends PublishedBookManifestFields,
>(nextEntry: T, previousEntry?: PublishedBookManifestFields | null): T {
  if (!previousEntry) {
    return nextEntry;
  }

  return {
    ...nextEntry,
    remoteEpubUrl: nextEntry.remoteEpubUrl ?? previousEntry.remoteEpubUrl,
    planningPackUrl: nextEntry.planningPackUrl ?? previousEntry.planningPackUrl,
    artifactVersion: nextEntry.artifactVersion ?? previousEntry.artifactVersion ?? null,
  };
}

/**
 * Client-safe sync check; keep in sync with the Vercel flag
 * `disable-static-published-book-epub-fallback` when using
 * `NEXT_PUBLIC_DISABLE_STATIC_PUBLISHED_BOOK_EPUB_FALLBACK` in the browser.
 */
export function isStaticPublishedBookEpubFallbackDisabled(): boolean {
  const v = process.env.NEXT_PUBLIC_DISABLE_STATIC_PUBLISHED_BOOK_EPUB_FALLBACK;
  if (typeof v !== 'string' || !v.trim()) {
    return false;
  }
  return ['1', 'true', 'yes', 'on'].includes(v.trim().toLowerCase());
}

/**
 * Resolves the EPUB URL for downloads / reader. Prefer manifest `remoteEpubUrl` from publish.
 * When static fallback is disabled and no remote URL exists, returns `null` (no `/books/.../book.epub`).
 */
export function getPublishedBookDownloadUrl(input: {
  slug: string;
  remoteEpubUrl?: string | null;
  /** When set, overrides env-based detection (e.g. from server-evaluated Vercel flag). */
  disableStaticFallback?: boolean;
}): string | null {
  const remote = input.remoteEpubUrl?.trim();
  if (remote && remote.length > 0) {
    return remote;
  }
  const disabled =
    input.disableStaticFallback ?? isStaticPublishedBookEpubFallbackDisabled();
  if (disabled) {
    return null;
  }
  return `/books/${input.slug}/book.epub`;
}
