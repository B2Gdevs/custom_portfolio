import {
  normalizeOptionalTrimmedString,
} from '@/lib/coerce-unknown-to-string';
import {
  parseUnknownFiniteNumber,
  unknownToBoolean,
} from '@/lib/coerce-unknown';

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

export function normalizeSiteDownloadPublishComparable(value: unknown): SiteDownloadPublishComparable | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = normalizeOptionalTrimmedString(record.title);
  const downloadSlug = normalizeOptionalTrimmedString(record.downloadSlug);
  const downloadKind = normalizeOptionalTrimmedString(record.downloadKind);
  const contentScope = normalizeOptionalTrimmedString(record.contentScope);
  const checksumSha256 = normalizeOptionalTrimmedString(record.checksumSha256);
  const fileSizeBytes = parseUnknownFiniteNumber(record.fileSizeBytes);

  if (!title || !downloadSlug || !downloadKind || !contentScope || !checksumSha256 || fileSizeBytes === null) {
    return null;
  }

  return {
    title,
    downloadSlug,
    downloadKind: downloadKind as SiteDownloadKind,
    contentScope: contentScope as SiteDownloadScope,
    contentSlug: normalizeOptionalTrimmedString(record.contentSlug),
    downloadLabel: normalizeOptionalTrimmedString(record.downloadLabel),
    summary: normalizeOptionalTrimmedString(record.summary),
    checksumSha256,
    fileSizeBytes,
    sourcePath: normalizeOptionalTrimmedString(record.sourcePath),
    isCurrent: unknownToBoolean(record.isCurrent) ?? false,
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
