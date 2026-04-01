import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getSessionViewer = vi.fn();

vi.mock('@/lib/auth/session', () => ({
  getSessionViewer: (...args: unknown[]) => getSessionViewer(...args),
}));

const adminViewer = {
  authenticated: true,
  autoLoggedIn: false,
  user: {
    id: 'u1',
    email: 'owner@test',
    displayName: 'Owner',
    avatarUrl: null,
    role: 'owner',
    tenant: { id: 't1', slug: 't', name: 'T' },
    entitlements: ['admin:access'],
    canPersistReader: true,
    canEditReader: true,
    canUploadReaderAssets: true,
    canViewPrivateListen: true,
    canAccessAdmin: true,
  },
};

const memberViewer = {
  authenticated: true,
  autoLoggedIn: false,
  user: {
    id: 'u2',
    email: 'member@test',
    displayName: 'Member',
    avatarUrl: null,
    role: 'member',
    tenant: { id: 't1', slug: 't', name: 'T' },
    entitlements: [],
    canPersistReader: false,
    canEditReader: false,
    canUploadReaderAssets: false,
    canViewPrivateListen: false,
    canAccessAdmin: false,
  },
};

describe('POST /api/media/generate', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    getSessionViewer.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    getSessionViewer.mockResolvedValue({
      authenticated: false,
      autoLoggedIn: false,
      user: null,
    });
    const { POST } = await import('@/app/api/media/generate/route');
    const res = await POST(
      new Request('http://test/api/media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A red circle on white' }),
      }),
    );
    expect(res.status).toBe(401);
    const body = (await res.json()) as { ok: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBe('media_auth_required');
  });

  it('returns 403 when authenticated without admin access', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    getSessionViewer.mockResolvedValue(memberViewer);
    const { POST } = await import('@/app/api/media/generate/route');
    const res = await POST(
      new Request('http://test/api/media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A red circle on white' }),
      }),
    );
    expect(res.status).toBe(403);
    const body = (await res.json()) as { ok: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBe('media_access_required');
  });

  it('returns 503 when OPENAI_API_KEY is missing', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    getSessionViewer.mockResolvedValue(adminViewer);
    const { POST } = await import('@/app/api/media/generate/route');
    const res = await POST(
      new Request('http://test/api/media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A red circle on white' }),
      }),
    );
    expect(res.status).toBe(503);
    const body = (await res.json()) as { ok: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBe('media_unconfigured');
  });

  it('returns 400 for an empty prompt', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    getSessionViewer.mockResolvedValue(adminViewer);
    const { POST } = await import('@/app/api/media/generate/route');
    const res = await POST(
      new Request('http://test/api/media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: '   ' }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('returns image payload when OpenAI succeeds', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    getSessionViewer.mockResolvedValue(adminViewer);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ b64_json: 'aGVsbG8=', revised_prompt: 'refined' }],
        }),
      }),
    );

    const { POST } = await import('@/app/api/media/generate/route');
    const res = await POST(
      new Request('http://test/api/media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Book icon', mediaSlot: 'app-cover:reader' }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean;
      b64Json?: string;
      mediaSlot?: string;
      revisedPrompt?: string;
    };
    expect(body.ok).toBe(true);
    expect(body.b64Json).toBe('aGVsbG8=');
    expect(body.mediaSlot).toBe('app-cover:reader');
    expect(body.revisedPrompt).toBe('refined');
  });

  it('prepends Magicborn style when useMagicbornStyle is true', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    getSessionViewer.mockResolvedValue(adminViewer);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ b64_json: 'aGVsbG8=' }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { POST } = await import('@/app/api/media/generate/route');
    const res = await POST(
      new Request('http://test/api/media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Extra mood: rain',
          useMagicbornStyle: true,
          sceneKey: 'mordreds-tale:ash-court-tension',
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const openAiBody = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body) as {
      prompt: string;
    };
    expect(openAiBody.prompt).toContain('Magicborn Studios');
    expect(openAiBody.prompt).toContain('council chamber');
    expect(openAiBody.prompt).toContain('rain');
  });
});
