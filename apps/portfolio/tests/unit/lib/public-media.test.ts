import {
  replacePublicMediaReferencesInSourceFromManifest,
  resolvePublicMediaRecordFromManifest,
  resolvePublicMediaUrlFromManifest,
  type PublicMediaManifest,
} from '@/lib/public-media';

describe('public media helpers', () => {
  const manifest: PublicMediaManifest = {
    site: [
      {
        scope: 'site',
        sourcePath: '/images/projects/colorfull/colorfull_site.png',
        remoteUrl: '/api/site-media-assets/file/site-media--images--projects--colorfull--colorfull-site--abc123.png',
        collectionSlug: 'site-media-assets',
        title: 'colorfull site',
        mediaKind: 'image',
      },
    ],
    listen: [
      {
        scope: 'listen',
        sourcePath: '/images/listen/demo-artwork.png',
        remoteUrl: '/api/listen-media-assets/file/listen-media--images--listen--demo-artwork--abc123.png',
        collectionSlug: 'listen-media-assets',
        title: 'demo artwork',
        mediaKind: 'image',
        listenSlug: 'demo-track',
        mediaRole: 'artwork',
      },
    ],
  };

  it('resolves published media URLs from the manifest', () => {
    expect(
      resolvePublicMediaUrlFromManifest(
        manifest,
        '/images/projects/colorfull/colorfull_site.png',
      ),
    ).toBe(
      '/api/site-media-assets/file/site-media--images--projects--colorfull--colorfull-site--abc123.png',
    );

    expect(resolvePublicMediaUrlFromManifest(manifest, '/docs/global/requirements')).toBe(
      '/docs/global/requirements',
    );
  });

  it('rewrites local media paths inside authored content', () => {
    const source = [
      '![Hero](/images/projects/colorfull/colorfull_site.png)',
      '<img src="/images/projects/colorfull/colorfull_site.png" alt="Hero" />',
    ].join('\n');

    const next = replacePublicMediaReferencesInSourceFromManifest(manifest, source);

    expect(next).toContain('/api/site-media-assets/file/site-media--images--projects--colorfull--colorfull-site--abc123.png');
    expect(next).not.toContain('/images/projects/colorfull/colorfull_site.png');
  });

  it('rewrites media object fields that feed project sidebars and cards', () => {
    const next = resolvePublicMediaRecordFromManifest(manifest, {
      src: '/images/projects/colorfull/colorfull_site.png',
      thumbnail: '/images/projects/colorfull/colorfull_site.png',
      title: 'Colorfull',
    });

    expect(next).toMatchObject({
      src: '/api/site-media-assets/file/site-media--images--projects--colorfull--colorfull-site--abc123.png',
      thumbnail:
        '/api/site-media-assets/file/site-media--images--projects--colorfull--colorfull-site--abc123.png',
      title: 'Colorfull',
    });
  });
});
