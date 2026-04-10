import 'server-only';

import type { PortfolioAnnotation } from '@/lib/reader-ui/epub-annotations';
import { getPayloadClient } from '@/lib/payload';
import {
  READER_READING_STATE_COLLECTION_SLUG,
  normalizeReaderPersistedState,
  type ReaderPersistedState,
  type ReaderPersistedStateInput,
} from './reading-state-contract';

export type ReaderStateRepositoryLookupInput = Pick<
  ReaderPersistedStateInput,
  'storageKey' | 'contentHash'
> & {
  tenantId: string;
  userId: string;
};

export type ReaderStateRepositorySaveInput = ReaderPersistedStateInput & {
  tenantId: string;
  userId: string;
};

export interface ReaderStateRepository {
  get(input: ReaderStateRepositoryLookupInput): Promise<ReaderPersistedState | null>;
  save(input: ReaderStateRepositorySaveInput): Promise<ReaderPersistedState | null>;
}

function clampProgress(value: number | null) {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.min(1, Math.max(0, value));
}

function normalizeAnnotations(value: PortfolioAnnotation[]) {
  return value.map((annotation) => ({
    id: annotation.id,
    cfiRange: annotation.cfiRange,
    quote: annotation.quote,
    note: annotation.note,
    color: annotation.color,
    createdAt: annotation.createdAt,
    updatedAt: annotation.updatedAt,
  }));
}

class PayloadReaderStateRepository implements ReaderStateRepository {
  async get(input: ReaderStateRepositoryLookupInput): Promise<ReaderPersistedState | null> {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: READER_READING_STATE_COLLECTION_SLUG,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      sort: '-updatedAt',
      where: {
        and: [
          { tenant: { equals: input.tenantId } },
          { user: { equals: input.userId } },
          { storageKey: { equals: input.storageKey } },
          { contentHash: { equals: input.contentHash } },
        ],
      },
    });

    const doc = result.docs[0];
    return doc && typeof doc === 'object'
      ? normalizeReaderPersistedState(doc as Record<string, unknown>)
      : null;
  }

  async save(input: ReaderStateRepositorySaveInput): Promise<ReaderPersistedState | null> {
    const payload = await getPayloadClient();
    const existing = await payload.find({
      collection: READER_READING_STATE_COLLECTION_SLUG,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { tenant: { equals: input.tenantId } },
          { user: { equals: input.userId } },
          { storageKey: { equals: input.storageKey } },
          { contentHash: { equals: input.contentHash } },
        ],
      },
    });

    const data = {
      tenant: input.tenantId,
      user: input.userId,
      storageKey: input.storageKey,
      bookSlug: input.bookSlug,
      contentHash: input.contentHash,
      sourceKind: input.sourceKind,
      location: input.location,
      progress: clampProgress(input.progress),
      annotations: normalizeAnnotations(input.annotations),
    };

    const saved = existing.docs[0]
      ? await payload.update({
          collection: READER_READING_STATE_COLLECTION_SLUG,
          id: String((existing.docs[0] as Record<string, unknown>).id),
          overrideAccess: true,
          data,
        })
      : await payload.create({
          collection: READER_READING_STATE_COLLECTION_SLUG,
          overrideAccess: true,
          data,
        });

    return normalizeReaderPersistedState(saved as Record<string, unknown>);
  }
}

export function getReaderStateRepository(): ReaderStateRepository {
  return new PayloadReaderStateRepository();
}
