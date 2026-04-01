import {
  normalizeListenMediaPublishComparable,
  normalizeSiteMediaPublishComparable,
  shouldUpdatePublishedListenMedia,
  shouldUpdatePublishedSiteMedia,
} from '@/lib/payload/media-publish';

describe('media publish helpers', () => {
  it('skips site media updates when checksum and metadata match', () => {
    const desired = normalizeSiteMediaPublishComparable({
      title: 'avatar',
      sourcePath: '/images/avatar.jpg',
      contentScope: 'home',
      mediaKind: 'image',
      isCurrent: true,
      checksumSha256: 'abc123',
      fileSizeBytes: 1204,
    });

    expect(desired).not.toBeNull();
    expect(
      shouldUpdatePublishedSiteMedia(
        {
          title: 'avatar',
          sourcePath: '/images/avatar.jpg',
          contentScope: 'home',
          mediaKind: 'image',
          isCurrent: true,
          checksumSha256: 'abc123',
          fileSizeBytes: 1204,
        },
        desired!,
      ),
    ).toBe(false);
  });

  it('detects listen media drift when the role changes', () => {
    const desired = normalizeListenMediaPublishComparable({
      title: 'Public track artwork',
      listenSlug: 'public-track',
      sourcePath: '/images/listen/public-track.png',
      mediaRole: 'artwork',
      mediaKind: 'image',
      isCurrent: true,
      checksumSha256: 'xyz789',
      fileSizeBytes: 2048,
    });

    expect(desired).not.toBeNull();
    expect(
      shouldUpdatePublishedListenMedia(
        {
          title: 'Public track artwork',
          listenSlug: 'public-track',
          sourcePath: '/images/listen/public-track.png',
          mediaRole: 'other',
          mediaKind: 'image',
          isCurrent: true,
          checksumSha256: 'xyz789',
          fileSizeBytes: 2048,
        },
        desired!,
      ),
    ).toBe(true);
  });
});
