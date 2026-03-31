import {
  saveReaderWorkspaceSettings,
  uploadReaderLibraryEpub,
} from '@/lib/reader/workspace-write';
import { getPayloadClient } from '@/lib/payload';
import { getSessionViewer } from '@/lib/auth/session';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getSessionViewer: vi.fn(),
}));

describe('reader workspace write service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns null when the viewer cannot edit settings', async () => {
    vi.mocked(getSessionViewer).mockResolvedValue({
      authenticated: false,
      autoLoggedIn: false,
      user: null,
    });

    await expect(
      saveReaderWorkspaceSettings({
        defaultWorkspaceView: 'library',
        preferPagedReader: true,
        showProgressBadges: true,
      }),
    ).resolves.toBeNull();
    expect(getPayloadClient).not.toHaveBeenCalled();
  });

  it('saves settings for an entitled owner viewer', async () => {
    vi.mocked(getSessionViewer).mockResolvedValue({
      authenticated: true,
      autoLoggedIn: false,
      user: {
        id: 'user-1',
        email: 'owner@magicborn.local',
        displayName: 'Ben Garrard',
        role: 'owner',
        tenant: { id: 'tenant-1', slug: 'magicborn-studios', name: 'Magicborn Studios' },
        entitlements: ['reader:edit'],
        canPersistReader: true,
        canEditReader: true,
        canUploadReaderAssets: true,
        canViewPrivateListen: true,
        canAccessAdmin: true,
      },
    });

    const payload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn().mockResolvedValue({
        id: 'settings-1',
        defaultWorkspaceView: 'continue-reading',
        preferPagedReader: false,
        showProgressBadges: false,
      }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    await expect(
      saveReaderWorkspaceSettings({
        defaultWorkspaceView: 'continue-reading',
        preferPagedReader: false,
        showProgressBadges: false,
      }),
    ).resolves.toEqual({
      defaultWorkspaceView: 'continue-reading',
      preferPagedReader: false,
      showProgressBadges: false,
    });

    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'reader-settings',
        data: expect.objectContaining({
          tenant: 'tenant-1',
          user: 'user-1',
          defaultWorkspaceView: 'continue-reading',
          preferPagedReader: false,
          showProgressBadges: false,
        }),
      }),
    );
  });

  it('creates a stored upload and library record for entitled viewers', async () => {
    vi.mocked(getSessionViewer).mockResolvedValue({
      authenticated: true,
      autoLoggedIn: false,
      user: {
        id: 'user-1',
        email: 'owner@magicborn.local',
        displayName: 'Ben Garrard',
        role: 'owner',
        tenant: { id: 'tenant-1', slug: 'magicborn-studios', name: 'Magicborn Studios' },
        entitlements: ['reader:upload'],
        canPersistReader: true,
        canEditReader: true,
        canUploadReaderAssets: true,
        canViewPrivateListen: true,
        canAccessAdmin: true,
      },
    });

    const payload = {
      create: vi
        .fn()
        .mockResolvedValueOnce({
          id: 'asset-1',
          filename: 'mordreds-tale.epub',
          url: 'https://storage.example/reader-library/mordreds-tale.epub',
        })
        .mockResolvedValueOnce({
          id: 'record-1',
          title: 'Mordred Upload',
          author: 'Ben Garrard',
          description: 'Private upload',
          epubUrl: '/api/reader-library-assets/file/mordreds-tale.epub',
          sourceKind: 'uploaded',
          sourceFileName: 'mordreds-tale.epub',
          visibility: 'private',
          updatedAt: '2026-03-30T00:00:00.000Z',
        }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    await expect(
      uploadReaderLibraryEpub({
        title: 'Mordred Upload',
        author: 'Ben Garrard',
        description: 'Private upload',
        visibility: 'private',
        sourceFileName: 'mordreds-tale.epub',
        filePath: 'C:/tmp/mordreds-tale.epub',
      }),
    ).resolves.toEqual({
      id: 'record-1',
      title: 'Mordred Upload',
      bookSlug: null,
      author: 'Ben Garrard',
      description: 'Private upload',
      coverImageUrl: null,
      epubUrl: '/api/reader-library-assets/file/mordreds-tale.epub',
      sourceKind: 'uploaded',
      sourceFileName: 'mordreds-tale.epub',
      visibility: 'private',
      updatedAt: '2026-03-30T00:00:00.000Z',
    });

    expect(payload.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'reader-library-assets',
        filePath: 'C:/tmp/mordreds-tale.epub',
      }),
    );
    expect(payload.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'reader-library-records',
        data: expect.objectContaining({
          title: 'Mordred Upload',
          epubUrl: '/api/reader-library-assets/file/mordreds-tale.epub',
          tenant: 'tenant-1',
          uploadedBy: 'user-1',
        }),
      }),
    );
  });
});
