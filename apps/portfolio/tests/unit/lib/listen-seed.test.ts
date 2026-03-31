import { beforeEach, describe, expect, it, vi } from 'vitest';
import { seedListenCatalog } from '@/lib/listen/seed';
import { getPayloadClient } from '@/lib/payload';
import { ensureOwnerSeed } from '@/lib/auth/seed';
import { getListenCatalog } from '@/lib/listen-catalog';

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}));

vi.mock('@/lib/auth/seed', () => ({
  ensureOwnerSeed: vi.fn(),
}));

vi.mock('@/lib/listen-catalog', () => ({
  getListenCatalog: vi.fn(),
}));

describe('seedListenCatalog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(ensureOwnerSeed).mockResolvedValue({
      createdTenant: false,
      createdUser: false,
      tenantId: 'tenant_1',
      tenantValue: 'tenant_1',
      userId: 'user_1',
    });
  });

  it('creates missing rows from the authored catalog', async () => {
    vi.mocked(getListenCatalog).mockReturnValue([
      {
        slug: 'public-track',
        catalogKind: 'track',
        visibility: 'public',
        title: 'Public track',
        genre: 'Rock',
        mood: 'Bright',
        era: 'Now',
        description: 'A seeded row.',
        bandlabUrl: 'https://bandlab.com/public-track',
        embedUrl: '',
        extraTags: ['BandLab'],
      },
    ]);

    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn().mockResolvedValue({ id: 'listen_1' }),
      update: vi.fn(),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    const result = await seedListenCatalog();

    expect(result).toEqual({
      created: 1,
      updated: 0,
      tenantId: 'tenant_1',
      total: 1,
    });
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'listen-catalog-records',
        data: expect.objectContaining({
          slug: 'public-track',
          tenant: 'tenant_1',
          extraTags: [{ tag: 'BandLab' }],
        }),
      }),
    );
  });

  it('updates existing rows when authored fields drift', async () => {
    vi.mocked(getListenCatalog).mockReturnValue([
      {
        slug: 'private-track',
        catalogKind: 'track',
        visibility: 'private',
        title: 'Private track',
        genre: 'Rock',
        mood: 'Hidden',
        era: 'Owner',
        description: 'Updated copy.',
        bandlabUrl: 'https://bandlab.com/private-track',
        embedUrl: '',
      },
    ]);

    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            id: 'listen_2',
            slug: 'private-track',
            title: 'Old title',
            catalogKind: 'track',
            visibility: 'private',
            genre: 'Rock',
            mood: 'Hidden',
            era: 'Owner',
            description: 'Old copy.',
            bandlabUrl: 'https://bandlab.com/private-track',
            embedUrl: '',
            published: true,
            tenant: 'tenant_1',
            extraTags: [],
          },
        ],
      }),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue({ id: 'listen_2' }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    const result = await seedListenCatalog();

    expect(result).toEqual({
      created: 0,
      updated: 1,
      tenantId: 'tenant_1',
      total: 1,
    });
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'listen-catalog-records',
        id: 'listen_2',
        data: expect.objectContaining({
          title: 'Private track',
          description: 'Updated copy.',
        }),
      }),
    );
  });
});
