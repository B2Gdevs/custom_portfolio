vi.mock('server-only', () => ({}));

import { getListenCatalogBootstrap } from '@/lib/listen-catalog-bootstrap';
import { getSessionViewer } from '@/lib/auth/session';
import { getListenCatalogRepository } from '@/lib/listen/listen-catalog-repository';

vi.mock('@/lib/auth/session', () => ({
  getSessionViewer: vi.fn(),
}));

vi.mock('@/lib/listen/listen-catalog-repository', () => ({
  getListenCatalogRepository: vi.fn(),
}));

describe('listen catalog bootstrap', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns public rows for anonymous viewers', async () => {
    vi.mocked(getSessionViewer).mockResolvedValue({
      authenticated: false,
      autoLoggedIn: false,
      user: null,
    });

    const repository = {
      listCatalog: vi.fn().mockResolvedValue([
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
          extraTags: ['BandLab'],
        },
      ]),
    };
    vi.mocked(getListenCatalogRepository).mockReturnValue(repository);

    const result = await getListenCatalogBootstrap(new Request('http://localhost/listen'));

    expect(result.access.canViewPrivate).toBe(false);
    expect(result.entries.some((entry) => entry.slug === 'db-public-track')).toBe(true);
    expect(repository.listCatalog).toHaveBeenCalledWith({
      canViewPrivate: false,
    });
  });

  it('includes private rows for entitled viewers', async () => {
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

    const repository = {
      listCatalog: vi.fn().mockResolvedValue([
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
          extraTags: ['Private preset'],
        },
      ]),
    };
    vi.mocked(getListenCatalogRepository).mockReturnValue(repository);

    const result = await getListenCatalogBootstrap(new Request('http://localhost/listen'));

    expect(result.access.canViewPrivate).toBe(true);
    expect(result.entries.find((entry) => entry.slug === 'db-private-preset')).toEqual(
      expect.objectContaining({
        visibility: 'private',
        catalogKind: 'preset',
      }),
    );
    expect(repository.listCatalog).toHaveBeenCalledWith({
      canViewPrivate: true,
    });
  });
});
