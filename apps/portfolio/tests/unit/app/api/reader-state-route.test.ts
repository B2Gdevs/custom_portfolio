import { GET, PUT } from '@/app/api/reader/state/route';
import { runReaderStateWorker } from '@/lib/reader/reading-state-worker-runner';

vi.mock('@/lib/reader/reading-state-worker-runner', () => ({
  runReaderStateWorker: vi.fn(),
}));

describe('/api/reader/state', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('validates required query params', async () => {
    const response = await GET(new Request('http://localhost/api/reader/state'));
    expect(response.status).toBe(400);
  });

  it('loads persisted state through the worker boundary', async () => {
    vi.mocked(runReaderStateWorker).mockResolvedValue({
      status: 200,
      body: { ok: true, state: null },
    });

    const response = await GET(
      new Request('http://localhost/api/reader/state?storageKey=mordreds_tale&contentHash=hash-1'),
    );

    expect(response.status).toBe(200);
    expect(runReaderStateWorker).toHaveBeenCalledWith({
      command: 'get',
      cookieHeader: '',
      storageKey: 'mordreds_tale',
      contentHash: 'hash-1',
    });
  });

  it('saves persisted state through the worker boundary', async () => {
    vi.mocked(runReaderStateWorker).mockResolvedValue({
      status: 200,
      body: { ok: true, state: null },
    });

    const response = await PUT(
      new Request('http://localhost/api/reader/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storageKey: 'mordreds_tale',
          contentHash: 'hash-1',
          bookSlug: 'mordreds_tale',
          sourceKind: 'built-in',
          location: 'epubcfi(/6/2[a])',
          progress: 0.33,
          annotations: [],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(runReaderStateWorker).toHaveBeenCalledWith({
      command: 'save',
      cookieHeader: '',
      input: {
        storageKey: 'mordreds_tale',
        contentHash: 'hash-1',
        bookSlug: 'mordreds_tale',
        sourceKind: 'built-in',
        location: 'epubcfi(/6/2[a])',
        progress: 0.33,
        annotations: [],
      },
    });
  });
});
