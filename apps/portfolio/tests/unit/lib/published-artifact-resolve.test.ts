import {
  buildPublishedArtifactS3KeyCandidates,
  canonicalFromLegacyHyphenFilename,
  getStaticPublicBuiltEpubPath,
  legacyHyphenSanitizedFilename,
  parsePublishedArtifactFilename,
} from '@/lib/payload/published-artifact-resolve';

describe('published-artifact-resolve', () => {
  it('parses mordreds_tale epub filename', () => {
    const r = parsePublishedArtifactFilename(
      'mordreds_tale--epub--cp-20260401-034207-b3d8df0.epub',
    );
    expect(r).toEqual({
      bookSlug: 'mordreds_tale',
      artifactKind: 'epub',
      versionTag: 'cp-20260401-034207-b3d8df0',
      extension: 'epub',
    });
  });

  it('parses planning-pack zip', () => {
    const r = parsePublishedArtifactFilename(
      'mordreds_tale--planning-pack--cp-20260401-035716-b3d8df0.zip',
    );
    expect(r?.artifactKind).toBe('planning-pack');
    expect(r?.extension).toBe('zip');
  });

  it('returns null for invalid names', () => {
    expect(parsePublishedArtifactFilename('nope.epub')).toBeNull();
    expect(parsePublishedArtifactFilename('')).toBeNull();
  });

  it('maps canonical epub filename to legacy single-hyphen before cp- version (Supabase/Payload drift)', () => {
    const canonical = 'mordreds_tale--epub--cp-20260401-034207-b3d8df0.epub';
    const legacy = 'mordreds_tale--epub-cp-20260401-034207-b3d8df0.epub';
    expect(legacyHyphenSanitizedFilename(canonical)).toBe(legacy);
    expect(canonicalFromLegacyHyphenFilename(legacy)).toBe(canonical);
    expect(legacyHyphenSanitizedFilename(legacy)).toBeNull();
  });

  it('includes legacy hyphen shape in S3 key candidates', () => {
    const keys = buildPublishedArtifactS3KeyCandidates(
      {
        filename: 'mordreds_tale--epub--cp-20260401-034207-b3d8df0.epub',
        prefix: 'published-book-artifacts',
      },
      'mordreds_tale--epub--cp-20260401-034207-b3d8df0.epub',
    );
    expect(keys).toContain(
      'published-book-artifacts/mordreds_tale--epub-cp-20260401-034207-b3d8df0.epub',
    );
  });

  it('resolves static built EPUB path under public/books', () => {
    const p = getStaticPublicBuiltEpubPath('mordreds_tale').replace(/\\/g, '/');
    expect(p).toContain('/public/books/mordreds_tale/book.epub');
  });

  it('builds S3 key candidates with prefix and collection slug fallback', () => {
    const keys = buildPublishedArtifactS3KeyCandidates(
      {
        filename: 'mordreds_tale--epub--v1.epub',
        prefix: 'published-book-artifacts',
      },
      'mordreds_tale--epub--v1.epub',
    );
    expect(keys).toContain('published-book-artifacts/mordreds_tale--epub--v1.epub');
    expect(keys.length).toBeGreaterThan(1);
  });
});
