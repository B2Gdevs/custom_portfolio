import {
  buildPublishedArtifactS3KeyCandidates,
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
