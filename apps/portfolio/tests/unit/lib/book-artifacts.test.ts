import {
  buildDefaultArtifactVersionTag,
  buildPublishedBookArtifactFilename,
  getPublishedBookDownloadUrl,
  normalizePlanningSourcePaths,
  shouldReuseCurrentPublishedBookArtifact,
  shouldUpdatePublishedBookArtifact,
  preservePublishedBookManifestFields,
  sanitizeArtifactVersionTag,
} from '@/lib/book-artifacts';

describe('book artifacts helpers', () => {
  it('sanitizes explicit version tags', () => {
    expect(sanitizeArtifactVersionTag(' CP 01 / Rune Path ')).toBe('cp-01-rune-path');
  });

  it('builds a stable default checkpoint tag', () => {
    expect(
      buildDefaultArtifactVersionTag({
        now: new Date('2026-03-30T12:34:56.000Z'),
        shortCommit: 'AbC123',
      }),
    ).toBe('cp-20260330-123456-abc123');
  });

  it('builds unique published artifact filenames', () => {
    expect(
      buildPublishedBookArtifactFilename('magicborn_rune_path', 'planning-pack', 'cp01', 'zip'),
    ).toBe('magicborn_rune_path--planning-pack--cp01.zip');
  });

  it('normalizes planning source paths before comparison', () => {
    expect(
      normalizePlanningSourcePaths(['books/mordreds_tale/planning', 'books/global/planning', '', null]),
    ).toEqual(['books/global/planning', 'books/mordreds_tale/planning']);
  });

  it('reuses current artifacts when the checksum matches', () => {
    expect(
      shouldReuseCurrentPublishedBookArtifact(
        {
          title: 'Mordred EPUB',
          bookSlug: 'mordreds_tale',
          artifactKind: 'epub',
          versionTag: 'cp-20260330-123456-abc123',
          isCurrent: true,
          checksumSha256: 'same-bytes',
          fileSizeBytes: 1024,
          sourceCommit: 'abc123',
          sourcePath: 'public/books/mordreds_tale/book.epub',
          planningSourcePaths: [],
        },
        'same-bytes',
      ),
    ).toBe(true);
  });

  it('detects published artifact metadata drift', () => {
    expect(
      shouldUpdatePublishedBookArtifact(
        {
          title: 'Mordred EPUB',
          bookSlug: 'mordreds_tale',
          artifactKind: 'epub',
          versionTag: 'cp01',
          isCurrent: true,
          checksumSha256: 'same-bytes',
          fileSizeBytes: 1024,
          sourceCommit: 'abc123',
          sourcePath: 'public/books/mordreds_tale/book.epub',
          planningSourcePaths: [],
        },
        {
          title: 'Mordred EPUB',
          bookSlug: 'mordreds_tale',
          artifactKind: 'epub',
          versionTag: 'cp01',
          isCurrent: true,
          checksumSha256: 'same-bytes',
          fileSizeBytes: 1024,
          sourceCommit: 'def456',
          sourcePath: 'public/books/mordreds_tale/book.epub',
          planningSourcePaths: [],
        },
      ),
    ).toBe(true);
  });

  it('preserves previously published manifest fields across local rebuilds', () => {
    expect(
      preservePublishedBookManifestFields(
        {
          remoteEpubUrl: undefined,
          planningPackUrl: undefined,
          artifactVersion: null,
        },
        {
          remoteEpubUrl: '/api/published-book-artifacts/file/rune.epub',
          planningPackUrl: '/api/published-book-artifacts/file/rune.zip',
          artifactVersion: 'cp01',
        },
      ),
    ).toEqual({
      remoteEpubUrl: '/api/published-book-artifacts/file/rune.epub',
      planningPackUrl: '/api/published-book-artifacts/file/rune.zip',
      artifactVersion: 'cp01',
    });
  });

  it('prefers published remote download URLs when present', () => {
    expect(
      getPublishedBookDownloadUrl({
        slug: 'magicborn_rune_path',
        remoteEpubUrl: '/api/published-book-artifacts/file/rune.epub',
      }),
    ).toBe('/api/published-book-artifacts/file/rune.epub');

    expect(
      getPublishedBookDownloadUrl({
        slug: 'magicborn_rune_path',
      }),
    ).toBe('/books/magicborn_rune_path/book.epub');

    expect(
      getPublishedBookDownloadUrl({
        slug: 'magicborn_rune_path',
        disableStaticFallback: true,
      }),
    ).toBe(null);
  });
});
