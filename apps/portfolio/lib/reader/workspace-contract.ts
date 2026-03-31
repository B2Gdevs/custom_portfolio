import type { AuthFeatureAccess } from '@/lib/auth/permissions';

export const READER_LIBRARY_COLLECTION_SLUG = 'reader-library-records';
export const READER_SETTINGS_COLLECTION_SLUG = 'reader-settings';
export const READER_LIBRARY_VISIBILITY_VALUES = ['private', 'public'] as const;

export type ReaderWorkspaceDefaultView = 'library' | 'continue-reading';
export type ReaderWorkspaceStorageMode = 'local-only' | 'hybrid';
export type ReaderLibrarySourceKind = 'built-in' | 'uploaded';
export type ReaderLibraryVisibility = 'private' | 'public';

export type ReaderWorkspaceSettings = {
  defaultWorkspaceView: ReaderWorkspaceDefaultView;
  preferPagedReader: boolean;
  showProgressBadges: boolean;
};

export type ReaderWorkspaceAccess = {
  authenticated: boolean;
  autoLoggedIn: boolean;
  isOwner: boolean;
  canPersist: boolean;
  canEdit: boolean;
  canUpload: boolean;
  uploadRequiresExplicitAction: true;
  localImportMode: 'local-only';
  storageMode: ReaderWorkspaceStorageMode;
};

export type ReaderLibraryRecord = {
  id: string;
  title: string;
  bookSlug: string | null;
  author: string | null;
  description: string | null;
  coverImageUrl: string | null;
  epubUrl: string | null;
  sourceKind: ReaderLibrarySourceKind;
  sourceFileName: string | null;
  visibility: ReaderLibraryVisibility;
  updatedAt: string | null;
};

export type ReaderWorkspaceBootstrap = {
  access: ReaderWorkspaceAccess;
  settings: ReaderWorkspaceSettings;
  libraryRecords: ReaderLibraryRecord[];
};

export const DEFAULT_READER_WORKSPACE_SETTINGS: ReaderWorkspaceSettings = {
  defaultWorkspaceView: 'library',
  preferPagedReader: true,
  showProgressBadges: true,
};

function asString(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

export function resolveReaderWorkspaceAccess(
  featureAccess: AuthFeatureAccess | null | undefined,
): ReaderWorkspaceAccess {
  const authenticated = Boolean(featureAccess?.authenticated);
  const canPersist = Boolean(featureAccess?.features.reader.persist);
  const canEdit = Boolean(featureAccess?.features.reader.edit);
  const canUpload = Boolean(featureAccess?.features.reader.upload);

  return {
    authenticated,
    autoLoggedIn: Boolean(featureAccess?.autoLoggedIn),
    isOwner: Boolean(featureAccess?.isOwner),
    canPersist,
    canEdit,
    canUpload,
    uploadRequiresExplicitAction: true,
    localImportMode: 'local-only',
    storageMode: authenticated && canPersist ? 'hybrid' : 'local-only',
  };
}

export function mergeReaderWorkspaceSettings(
  value: Partial<ReaderWorkspaceSettings> | null | undefined,
): ReaderWorkspaceSettings {
  const defaultWorkspaceView =
    value?.defaultWorkspaceView === 'continue-reading' ? 'continue-reading' : 'library';

  return {
    defaultWorkspaceView,
    preferPagedReader: asBoolean(value?.preferPagedReader, DEFAULT_READER_WORKSPACE_SETTINGS.preferPagedReader),
    showProgressBadges: asBoolean(
      value?.showProgressBadges,
      DEFAULT_READER_WORKSPACE_SETTINGS.showProgressBadges,
    ),
  };
}

export function normalizeReaderWorkspaceSettings(
  doc: Record<string, unknown> | null | undefined,
): ReaderWorkspaceSettings {
  return mergeReaderWorkspaceSettings(
    doc
      ? {
          defaultWorkspaceView:
            doc.defaultWorkspaceView === 'continue-reading' ? 'continue-reading' : 'library',
          preferPagedReader: asBoolean(doc.preferPagedReader, DEFAULT_READER_WORKSPACE_SETTINGS.preferPagedReader),
          showProgressBadges: asBoolean(
            doc.showProgressBadges,
            DEFAULT_READER_WORKSPACE_SETTINGS.showProgressBadges,
          ),
        }
      : null,
  );
}

export function normalizeReaderLibraryRecord(
  doc: Record<string, unknown> | null | undefined,
): ReaderLibraryRecord | null {
  const id = asString(doc?.id);
  const title = asString(doc?.title);

  if (!id || !title) {
    return null;
  }

  return {
    id,
    title,
    bookSlug: asString(doc?.bookSlug),
    author: asString(doc?.author),
    description: asString(doc?.description),
    coverImageUrl: asString(doc?.coverImageUrl),
    epubUrl: asString(doc?.epubUrl),
    sourceKind: doc?.sourceKind === 'built-in' ? 'built-in' : 'uploaded',
    sourceFileName: asString(doc?.sourceFileName),
    visibility: doc?.visibility === 'public' ? 'public' : 'private',
    updatedAt: asString(doc?.updatedAt),
  };
}
