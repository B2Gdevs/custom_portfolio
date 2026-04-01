import {
  getReaderPersistedState,
  saveReaderPersistedState,
} from '@/lib/reader/reading-state';
import { getSessionViewer } from '@/lib/auth/session';
import { getReaderStateRepository } from '@/lib/reader/state-repository';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/auth/session', () => ({
  getSessionViewer: vi.fn(),
}));

vi.mock('@/lib/reader/state-repository', () => ({
  getReaderStateRepository: vi.fn(),
}));

describe('reader reading state service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns null when the viewer cannot persist', async () => {
    vi.mocked(getSessionViewer).mockResolvedValue({
      authenticated: false,
      autoLoggedIn: false,
      user: null,
    });

    await expect(
      getReaderPersistedState({
        storageKey: 'mordreds_tale',
        contentHash: 'hash-1',
      }),
    ).resolves.toBeNull();
    expect(getReaderStateRepository).not.toHaveBeenCalled();
  });

  it('saves built-in reading state through the repository for entitled viewers', async () => {
    vi.mocked(getSessionViewer).mockResolvedValue({
      authenticated: true,
      autoLoggedIn: false,
      user: {
        id: 'user-1',
        email: 'owner@magicborn.local',
        displayName: 'Ben Garrard',
        role: 'owner',
        tenant: { id: 'tenant-1', slug: 'magicborn-studios', name: 'Magicborn Studios' },
        entitlements: ['reader:sync'],
        canPersistReader: true,
        canEditReader: true,
        canUploadReaderAssets: true,
        canViewPrivateListen: true,
        canAccessAdmin: true,
      },
    });

    const repository = {
      get: vi.fn(),
      save: vi.fn().mockResolvedValue({
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
    vi.mocked(getReaderStateRepository).mockReturnValue(repository);

    await expect(
      saveReaderPersistedState({
        storageKey: 'mordreds_tale',
        contentHash: 'hash-1',
        bookSlug: 'mordreds_tale',
        sourceKind: 'built-in',
        location: 'epubcfi(/6/2[a])',
        progress: 0.42,
        annotations: [],
      }),
    ).resolves.toEqual({
      storageKey: 'mordreds_tale',
      contentHash: 'hash-1',
      bookSlug: 'mordreds_tale',
      sourceKind: 'built-in',
      location: 'epubcfi(/6/2[a])',
      progress: 0.42,
      annotations: [],
      updatedAt: '2026-03-30T00:00:00.000Z',
    });

    expect(repository.save).toHaveBeenCalledWith({
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
  });
});
