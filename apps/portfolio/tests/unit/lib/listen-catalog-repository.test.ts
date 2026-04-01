vi.mock('server-only', () => ({}));

import { getPayloadClient } from '@/lib/payload';
import { getListenCatalogRepository } from '@/lib/listen/listen-catalog-repository';

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}));

describe('listen catalog repository', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('queries only public rows for anonymous catalog access', async () => {
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
        ],
      }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    const result = await getListenCatalogRepository().listCatalog({
      canViewPrivate: false,
    });

    expect(result.some((entry) => entry.slug === 'db-public-track')).toBe(true);
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

  it('omits the visibility filter for private-capable access', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            slug: 'db-private-track',
            catalogKind: 'track',
            visibility: 'private',
            title: 'DB Private Track',
            genre: 'Rock',
            mood: 'Hidden',
            era: 'Owner only',
            description: 'Visible to the owner.',
            bandlabUrl: 'https://www.bandlab.com/track/private',
            embedUrl: '',
            date: '2026-03-30',
            extraTags: [{ tag: 'Private' }],
          },
        ],
      }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    const result = await getListenCatalogRepository().listCatalog({
      canViewPrivate: true,
    });

    expect(result.find((entry) => entry.slug === 'db-private-track')).toEqual(
      expect.objectContaining({
        visibility: 'private',
      }),
    );
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'listen-catalog-records',
        where: expect.objectContaining({
          and: expect.not.arrayContaining([
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
});
