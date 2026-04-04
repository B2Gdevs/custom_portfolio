import { GET } from '@/app/api/reader/workspace/route';
import { getReaderWorkspaceBootstrap } from '@/lib/reader/workspace-bootstrap';

vi.mock('@/lib/reader/workspace-bootstrap', () => ({
  getReaderWorkspaceBootstrap: vi.fn(),
}));

vi.mock('@/lib/auth/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/session')>('@/lib/auth/session');
  return {
    ...actual,
    maybeAutoLoginForDevelopment: vi.fn().mockResolvedValue(null),
  };
});

describe('/api/reader/workspace', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns the workspace bootstrap payload', async () => {
    vi.mocked(getReaderWorkspaceBootstrap).mockResolvedValue({
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

    const response = await GET(new Request('http://localhost/api/reader/workspace'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      workspace: expect.any(Object),
    });
    expect(getReaderWorkspaceBootstrap).toHaveBeenCalled();
  });
});
