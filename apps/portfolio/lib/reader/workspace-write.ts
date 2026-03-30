import 'server-only';

import {
  canEditReaderData,
  canUploadReaderData,
} from '@/lib/auth/permissions';
import { getSessionViewer } from '@/lib/auth/session';
import { getPayloadClient } from '@/lib/payload';
import { READER_LIBRARY_ASSET_COLLECTION_SLUG } from '@/lib/payload/collections/readerLibraryAssets';
import {
  READER_LIBRARY_COLLECTION_SLUG,
  READER_SETTINGS_COLLECTION_SLUG,
  normalizeReaderWorkspaceSettings,
} from './workspace-contract';
import {
  normalizeReaderLibraryUploadInput,
  normalizeReaderWorkspaceSettingsInput,
  normalizeSavedReaderLibraryRecord,
  type ReaderLibraryUploadInput,
  type ReaderWorkspaceSettingsInput,
} from './workspace-write-contract';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object';
}

export async function saveReaderWorkspaceSettings(
  input: ReaderWorkspaceSettingsInput,
  request?: Request,
) {
  const viewer = await getSessionViewer(
    request ?? new Request('http://localhost/api/reader/workspace/settings'),
  );
  const tenantId = viewer.user?.tenant?.id ?? null;
  const userId = viewer.user?.id ?? null;

  if (!viewer.authenticated || !tenantId || !userId || !canEditReaderData(viewer)) {
    return null;
  }

  const payload = await getPayloadClient();
  const normalizedInput = normalizeReaderWorkspaceSettingsInput(input);
  const existing = await payload.find({
    collection: READER_SETTINGS_COLLECTION_SLUG,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { tenant: { equals: tenantId } },
        { user: { equals: userId } },
      ],
    },
  });

  const existingDoc = isRecord(existing.docs[0]) ? existing.docs[0] : null;
  const saved = existingDoc?.id
    ? await payload.update({
        collection: READER_SETTINGS_COLLECTION_SLUG,
        id: String(existingDoc.id),
        data: normalizedInput,
        depth: 0,
        overrideAccess: true,
      })
    : await payload.create({
        collection: READER_SETTINGS_COLLECTION_SLUG,
        data: {
          tenant: tenantId,
          user: userId,
          ...normalizedInput,
        },
        depth: 0,
        overrideAccess: true,
      });

  return normalizeReaderWorkspaceSettings(isRecord(saved) ? saved : null);
}

export async function uploadReaderLibraryEpub(
  input: ReaderLibraryUploadInput,
  request?: Request,
) {
  const viewer = await getSessionViewer(
    request ?? new Request('http://localhost/api/reader/library/upload'),
  );
  const tenantId = viewer.user?.tenant?.id ?? null;
  const userId = viewer.user?.id ?? null;

  if (!viewer.authenticated || !tenantId || !userId || !canUploadReaderData(viewer)) {
    return null;
  }

  const normalizedInput = normalizeReaderLibraryUploadInput(input);
  if (!normalizedInput) {
    return null;
  }

  const payload = await getPayloadClient();
  const asset = await payload.create({
    collection: READER_LIBRARY_ASSET_COLLECTION_SLUG,
    data: {
      tenant: tenantId,
      uploadedBy: userId,
    },
    filePath: normalizedInput.filePath,
    overrideAccess: true,
  });

  const assetId = isRecord(asset) && asset.id != null ? String(asset.id) : null;
  const assetUrl =
    isRecord(asset) && typeof asset.url === 'string' && asset.url.trim().length > 0
      ? asset.url
      : null;

  const saved = await payload.create({
    collection: READER_LIBRARY_COLLECTION_SLUG,
    data: {
      title: normalizedInput.title,
      author: normalizedInput.author,
      description: normalizedInput.description,
      sourceKind: 'uploaded',
      sourceFileName: normalizedInput.sourceFileName,
      visibility: normalizedInput.visibility,
      tenant: tenantId,
      uploadedBy: userId,
      epubAsset: assetId,
      epubUrl: assetUrl,
    },
    depth: 0,
    overrideAccess: true,
  });

  return normalizeSavedReaderLibraryRecord(isRecord(saved) ? saved : null);
}
