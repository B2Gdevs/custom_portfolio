import { getReaderBookStorageKey, resolveReaderWorkspaceState } from '@/lib/reader-workspace-state';
import type { BookEntry } from '@/lib/books';

const builtInBook: BookEntry = {
  slug: 'mordreds_tale',
  title: "Mordred's Tale",
  author: 'Ben Garrard',
  hasEpub: true,
  status: 'available',
};

const builtInRemoteBook: BookEntry = {
  ...builtInBook,
  remoteEpubUrl: '/api/published-book-artifacts/file/mordreds_tale.epub',
};

describe('reader workspace state', () => {
  it('builds distinct storage keys for uploaded records', () => {
    expect(
      getReaderBookStorageKey({
        slug: 'mordreds_tale',
        sourceKind: 'built-in',
      }),
    ).toBe('mordreds_tale');

    expect(
      getReaderBookStorageKey({
        slug: 'uploaded-record-library-1',
        recordId: 'library-1',
        sourceKind: 'uploaded',
      }),
    ).toBe('uploaded-record:library-1');
  });

  it('resolves the library state when no source is active', () => {
    expect(resolveReaderWorkspaceState({})).toEqual({
      mode: 'library',
      title: 'Reader library',
      kicker: 'Built-in shelf',
      bookSlug: null,
      canDownload: false,
      viewerSource: null,
      localFileName: null,
    });
  });

  it('resolves built-in reading from the selected book', () => {
    expect(resolveReaderWorkspaceState({ initialBook: builtInBook })).toEqual({
      mode: 'built-in-reading',
      title: "Mordred's Tale",
      kicker: 'Built-in reading',
      bookSlug: 'mordreds_tale',
      canDownload: true,
      localFileName: null,
      viewerSource: {
        kind: 'built-in',
        epubUrl: '/books/mordreds_tale/book.epub',
        storageKey: 'mordreds_tale',
      },
    });
  });

  it('resolves built-in reading through a published remote EPUB URL when present', () => {
    expect(resolveReaderWorkspaceState({ initialBook: builtInRemoteBook })).toEqual({
      mode: 'built-in-reading',
      title: "Mordred's Tale",
      kicker: 'Built-in reading',
      bookSlug: 'mordreds_tale',
      canDownload: true,
      localFileName: null,
      viewerSource: {
        kind: 'built-in',
        epubUrl: '/api/published-book-artifacts/file/mordreds_tale.epub',
        storageKey: 'mordreds_tale',
      },
    });
  });

  it('resolves local reading while retaining the library-book context for return/download actions', () => {
    const state = resolveReaderWorkspaceState({
      initialBook: builtInBook,
      uploadedBook: {
        buffer: new ArrayBuffer(8),
        fileName: 'local-book.epub',
        storageKey: 'uploaded-epub-local-book',
        title: 'Local Book',
      },
    });

    expect(state.mode).toBe('local-reading');
    expect(state.bookSlug).toBe('mordreds_tale');
    expect(state.canDownload).toBe(true);
    expect(state.localFileName).toBe('local-book.epub');
    expect(state.viewerSource).not.toBeNull();
    expect(state.viewerSource!.kind).toBe('local');
  });

  it('resolves uploaded backend records through their remote EPUB URL and record storage key', () => {
    const state = resolveReaderWorkspaceState({
      initialBook: {
        slug: 'uploaded-record-library-1',
        recordId: 'library-1',
        title: 'Uploaded EPUB',
        hasEpub: true,
        sourceKind: 'uploaded',
        remoteEpubUrl: '/api/media/file/uploaded.epub',
      },
    });

    expect(state).toEqual({
      mode: 'built-in-reading',
      title: 'Uploaded EPUB',
      kicker: 'Saved upload',
      bookSlug: 'uploaded-record-library-1',
      canDownload: true,
      localFileName: null,
      viewerSource: {
        kind: 'built-in',
        epubUrl: '/api/media/file/uploaded.epub',
        storageKey: 'uploaded-record:library-1',
      },
    });
  });
});
