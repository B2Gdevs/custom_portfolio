import {
  mergeReaderWorkspaceSettings,
  normalizeReaderLibraryRecord,
  READER_LIBRARY_VISIBILITY_VALUES,
  type ReaderLibraryRecord,
  type ReaderLibraryVisibility,
  type ReaderWorkspaceSettings,
} from './workspace-contract';

export type ReaderWorkspaceSettingsInput = ReaderWorkspaceSettings;

export type ReaderLibraryUploadInput = {
  title: string;
  author: string | null;
  description: string | null;
  visibility: ReaderLibraryVisibility;
  sourceFileName: string;
  filePath: string;
};

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeReaderWorkspaceSettingsInput(
  input: Partial<ReaderWorkspaceSettings> | null | undefined,
) {
  return mergeReaderWorkspaceSettings(input ?? null);
}

export function normalizeReaderLibraryUploadInput(
  input: Partial<ReaderLibraryUploadInput> | null | undefined,
): ReaderLibraryUploadInput | null {
  const title = asString(input?.title);
  const sourceFileName = asString(input?.sourceFileName);
  const filePath = asString(input?.filePath);

  if (!title || !sourceFileName || !filePath) {
    return null;
  }

  return {
    title,
    author: asString(input?.author) || null,
    description: asString(input?.description) || null,
    visibility: READER_LIBRARY_VISIBILITY_VALUES.includes(input?.visibility as ReaderLibraryVisibility)
      ? (input?.visibility as ReaderLibraryVisibility)
      : 'private',
    sourceFileName,
    filePath,
  };
}

export function normalizeSavedReaderLibraryRecord(value: Record<string, unknown> | null | undefined) {
  return normalizeReaderLibraryRecord(value) as ReaderLibraryRecord | null;
}
