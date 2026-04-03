import { POST } from '@/app/api/copilot/create/route';

const authMocks = vi.hoisted(() => ({
  isCopilotToolsAuthorized: vi.fn(() => true),
}));

const formMocks = vi.hoisted(() => ({
  buildCopilotFormDescriptor: vi.fn(),
}));

const payloadMocks = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock('@/lib/copilot/copilot-tools-auth', () => ({
  isCopilotToolsAuthorized: authMocks.isCopilotToolsAuthorized,
}));

vi.mock('@/lib/copilot/form-descriptor', () => ({
  buildCopilotFormDescriptor: formMocks.buildCopilotFormDescriptor,
}));

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(async () => ({ create: payloadMocks.create })),
}));

describe('POST /api/copilot/create', () => {
  beforeEach(() => {
    authMocks.isCopilotToolsAuthorized.mockReturnValue(true);
    formMocks.buildCopilotFormDescriptor.mockReset();
    payloadMocks.create.mockReset();
  });

  it('returns 403 when not authorized', async () => {
    authMocks.isCopilotToolsAuthorized.mockReturnValue(false);
    const res = await POST(
      new Request('http://localhost/api/copilot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, collection: 'project-records', data: { slug: 'x' } }),
      }),
    );
    expect(res.status).toBe(403);
  });

  it('returns 400 when confirm is false', async () => {
    const res = await POST(
      new Request('http://localhost/api/copilot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: false, collection: 'project-records', data: { slug: 'x' } }),
      }),
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: 'confirm_required' });
  });

  it('returns 400 when collection is not mutate-allowlisted', async () => {
    const res = await POST(
      new Request('http://localhost/api/copilot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, collection: 'resume-records', data: { slug: 'x' } }),
      }),
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: 'collection_not_allowed' });
  });

  it('creates when descriptor and sanitized data are valid', async () => {
    formMocks.buildCopilotFormDescriptor.mockReturnValue({
      collection: 'project-records',
      intent: 'create',
      title: 'Projects',
      fields: [{ name: 'slug', kind: 'text', label: 'Slug', required: true }],
    });
    payloadMocks.create.mockResolvedValue({ id: 'doc-1' });

    const res = await POST(
      new Request('http://localhost/api/copilot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: true,
          collection: 'project-records',
          data: { slug: 'my-demo' },
        }),
      }),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, id: 'doc-1' });
    expect(payloadMocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'project-records',
        data: { slug: 'my-demo' },
        overrideAccess: true,
      }),
    );
  });
});
