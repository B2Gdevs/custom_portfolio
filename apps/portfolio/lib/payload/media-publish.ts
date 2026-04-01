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

function asString(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
}

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

function normalizeOptionalString(value: unknown) {
  const normalized = asString(value)?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

export function normalizeSiteMediaPublishComparable(value: unknown): SiteMediaPublishComparable | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = normalizeOptionalString(record.title);
  const sourcePath = normalizeOptionalString(record.sourcePath);
  const contentScope = normalizeOptionalString(record.contentScope);
  const mediaKind = normalizeOptionalString(record.mediaKind);
  const checksumSha256 = normalizeOptionalString(record.checksumSha256);
  const fileSizeBytes = asNumber(record.fileSizeBytes);

  if (!title || !sourcePath || !contentScope || !mediaKind || !checksumSha256 || fileSizeBytes === null) {
    return null;
  }

  return {
    title,
    sourcePath,
    contentScope: contentScope as SiteContentScope,
    contentSlug: normalizeOptionalString(record.contentSlug),
    mediaKind: mediaKind as MediaKind,
    isCurrent: asBoolean(record.isCurrent) ?? false,
    checksumSha256,
    fileSizeBytes,
  };
}

export function normalizeListenMediaPublishComparable(value: unknown): ListenMediaPublishComparable | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = normalizeOptionalString(record.title);
  const listenSlug = normalizeOptionalString(record.listenSlug);
  const sourcePath = normalizeOptionalString(record.sourcePath);
  const mediaRole = normalizeOptionalString(record.mediaRole);
  const mediaKind = normalizeOptionalString(record.mediaKind);
  const checksumSha256 = normalizeOptionalString(record.checksumSha256);
  const fileSizeBytes = asNumber(record.fileSizeBytes);

  if (!title || !listenSlug || !sourcePath || !mediaRole || !mediaKind || !checksumSha256 || fileSizeBytes === null) {
    return null;
  }

  return {
    title,
    listenSlug,
    sourcePath,
    mediaRole: mediaRole as ListenMediaRole,
    mediaKind: mediaKind as MediaKind,
    isCurrent: asBoolean(record.isCurrent) ?? false,
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
