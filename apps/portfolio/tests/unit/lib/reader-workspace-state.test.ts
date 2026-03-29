import { resolveReaderWorkspaceState } from '@/lib/reader-workspace-state';
import type { BookEntry } from '@/lib/books';

const builtInBook: BookEntry = {
  slug: 'mordreds_tale',
  title: "Mordred's Tale",
  author: 'Ben Garrard',
  hasEpub: true,
  status: 'available',
};

describe('reader workspace state', () => {
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
    expect(state.viewerSource.kind).toBe('local');
  });
});
