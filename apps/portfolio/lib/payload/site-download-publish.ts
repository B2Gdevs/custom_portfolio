type SiteDownloadKind = 'planning-pack' | 'resume' | 'app-bundle' | 'document' | 'archive' | 'other';
type SiteDownloadScope = 'site' | 'app' | 'project' | 'resume' | 'book';

export type SiteDownloadPublishComparable = {
  title: string;
  downloadSlug: string;
  downloadKind: SiteDownloadKind;
  contentScope: SiteDownloadScope;
  contentSlug: string | null;
  downloadLabel: string | null;
  summary: string | null;
  checksumSha256: string;
  fileSizeBytes: number;
  sourcePath: string | null;
  isCurrent: boolean;
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

export function normalizeSiteDownloadPublishComparable(value: unknown): SiteDownloadPublishComparable | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = normalizeOptionalString(record.title);
  const downloadSlug = normalizeOptionalString(record.downloadSlug);
  const downloadKind = normalizeOptionalString(record.downloadKind);
  const contentScope = normalizeOptionalString(record.contentScope);
  const checksumSha256 = normalizeOptionalString(record.checksumSha256);
  const fileSizeBytes = asNumber(record.fileSizeBytes);

  if (!title || !downloadSlug || !downloadKind || !contentScope || !checksumSha256 || fileSizeBytes === null) {
    return null;
  }

  return {
    title,
    downloadSlug,
    downloadKind: downloadKind as SiteDownloadKind,
    contentScope: contentScope as SiteDownloadScope,
    contentSlug: normalizeOptionalString(record.contentSlug),
    downloadLabel: normalizeOptionalString(record.downloadLabel),
    summary: normalizeOptionalString(record.summary),
    checksumSha256,
    fileSizeBytes,
    sourcePath: normalizeOptionalString(record.sourcePath),
    isCurrent: asBoolean(record.isCurrent) ?? false,
  };
}

export function shouldUpdatePublishedSiteDownload(
  existing: unknown,
  desired: SiteDownloadPublishComparable,
) {
  const normalizedExisting = normalizeSiteDownloadPublishComparable(existing);
  if (!normalizedExisting) {
    return true;
  }

  return JSON.stringify(normalizedExisting) !== JSON.stringify(desired);
}
