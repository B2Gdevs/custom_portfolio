import {
  mapWorkspaceLibraryRecordsToReaderBooks,
  resolveInitialReaderBook,
} from '@/lib/reader/workspace-library';
describe('reader workspace library helpers', () => {
  it('maps backend library records into reader shelf entries', () => {
    expect(
      mapWorkspaceLibraryRecordsToReaderBooks([
        {
          id: 'library-1',
          title: 'Uploaded EPUB',
          bookSlug: null,
          author: 'Ben Garrard',
          description: 'Private upload',
          coverImageUrl: '/covers/uploaded.png',
          epubUrl: '/api/media/file/uploaded.epub',
          sourceKind: 'uploaded',
          sourceFileName: 'uploaded.epub',
          visibility: 'private',
          updatedAt: '2026-03-30T00:00:00.000Z',
        },
      ]),
    ).toEqual([
      {
        slug: 'uploaded-record-library-1',
        recordId: 'library-1',
        title: 'Uploaded EPUB',
        author: 'Ben Garrard',
        description: 'Private upload',
        coverImage: '/covers/uploaded.png',
        remoteEpubUrl: '/api/media/file/uploaded.epub',
        sourceKind: 'uploaded',
        visibility: 'private',
        genres: ['Private upload'],
        hasEpub: true,
      },
    ]);
  });

  it('resolves an uploaded initial reader target from the record query id', () => {
    const uploadedBooks = mapWorkspaceLibraryRecordsToReaderBooks([
      {
        id: 'library-1',
        title: 'Uploaded EPUB',
        bookSlug: null,
        author: null,
        description: null,
        coverImageUrl: null,
        epubUrl: '/api/media/file/uploaded.epub',
        sourceKind: 'uploaded',
        sourceFileName: 'uploaded.epub',
        visibility: 'private',
        updatedAt: null,
      },
    ]);

    expect(
      resolveInitialReaderBook({
        uploadedBooks,
        initialRecordId: 'library-1',
      }),
    ).toEqual(uploadedBooks[0]);
  });
});
