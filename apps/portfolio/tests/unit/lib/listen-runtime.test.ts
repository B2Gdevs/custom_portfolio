import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getListenRuntimeBootstrap, getMusicTracks, getListenSearchDiscoveryItems } from '@/lib/listen-runtime';
import { runListenCatalogWorker } from '@/lib/listen/catalog-worker-runner';

vi.mock('@/lib/listen/catalog-worker-runner', () => ({
  runListenCatalogWorker: vi.fn(),
}));

describe('listen runtime helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('falls back to the file-authored catalog when the worker fails', async () => {
    vi.mocked(runListenCatalogWorker).mockRejectedValue(new Error('worker failed'));

    const bootstrap = await getListenRuntimeBootstrap('');

    expect(bootstrap.entries.length).toBeGreaterThan(0);
    expect(bootstrap.access.canViewPrivate).toBe(false);
  });

  it('derives public home tracks from the runtime catalog', async () => {
    vi.mocked(runListenCatalogWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        bootstrap: {
          access: { canViewPrivate: false },
          entries: [
            {
              slug: 'public-track',
              catalogKind: 'track',
              visibility: 'public',
              title: 'Public track',
              genre: 'Rock',
              mood: 'Bright',
              era: 'Now',
              description: 'Shown on the home page.',
              bandlabUrl: 'https://bandlab.com/public-track',
              embedUrl: 'https://bandlab.com/embed/public-track',
            },
            {
              slug: 'private-track',
              catalogKind: 'track',
              visibility: 'private',
              title: 'Private track',
              genre: 'Rock',
              mood: 'Hidden',
              era: 'Owner',
              description: 'Should not show.',
              bandlabUrl: 'https://bandlab.com/private-track',
              embedUrl: '',
            },
          ],
        },
      },
    } as never);

    const tracks = await getMusicTracks('');

    expect(tracks).toEqual([
      expect.objectContaining({
        slug: 'public-track',
        title: 'Public track',
      }),
    ]);
  });

  it('builds search items from the runtime catalog', async () => {
    vi.mocked(runListenCatalogWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        bootstrap: {
          access: { canViewPrivate: false },
          entries: [
            {
              slug: 'runtime-preset',
              catalogKind: 'preset',
              visibility: 'public',
              title: 'Runtime preset',
              genre: 'Preset',
              mood: 'Airy',
              era: 'Now',
              description: 'Searchable runtime row.',
              bandlabUrl: 'https://bandlab.com/runtime-preset',
              embedUrl: '',
            },
          ],
        },
      },
    } as never);

    const items = await getListenSearchDiscoveryItems('');

    expect(items).toEqual([
      expect.objectContaining({
        slug: 'runtime-preset',
        kind: 'listen',
      }),
    ]);
  });
});
