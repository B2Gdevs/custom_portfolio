import path from 'node:path';
import type { ContentLink } from '@/lib/content';
import { coerceUnknownToString as asString } from '@/lib/coerce-unknown-to-string';
import { unknownToBoolean, unknownToFiniteNumber } from '@/lib/coerce-unknown';
import { getSiteDownloadAssetFileURL } from '@/lib/payload/collections/siteDownloadAssets';
import { runSiteDownloadAssetsWorker } from '@/lib/site-download-assets-worker-runner';

export type SiteDownloadAssetKind =
  | 'resume'
  | 'planning-pack'
  | 'app-bundle'
  | 'document'
  | 'archive'
  | 'other';

export type SiteDownloadAssetScope = 'site' | 'app' | 'project' | 'resume' | 'book';

export type SiteDownloadAssetRecord = {
  id: string;
  title: string;
  downloadSlug: string;
  downloadKind: SiteDownloadAssetKind;
  contentScope: SiteDownloadAssetScope;
  contentSlug?: string;
  downloadLabel?: string;
  summary?: string;
  isCurrent: boolean;
  checksumSha256: string;
  fileSizeBytes: number;
  sourceCommit?: string;
  sourcePath?: string;
  publishedAt?: string;
  filename?: string;
  url?: string;
  mimeType?: string;
};

type SiteDownloadAssetDoc = Partial<
  Record<
    | 'id'
    | 'title'
    | 'downloadSlug'
    | 'downloadKind'
    | 'contentScope'
    | 'contentSlug'
    | 'downloadLabel'
    | 'summary'
    | 'isCurrent'
    | 'checksumSha256'
    | 'fileSizeBytes'
    | 'sourceCommit'
    | 'sourcePath'
    | 'publishedAt'
    | 'filename'
    | 'url'
    | 'mimeType',
    unknown
  >
>;

export type FindSiteDownloadAssetsInput = {
  downloadKind?: SiteDownloadAssetKind;
  contentScope?: SiteDownloadAssetScope;
  contentSlug?: string;
  downloadSlug?: string;
};

function isSiteDownloadAssetKind(value: string): value is SiteDownloadAssetKind {
  return (
    value === 'resume' ||
    value === 'planning-pack' ||
    value === 'app-bundle' ||
    value === 'document' ||
    value === 'archive' ||
    value === 'other'
  );
}

function isSiteDownloadAssetScope(value: string): value is SiteDownloadAssetScope {
  return (
    value === 'site' ||
    value === 'app' ||
    value === 'project' ||
    value === 'resume' ||
    value === 'book'
  );
}

function toSiteDownloadAssetRecord(doc: SiteDownloadAssetDoc): SiteDownloadAssetRecord | null {
  const id = asString(doc.id);
  const title = asString(doc.title);
  const downloadSlug = asString(doc.downloadSlug);
  const downloadKind = asString(doc.downloadKind);
  const contentScope = asString(doc.contentScope);
  const checksumSha256 = asString(doc.checksumSha256);
  const fileSizeBytes = unknownToFiniteNumber(doc.fileSizeBytes);

  if (
    !id ||
    !title ||
    !downloadSlug ||
    !downloadKind ||
    !isSiteDownloadAssetKind(downloadKind) ||
    !contentScope ||
    !isSiteDownloadAssetScope(contentScope) ||
    !checksumSha256 ||
    fileSizeBytes === null
  ) {
    return null;
  }

  return {
    id,
    title,
    downloadSlug,
    downloadKind,
    contentScope,
    ...(asString(doc.contentSlug) ? { contentSlug: asString(doc.contentSlug) ?? undefined } : {}),
    ...(asString(doc.downloadLabel)
      ? { downloadLabel: asString(doc.downloadLabel) ?? undefined }
      : {}),
    ...(asString(doc.summary) ? { summary: asString(doc.summary) ?? undefined } : {}),
    isCurrent: unknownToBoolean(doc.isCurrent) ?? false,
    checksumSha256,
    fileSizeBytes,
    ...(asString(doc.sourceCommit) ? { sourceCommit: asString(doc.sourceCommit) ?? undefined } : {}),
    ...(asString(doc.sourcePath) ? { sourcePath: asString(doc.sourcePath) ?? undefined } : {}),
    ...(asString(doc.publishedAt) ? { publishedAt: asString(doc.publishedAt) ?? undefined } : {}),
    ...(asString(doc.filename) ? { filename: asString(doc.filename) ?? undefined } : {}),
    ...(asString(doc.url) ? { url: asString(doc.url) ?? undefined } : {}),
    ...(asString(doc.mimeType) ? { mimeType: asString(doc.mimeType) ?? undefined } : {}),
  };
}

function compareAssets(a: SiteDownloadAssetRecord, b: SiteDownloadAssetRecord) {
  const publishedDiff = (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
  if (publishedDiff !== 0) {
    return publishedDiff;
  }

  return a.downloadSlug.localeCompare(b.downloadSlug);
}

export function normalizeSiteDownloadAssetDocs(docs: unknown[]) {
  return docs
    .map((doc) => toSiteDownloadAssetRecord(doc as SiteDownloadAssetDoc))
    .filter((asset): asset is SiteDownloadAssetRecord => asset !== null)
    .sort(compareAssets);
}

export function resolveSiteDownloadAssetUrl(asset: Pick<SiteDownloadAssetRecord, 'filename' | 'url'>) {
  if (asset.filename) {
    return getSiteDownloadAssetFileURL(asset.filename);
  }

  return asset.url ?? null;
}

export function toSiteDownloadLinks(downloadAssets: unknown): ContentLink[] | undefined {
  if (!Array.isArray(downloadAssets) || downloadAssets.length === 0) {
    return undefined;
  }

  const assets = normalizeSiteDownloadAssetDocs(downloadAssets);
  if (assets.length === 0) {
    return undefined;
  }

  const links = assets.reduce<ContentLink[]>((acc, asset) => {
    const href = resolveSiteDownloadAssetUrl(asset);
    if (!href) {
      return acc;
    }

    acc.push({
      href,
      label: asset.downloadLabel ?? asset.title,
      description: asset.summary,
      kind: 'download',
      external: false,
    });

    return acc;
  }, []);

  return links.length > 0 ? links : undefined;
}

export async function findSiteDownloadAssets(
  input: FindSiteDownloadAssetsInput = {},
): Promise<SiteDownloadAssetRecord[]> {
  try {
    const result = await runSiteDownloadAssetsWorker(input);
    const body = result.body as
      | {
          ok?: boolean;
          assets?: unknown[];
        }
      | undefined;

    if (body?.ok && Array.isArray(body.assets)) {
      return normalizeSiteDownloadAssetDocs(body.assets);
    }
  } catch {
    // Fall back to repo-local artifacts when Payload is unavailable.
  }

  return [];
}

export function pickResumeHtmlAsset(assets: SiteDownloadAssetRecord[]) {
  return (
    [...assets]
      .sort(compareAssets)
      .find((asset) => {
        const extension = asset.filename ? path.extname(asset.filename).toLowerCase() : '';
        return asset.mimeType === 'text/html' || extension === '.html';
      }) ?? null
  );
}
