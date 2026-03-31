import {
  buildDefaultArtifactVersionTag,
  buildPublishedBookArtifactFilename,
  getPublishedBookDownloadUrl,
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
  });
});
