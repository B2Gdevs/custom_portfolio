import { describe, expect, it, vi, beforeEach } from 'vitest';
import { buildListenPageRows } from '@/lib/listen-page-data';
import { runListenCatalogWorker } from '@/lib/listen/catalog-worker-runner';

vi.mock('@/lib/listen/catalog-worker-runner', () => ({
  runListenCatalogWorker: vi.fn(),
}));

function createCookieStore(values: Record<string, string> = {}) {
  return {
    get(name: string) {
      const value = values[name];
      return value ? { value } : undefined;
    },
  };
}

describe('buildListenPageRows', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('hides private rows for anonymous viewers but keeps public lock-group rows', async () => {
    vi.mocked(runListenCatalogWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        bootstrap: {
          access: { canViewPrivate: false },
          entries: [
            {
              slug: 'public-preview',
              catalogKind: 'track',
              visibility: 'public',
              title: 'Public preview',
              genre: 'Rock',
              mood: 'Preview',
              era: 'Public',
              description: 'Still uses a lock group.',
              bandlabUrl: 'https://bandlab.com/public-preview',
              embedUrl: '',
              lockGroup: 'preview',
            },
            {
              slug: 'private-owner-row',
              catalogKind: 'preset',
              visibility: 'private',
              title: 'Private owner row',
              genre: 'Preset',
              mood: 'Internal',
              era: 'Owner',
              description: 'Should be hidden.',
              bandlabUrl: 'https://bandlab.com/private-owner-row',
              embedUrl: '',
            },
          ],
        },
      },
    } as never);

    const rows = await buildListenPageRows({
      cookieStore: createCookieStore(),
      cookieHeader: '',
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        locked: true,
        lockGroup: 'preview',
      }),
    );
    expect(rows.some((row) => row.item.slug === 'private-owner-row')).toBe(false);
  });

  it('includes private rows for entitled viewers without exposing a lock form', async () => {
    vi.mocked(runListenCatalogWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        bootstrap: {
          access: { canViewPrivate: true },
          entries: [
            {
              slug: 'private-owner-row',
              catalogKind: 'preset',
              visibility: 'private',
              title: 'Private owner row',
              genre: 'Preset',
              mood: 'Internal',
              era: 'Owner',
              description: 'Should be visible.',
              bandlabUrl: 'https://bandlab.com/private-owner-row',
              embedUrl: '',
            },
          ],
        },
      },
    } as never);

    const rows = await buildListenPageRows({
      cookieStore: createCookieStore(),
      cookieHeader: 'payload-token=owner',
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        locked: false,
        lockGroup: null,
        bandlabUrl: 'https://bandlab.com/private-owner-row',
      }),
    );
  });
});
