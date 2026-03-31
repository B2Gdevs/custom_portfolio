import { getViewerFeatureAccess } from '@/lib/auth/permissions';
import { getSessionViewer } from '@/lib/auth/session';
import { getPayloadClient } from '@/lib/payload';
import {
  DEFAULT_READER_WORKSPACE_SETTINGS,
  READER_LIBRARY_COLLECTION_SLUG,
  READER_SETTINGS_COLLECTION_SLUG,
  normalizeReaderLibraryRecord,
  normalizeReaderWorkspaceSettings,
  resolveReaderWorkspaceAccess,
  type ReaderWorkspaceBootstrap,
} from './workspace-contract';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object';
}

export async function getReaderWorkspaceBootstrap(
  request?: Request,
): Promise<ReaderWorkspaceBootstrap> {
  const viewer = await getSessionViewer(
    request ?? new Request('http://localhost/api/reader/workspace'),
  );
  const featureAccess = getViewerFeatureAccess(viewer);
  const access = resolveReaderWorkspaceAccess(featureAccess);
  const tenantId = viewer.user?.tenant?.id ?? null;
  const userId = viewer.user?.id ?? null;

  if (!featureAccess.authenticated || !tenantId || !userId) {
    return {
      access,
      settings: DEFAULT_READER_WORKSPACE_SETTINGS,
      libraryRecords: [],
    };
  }

  const payload = await getPayloadClient();
  const [settingsResult, libraryResult] = await Promise.all([
    payload.find({
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
    }),
    payload.find({
      collection: READER_LIBRARY_COLLECTION_SLUG,
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      sort: '-updatedAt',
      where: {
        tenant: {
          equals: tenantId,
        },
      },
    }),
  ]);

  const settingsDoc = isRecord(settingsResult.docs[0]) ? settingsResult.docs[0] : null;
  const libraryRecords = libraryResult.docs
    .map((doc) => (isRecord(doc) ? normalizeReaderLibraryRecord(doc) : null))
    .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc));

  return {
    access,
    settings: normalizeReaderWorkspaceSettings(settingsDoc),
    libraryRecords,
  };
}
