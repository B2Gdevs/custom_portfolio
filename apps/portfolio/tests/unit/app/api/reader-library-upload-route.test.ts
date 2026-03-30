import { POST } from '@/app/api/reader/library/upload/route';
import { runReaderWorkspaceWriteWorker } from '@/lib/reader/workspace-write-worker-runner';

vi.mock('@/lib/reader/workspace-write-worker-runner', () => ({
  runReaderWorkspaceWriteWorker: vi.fn(),
}));

describe('/api/reader/library/upload', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rejects missing upload fields', async () => {
    const formData = new FormData();
    const response = await POST(
      new Request('http://localhost/api/reader/library/upload', {
        method: 'POST',
        body: formData,
      }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects non-epub uploads', async () => {
    const formData = new FormData();
    formData.set('title', 'Bad upload');
    formData.set('file', new File(['hi'], 'bad.txt', { type: 'text/plain' }));

    const response = await POST(
      new Request('http://localhost/api/reader/library/upload', {
        method: 'POST',
        body: formData,
      }),
    );

    expect(response.status).toBe(400);
  });

  it('sends validated uploads through the worker boundary', async () => {
    vi.mocked(runReaderWorkspaceWriteWorker).mockResolvedValue({
      status: 200,
      body: { ok: true, record: { id: 'record-1' } },
    });

    const formData = new FormData();
    formData.set('title', 'Uploaded EPUB');
    formData.set('author', 'Ben Garrard');
    formData.set('description', 'Private upload');
    formData.set('visibility', 'private');
    formData.set(
      'file',
      new File(['epub-bytes'], 'uploaded.epub', { type: 'application/epub+zip' }),
    );

    const response = await POST(
      new Request('http://localhost/api/reader/library/upload', {
        method: 'POST',
        body: formData,
      }),
    );

    expect(response.status).toBe(200);
    expect(runReaderWorkspaceWriteWorker).toHaveBeenCalledWith({
      command: 'upload-epub',
      cookieHeader: '',
      input: expect.objectContaining({
        title: 'Uploaded EPUB',
        author: 'Ben Garrard',
        description: 'Private upload',
        visibility: 'private',
        sourceFileName: 'uploaded.epub',
        filePath: expect.any(String),
      }),
    });
  });
});
