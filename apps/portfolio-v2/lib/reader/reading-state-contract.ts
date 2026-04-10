import type { PortfolioAnnotation } from '@/lib/reader-ui/epub-annotations';
import { coerceUnknownToString as asString } from '@/lib/coerce-unknown-to-string';
import { isUnknownRecord as isRecord } from '@/lib/is-unknown-record';

export const READER_READING_STATE_COLLECTION_SLUG = 'reader-reading-states';

export type ReaderPersistedState = {
  storageKey: string;
  contentHash: string;
  bookSlug: string | null;
  sourceKind: 'built-in' | 'uploaded';
  location: string | null;
  progress: number | null;
  annotations: PortfolioAnnotation[];
  updatedAt: string | null;
};

export type ReaderPersistedStateInput = Omit<ReaderPersistedState, 'updatedAt'>;

function clampProgress(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(1, Math.max(0, value));
}

function normalizeAnnotation(value: unknown): PortfolioAnnotation | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id);
  const cfiRange = asString(value.cfiRange);

  if (!id || !cfiRange) {
    return null;
  }

  return {
    id,
    cfiRange,
    quote: asString(value.quote) ?? '',
    note: asString(value.note) ?? '',
    color: asString(value.color) ?? 'amber',
    createdAt: asString(value.createdAt) ?? new Date().toISOString(),
    updatedAt: asString(value.updatedAt) ?? new Date().toISOString(),
  };
}

export function normalizeReaderPersistedState(
  doc: Record<string, unknown> | null | undefined,
): ReaderPersistedState | null {
  const storageKey = asString(doc?.storageKey);
  const contentHash = asString(doc?.contentHash);

  if (!storageKey || !contentHash) {
    return null;
  }

  const annotations = Array.isArray(doc?.annotations)
    ? doc.annotations
        .map((item) => normalizeAnnotation(item))
        .filter((item): item is PortfolioAnnotation => Boolean(item))
    : [];

  return {
    storageKey,
    contentHash,
    bookSlug: asString(doc?.bookSlug),
    sourceKind: doc?.sourceKind === 'uploaded' ? 'uploaded' : 'built-in',
    location: asString(doc?.location),
    progress: clampProgress(doc?.progress),
    annotations,
    updatedAt: asString(doc?.updatedAt),
  };
}
