import 'server-only';

import type { PortfolioAnnotation } from '@portfolio/repub-builder/reader';
import { canPersistReaderData } from '@/lib/auth/permissions';
import { getSessionViewer } from '@/lib/auth/session';
import { getPayloadClient } from '@/lib/payload';
import {
  READER_READING_STATE_COLLECTION_SLUG,
  normalizeReaderPersistedState,
  type ReaderPersistedState,
  type ReaderPersistedStateInput,
} from './reading-state-contract';

function isBuiltInReaderSource(kind: string | null | undefined) {
  return kind === 'built-in';
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

async function getPersistCapableViewer(request?: Request) {
  const viewer = await getSessionViewer(
    request ?? new Request('http://localhost/api/reader/state'),
  );

  if (!viewer.authenticated || !viewer.user || !canPersistReaderData(viewer)) {
    return null;
  }

  const tenantId = viewer.user.tenant?.id ?? null;
  if (!tenantId) {
    return null;
  }

  return {
    viewer,
    userId: viewer.user.id,
    tenantId,
  };
}

export async function getReaderPersistedState(
  input: Pick<ReaderPersistedStateInput, 'storageKey' | 'contentHash'>,
  request?: Request,
): Promise<ReaderPersistedState | null> {
  const session = await getPersistCapableViewer(request);
  if (!session) {
    return null;
  }

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
        { tenant: { equals: session.tenantId } },
        { user: { equals: session.userId } },
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

export async function saveReaderPersistedState(
  input: ReaderPersistedStateInput,
  request?: Request,
): Promise<ReaderPersistedState | null> {
  const session = await getPersistCapableViewer(request);
  if (!session || !isBuiltInReaderSource(input.sourceKind)) {
    return null;
  }

  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: READER_READING_STATE_COLLECTION_SLUG,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { tenant: { equals: session.tenantId } },
        { user: { equals: session.userId } },
        { storageKey: { equals: input.storageKey } },
        { contentHash: { equals: input.contentHash } },
      ],
    },
  });

  const data = {
    tenant: session.tenantId,
    user: session.userId,
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
