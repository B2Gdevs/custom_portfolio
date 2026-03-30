import { GET } from '@/app/api/reader/workspace/route';
import { runReaderWorkspaceWorker } from '@/lib/reader/workspace-worker-runner';

vi.mock('@/lib/reader/workspace-worker-runner', () => ({
  runReaderWorkspaceWorker: vi.fn(),
}));

describe('/api/reader/workspace', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns the workspace bootstrap payload', async () => {
    vi.mocked(runReaderWorkspaceWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        workspace: {
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
        },
      },
    });

    const response = await GET(new Request('http://localhost/api/reader/workspace'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      workspace: expect.any(Object),
    });
    expect(runReaderWorkspaceWorker).toHaveBeenCalledWith({
      cookieHeader: '',
    });
  });
});
