import {
  normalizeOptionalTrimmedString,
} from '@/lib/coerce-unknown-to-string';
import {
  parseUnknownFiniteNumber,
  unknownToBoolean,
} from '@/lib/coerce-unknown';

type MediaKind = 'image' | 'video' | 'audio' | 'document' | 'other';

type SiteContentScope = 'project' | 'blog' | 'og' | 'home' | 'brand' | 'site';
type ListenMediaRole = 'artwork' | 'gallery-image' | 'downloadable' | 'other';

export type SiteMediaPublishComparable = {
  title: string;
  sourcePath: string;
  contentScope: SiteContentScope;
  contentSlug: string | null;
  mediaKind: MediaKind;
  isCurrent: boolean;
  checksumSha256: string;
  fileSizeBytes: number;
};

export type ListenMediaPublishComparable = {
  title: string;
  listenSlug: string;
  sourcePath: string;
  mediaRole: ListenMediaRole;
  mediaKind: MediaKind;
  isCurrent: boolean;
  checksumSha256: string;
  fileSizeBytes: number;
};

export function normalizeSiteMediaPublishComparable(value: unknown): SiteMediaPublishComparable | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = normalizeOptionalTrimmedString(record.title);
  const sourcePath = normalizeOptionalTrimmedString(record.sourcePath);
  const contentScope = normalizeOptionalTrimmedString(record.contentScope);
  const mediaKind = normalizeOptionalTrimmedString(record.mediaKind);
  const checksumSha256 = normalizeOptionalTrimmedString(record.checksumSha256);
  const fileSizeBytes = parseUnknownFiniteNumber(record.fileSizeBytes);

  if (!title || !sourcePath || !contentScope || !mediaKind || !checksumSha256 || fileSizeBytes === null) {
    return null;
  }

  return {
    title,
    sourcePath,
    contentScope: contentScope as SiteContentScope,
    contentSlug: normalizeOptionalTrimmedString(record.contentSlug),
    mediaKind: mediaKind as MediaKind,
    isCurrent: unknownToBoolean(record.isCurrent) ?? false,
    checksumSha256,
    fileSizeBytes,
  };
}

export function normalizeListenMediaPublishComparable(value: unknown): ListenMediaPublishComparable | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = normalizeOptionalTrimmedString(record.title);
  const listenSlug = normalizeOptionalTrimmedString(record.listenSlug);
  const sourcePath = normalizeOptionalTrimmedString(record.sourcePath);
  const mediaRole = normalizeOptionalTrimmedString(record.mediaRole);
  const mediaKind = normalizeOptionalTrimmedString(record.mediaKind);
  const checksumSha256 = normalizeOptionalTrimmedString(record.checksumSha256);
  const fileSizeBytes = parseUnknownFiniteNumber(record.fileSizeBytes);

  if (!title || !listenSlug || !sourcePath || !mediaRole || !mediaKind || !checksumSha256 || fileSizeBytes === null) {
    return null;
  }

  return {
    title,
    listenSlug,
    sourcePath,
    mediaRole: mediaRole as ListenMediaRole,
    mediaKind: mediaKind as MediaKind,
    isCurrent: unknownToBoolean(record.isCurrent) ?? false,
    checksumSha256,
    fileSizeBytes,
  };
}

export function shouldUpdatePublishedSiteMedia(
  existing: unknown,
  desired: SiteMediaPublishComparable,
) {
  const normalizedExisting = normalizeSiteMediaPublishComparable(existing);
  if (!normalizedExisting) {
    return true;
  }

  return JSON.stringify(normalizedExisting) !== JSON.stringify(desired);
}

export function shouldUpdatePublishedListenMedia(
  existing: unknown,
  desired: ListenMediaPublishComparable,
) {
  const normalizedExisting = normalizeListenMediaPublishComparable(existing);
  if (!normalizedExisting) {
    return true;
  }

  return JSON.stringify(normalizedExisting) !== JSON.stringify(desired);
}
