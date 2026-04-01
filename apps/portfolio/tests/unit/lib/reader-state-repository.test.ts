import { getPayloadClient } from '@/lib/payload';
import { getReaderStateRepository } from '@/lib/reader/state-repository';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}));

describe('reader state repository', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads persisted state from the Payload collection', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            id: 'state-1',
            storageKey: 'mordreds_tale',
            contentHash: 'hash-1',
            bookSlug: 'mordreds_tale',
            sourceKind: 'built-in',
            location: 'epubcfi(/6/2[a])',
            progress: 0.2,
            annotations: [],
            updatedAt: '2026-03-30T00:00:00.000Z',
          },
        ],
      }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    const result = await getReaderStateRepository().get({
      tenantId: 'tenant-1',
      userId: 'user-1',
      storageKey: 'mordreds_tale',
      contentHash: 'hash-1',
    });

    expect(result).toEqual({
      storageKey: 'mordreds_tale',
      contentHash: 'hash-1',
      bookSlug: 'mordreds_tale',
      sourceKind: 'built-in',
      location: 'epubcfi(/6/2[a])',
      progress: 0.2,
      annotations: [],
      updatedAt: '2026-03-30T00:00:00.000Z',
    });
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reader-reading-states',
      }),
    );
  });

  it('creates persisted state when no row exists yet', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn().mockResolvedValue({
        id: 'state-1',
        storageKey: 'mordreds_tale',
        contentHash: 'hash-1',
        bookSlug: 'mordreds_tale',
        sourceKind: 'built-in',
        location: 'epubcfi(/6/2[a])',
        progress: 0.42,
        annotations: [],
        updatedAt: '2026-03-30T00:00:00.000Z',
      }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    const result = await getReaderStateRepository().save({
      tenantId: 'tenant-1',
      userId: 'user-1',
      storageKey: 'mordreds_tale',
      contentHash: 'hash-1',
      bookSlug: 'mordreds_tale',
      sourceKind: 'built-in',
      location: 'epubcfi(/6/2[a])',
      progress: 0.42,
      annotations: [],
    });

    expect(result).toEqual({
      storageKey: 'mordreds_tale',
      contentHash: 'hash-1',
      bookSlug: 'mordreds_tale',
      sourceKind: 'built-in',
      location: 'epubcfi(/6/2[a])',
      progress: 0.42,
      annotations: [],
      updatedAt: '2026-03-30T00:00:00.000Z',
    });
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reader-reading-states',
      }),
    );
  });
});
