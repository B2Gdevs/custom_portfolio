import { PUT } from '@/app/api/reader/workspace/settings/route';
import { runReaderWorkspaceWriteWorker } from '@/lib/reader/workspace-write-worker-runner';

vi.mock('@/lib/reader/workspace-write-worker-runner', () => ({
  runReaderWorkspaceWriteWorker: vi.fn(),
}));

describe('/api/reader/workspace/settings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('saves settings through the worker boundary', async () => {
    vi.mocked(runReaderWorkspaceWriteWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        settings: {
          defaultWorkspaceView: 'continue-reading',
          preferPagedReader: false,
          showProgressBadges: true,
        },
      },
    });

    const response = await PUT(
      new Request('http://localhost/api/reader/workspace/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultWorkspaceView: 'continue-reading',
          preferPagedReader: false,
          showProgressBadges: true,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(runReaderWorkspaceWriteWorker).toHaveBeenCalledWith({
      command: 'save-settings',
      cookieHeader: '',
      input: {
        defaultWorkspaceView: 'continue-reading',
        preferPagedReader: false,
        showProgressBadges: true,
      },
    });
  });
});
