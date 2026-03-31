import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('POST /api/media/generate', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns 503 when OPENAI_API_KEY is missing', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
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
});
