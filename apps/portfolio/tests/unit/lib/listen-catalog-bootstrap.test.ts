vi.mock('server-only', () => ({}));

import { getListenCatalogBootstrap } from '@/lib/listen-catalog-bootstrap';
import { getPayloadClient } from '@/lib/payload';
import { getSessionViewer } from '@/lib/auth/session';

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getSessionViewer: vi.fn(),
}));

describe('listen catalog bootstrap', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns public DB rows for anonymous viewers and hides private ones', async () => {
    vi.mocked(getSessionViewer).mockResolvedValue({
      authenticated: false,
      autoLoggedIn: false,
      user: null,
    });

    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            slug: 'db-public-track',
            catalogKind: 'track',
            visibility: 'public',
            title: 'DB Public Track',
            genre: 'Rock',
            mood: 'Open',
            era: 'DB',
            description: 'Visible to everyone.',
            bandlabUrl: 'https://www.bandlab.com/track/public',
            embedUrl: 'https://www.bandlab.com/embed/?id=public',
            date: '2026-03-30',
            extraTags: [{ tag: 'BandLab' }],
          },
          {
            slug: 'db-private-track',
            catalogKind: 'track',
            visibility: 'private',
            title: 'DB Private Track',
            genre: 'Rock',
            mood: 'Hidden',
            era: 'Owner only',
            description: 'Should stay hidden.',
            bandlabUrl: 'https://www.bandlab.com/track/private',
            embedUrl: '',
            date: '2026-03-29',
            extraTags: [{ tag: 'Private' }],
          },
        ],
      }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    const result = await getListenCatalogBootstrap(new Request('http://localhost/listen'));

    expect(result.access.canViewPrivate).toBe(false);
    expect(result.entries.some((entry) => entry.slug === 'db-public-track')).toBe(true);
    expect(result.entries.some((entry) => entry.slug === 'db-private-track')).toBe(false);
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'listen-catalog-records',
        where: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({
              visibility: {
                equals: 'public',
              },
            }),
          ]),
        }),
      }),
    );
  });

  it('includes private DB rows for entitled viewers', async () => {
    vi.mocked(getSessionViewer).mockResolvedValue({
      authenticated: true,
      autoLoggedIn: false,
      user: {
        id: 'user-1',
        email: 'owner@magicborn.local',
        displayName: 'Ben Garrard',
        role: 'owner',
        tenant: {
          id: 'tenant-1',
          slug: 'magicborn-studios',
          name: 'Magicborn Studios',
        },
        entitlements: ['listen:private'],
        canPersistReader: false,
        canEditReader: false,
        canUploadReaderAssets: false,
        canViewPrivateListen: true,
        canAccessAdmin: false,
      },
    });

    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            slug: 'db-private-preset',
            catalogKind: 'preset',
            visibility: 'private',
            title: 'DB Private Preset',
            genre: 'Preset',
            mood: 'Hidden',
            era: 'Owner only',
            description: 'Visible to the owner.',
            bandlabUrl: 'https://www.bandlab.com/effect-presets/private',
            embedUrl: '',
            date: '2026-03-30',
            extraTags: [{ tag: 'Private preset' }],
          },
        ],
      }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    const result = await getListenCatalogBootstrap(new Request('http://localhost/listen'));

    expect(result.access.canViewPrivate).toBe(true);
    expect(result.entries.find((entry) => entry.slug === 'db-private-preset')).toEqual(
      expect.objectContaining({
        visibility: 'private',
        catalogKind: 'preset',
      }),
    );
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'listen-catalog-records',
        where: expect.objectContaining({
          and: expect.arrayContaining([
            expect.objectContaining({
              published: {
                equals: true,
              },
            }),
          ]),
        }),
      }),
    );
  });
});
