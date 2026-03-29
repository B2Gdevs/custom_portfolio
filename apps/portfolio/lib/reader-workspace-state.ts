import type { BookEntry } from '@/lib/books';

export interface UploadedBookSource {
  buffer: ArrayBuffer;
  fileName: string;
  storageKey: string;
  title: string;
}

type ReaderWorkspaceViewerSource =
  | {
      kind: 'built-in';
      epubUrl: string;
      storageKey: string;
    }
  | {
      kind: 'local';
      epubData: ArrayBuffer;
      storageKey: string;
    };

type ReaderWorkspaceLibraryState = {
  mode: 'library';
  title: 'Reader library';
  kicker: 'Built-in shelf';
  bookSlug: null;
  canDownload: false;
  viewerSource: null;
  localFileName: null;
};

type ReaderWorkspaceBuiltInReadingState = {
  mode: 'built-in-reading';
  title: string;
  kicker: 'Built-in reading';
  bookSlug: string;
  canDownload: true;
  viewerSource: ReaderWorkspaceViewerSource & { kind: 'built-in' };
  localFileName: null;
};

type ReaderWorkspaceLocalReadingState = {
  mode: 'local-reading';
  title: string;
  kicker: 'Local EPUB';
  bookSlug: string | null;
  canDownload: boolean;
  viewerSource: ReaderWorkspaceViewerSource & { kind: 'local' };
  localFileName: string;
};

export type ReaderWorkspaceState =
  | ReaderWorkspaceLibraryState
  | ReaderWorkspaceBuiltInReadingState
  | ReaderWorkspaceLocalReadingState;

export function resolveReaderWorkspaceState({
  initialBook,
  uploadedBook,
}: {
  initialBook?: BookEntry;
  uploadedBook?: UploadedBookSource | null;
}): ReaderWorkspaceState {
  if (uploadedBook) {
    return {
      mode: 'local-reading',
      title: uploadedBook.title,
      kicker: 'Local EPUB',
      bookSlug: initialBook?.slug ?? null,
      canDownload: Boolean(initialBook?.hasEpub),
      localFileName: uploadedBook.fileName,
      viewerSource: {
        kind: 'local',
        epubData: uploadedBook.buffer,
        storageKey: uploadedBook.storageKey,
      },
    };
  }

  if (initialBook?.hasEpub) {
    return {
      mode: 'built-in-reading',
      title: initialBook.title,
      kicker: 'Built-in reading',
      bookSlug: initialBook.slug,
      canDownload: true,
      localFileName: null,
      viewerSource: {
        kind: 'built-in',
        epubUrl: `/books/${initialBook.slug}/book.epub`,
        storageKey: initialBook.slug,
      },
    };
  }

  return {
    mode: 'library',
    title: 'Reader library',
    kicker: 'Built-in shelf',
    bookSlug: null,
    canDownload: false,
    viewerSource: null,
    localFileName: null,
  };
}
