import { GET, POST } from '@/app/api/admin/rag/ingest/route';
import { requireBasicAdminAuth } from '@/lib/rag/basic-auth';

vi.mock('@/lib/rag/basic-auth', () => ({
  requireBasicAdminAuth: vi.fn(),
}));

describe('/api/admin/rag/ingest', () => {
  it('returns the auth response when authorization fails', async () => {
    vi.mocked(requireBasicAdminAuth).mockReturnValue(
      new Response('Authentication required.', { status: 401 }),
    );

    const response = await GET(new Request('http://localhost/api/admin/rag/ingest'));

    expect(response.status).toBe(401);
  });

  it('returns the deferred GET payload after auth succeeds', async () => {
    vi.mocked(requireBasicAdminAuth).mockReturnValue(null);

    const response = await GET(new Request('http://localhost/api/admin/rag/ingest'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'ingest_route_not_enabled',
    });
  });

  it('returns the deferred POST payload after auth succeeds', async () => {
    vi.mocked(requireBasicAdminAuth).mockReturnValue(null);

    const response = await POST(
      new Request('http://localhost/api/admin/rag/ingest', { method: 'POST' }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'ingest_route_not_enabled',
    });
  });
});
