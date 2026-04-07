import { isUnknownRecord as isRecord } from '@/lib/is-unknown-record';
import { getPayloadClient } from '@/lib/payload';
import {
  READER_LIBRARY_COLLECTION_SLUG,
  READER_SETTINGS_COLLECTION_SLUG,
  normalizeReaderLibraryRecord,
  normalizeReaderWorkspaceSettings,
  type ReaderLibraryRecord,
  type ReaderWorkspaceSettings,
} from './workspace-contract';

export type ReaderWorkspaceRepositoryInput = {
  tenantId: string;
  userId: string;
};

export type ReaderWorkspaceRepositoryResult = {
  settings: ReaderWorkspaceSettings;
  libraryRecords: ReaderLibraryRecord[];
};

export interface ReaderWorkspaceRepository {
  getWorkspace(input: ReaderWorkspaceRepositoryInput): Promise<ReaderWorkspaceRepositoryResult>;
}

class PayloadReaderWorkspaceRepository implements ReaderWorkspaceRepository {
  async getWorkspace(
    input: ReaderWorkspaceRepositoryInput,
  ): Promise<ReaderWorkspaceRepositoryResult> {
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
            { tenant: { equals: input.tenantId } },
            { user: { equals: input.userId } },
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
            equals: input.tenantId,
          },
        },
      }),
    ]);

    const settingsDoc = isRecord(settingsResult.docs[0]) ? settingsResult.docs[0] : null;
    const libraryRecords = libraryResult.docs
      .map((doc) => (isRecord(doc) ? normalizeReaderLibraryRecord(doc) : null))
      .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc));

    return {
      settings: normalizeReaderWorkspaceSettings(settingsDoc),
      libraryRecords,
    };
  }
}

export function getReaderWorkspaceRepository(): ReaderWorkspaceRepository {
  return new PayloadReaderWorkspaceRepository();
}
