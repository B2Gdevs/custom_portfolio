vi.mock('server-only', () => ({}));

import { getReaderWorkspaceBootstrap } from '@/lib/reader/workspace-bootstrap';
import { getSessionViewer } from '@/lib/auth/session';
import { getReaderWorkspaceRepository } from '@/lib/reader/workspace-repository';

vi.mock('@/lib/auth/session', () => ({
  getSessionViewer: vi.fn(),
}));

vi.mock('@/lib/reader/workspace-repository', () => ({
  getReaderWorkspaceRepository: vi.fn(),
}));

describe('reader workspace bootstrap', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns anonymous defaults without hitting the repository', async () => {
    vi.mocked(getSessionViewer).mockResolvedValue({
      authenticated: false,
      autoLoggedIn: false,
      user: null,
    });

    await expect(getReaderWorkspaceBootstrap()).resolves.toEqual({
      access: {
        authenticated: false,
        autoLoggedIn: false,
        isOwner: false,
        canPersist: false,
        canEdit: false,
        canUpload: false,
        uploadRequiresExplicitAction: true,
        localImportMode: 'local-only',
        storageMode: 'local-only',
      },
      settings: {
        defaultWorkspaceView: 'library',
        preferPagedReader: true,
        showProgressBadges: true,
      },
      libraryRecords: [],
    });

    expect(getReaderWorkspaceRepository).not.toHaveBeenCalled();
  });

  it('hydrates tenant records and settings through the repository', async () => {
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
        entitlements: ['reader:sync', 'reader:edit', 'reader:upload'],
        canPersistReader: true,
        canEditReader: true,
        canUploadReaderAssets: true,
        canViewPrivateListen: true,
        canAccessAdmin: true,
      },
    });

    const repository = {
      getWorkspace: vi.fn().mockResolvedValue({
        settings: {
          defaultWorkspaceView: 'continue-reading',
          preferPagedReader: false,
          showProgressBadges: true,
        },
        libraryRecords: [
          {
            id: 'library-1',
            title: 'Uploaded EPUB',
            bookSlug: null,
            author: null,
            description: null,
            coverImageUrl: null,
            epubUrl: null,
            sourceKind: 'uploaded',
            sourceFileName: 'uploaded.epub',
            visibility: 'private',
            updatedAt: '2026-03-30T00:00:00.000Z',
          },
        ],
      }),
    };
    vi.mocked(getReaderWorkspaceRepository).mockReturnValue(repository);

    await expect(getReaderWorkspaceBootstrap()).resolves.toEqual({
      access: {
        authenticated: true,
        autoLoggedIn: false,
        isOwner: true,
        canPersist: true,
        canEdit: true,
        canUpload: true,
        uploadRequiresExplicitAction: true,
        localImportMode: 'local-only',
        storageMode: 'hybrid',
      },
      settings: {
        defaultWorkspaceView: 'continue-reading',
        preferPagedReader: false,
        showProgressBadges: true,
      },
      libraryRecords: [
        {
          id: 'library-1',
          title: 'Uploaded EPUB',
          bookSlug: null,
          author: null,
          description: null,
          coverImageUrl: null,
          epubUrl: null,
          sourceKind: 'uploaded',
          sourceFileName: 'uploaded.epub',
          visibility: 'private',
          updatedAt: '2026-03-30T00:00:00.000Z',
        },
      ],
    });

    expect(repository.getWorkspace).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      userId: 'user-1',
    });
  });
});
