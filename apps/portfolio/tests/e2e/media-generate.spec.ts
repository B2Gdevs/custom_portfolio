import { expect, test } from '@playwright/test';

test.describe('Media generate API', () => {
  test('rejects an empty prompt with 400', async ({ request }) => {
    const response = await request.post('/api/media/generate', {
      data: { prompt: '' },
    });
    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'invalid_body',
    });
  });

  test('returns a structured upstream error when the API key is not valid for OpenAI', async ({ request }) => {
    const response = await request.post('/api/media/generate', {
      data: { prompt: 'Minimal flat icon, single color' },
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    const body = (await response.json()) as { ok: boolean; error?: string };
    expect(body.ok).toBe(false);
    expect(body.error).toBeTruthy();
  });
});

test.describe('OpenAI image E2E (opt-in, uses quota)', () => {
  test.skip(
    !process.env.OPENAI_IMAGE_E2E,
    'Set OPENAI_IMAGE_E2E=1 and a real OPENAI_API_KEY when you want to burn image quota in CI or locally.',
  );

  test('generates a PNG (b64) and accepts a second prompt as iteration', async ({ request }) => {
    const first = await request.post('/api/media/generate', {
      data: {
        prompt: 'Tiny flat book glyph, two-tone, no text, square composition',
        mediaSlot: 'app-cover:e2e',
      },
    });
    expect(first.ok()).toBeTruthy();
    const firstBody = (await first.json()) as { ok: boolean; b64Json?: string };
    expect(firstBody.ok).toBe(true);
    expect(firstBody.b64Json?.length ?? 0).toBeGreaterThan(200);

    const second = await request.post('/api/media/generate', {
      data: {
        prompt: 'Same book glyph but warmer palette, still no text',
        mediaSlot: 'app-cover:e2e',
      },
    });
    expect(second.ok()).toBeTruthy();
    const secondBody = (await second.json()) as { ok: boolean; b64Json?: string };
    expect(secondBody.ok).toBe(true);
    expect(secondBody.b64Json?.length ?? 0).toBeGreaterThan(200);
  });
});
