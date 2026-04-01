import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateOpenAiImage } from '@/lib/magicborn/openai-image-generate';

describe('generateOpenAiImage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns image payload when OpenAI succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ b64_json: 'aGVsbG8=', revised_prompt: 'refined' }],
          usage: { total_tokens: 42 },
        }),
      }),
    );

    const result = await generateOpenAiImage({
      apiKey: 'sk-test',
      prompt: 'A red circle',
      size: '1024x1024',
      model: 'dall-e-3',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.b64Json).toBe('aGVsbG8=');
    expect(result.revisedPrompt).toBe('refined');
    expect(result.usage?.totalTokens).toBe(42);
  });

  it('returns error when upstream fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'bad prompt' } }),
      }),
    );

    const result = await generateOpenAiImage({
      apiKey: 'sk-test',
      prompt: 'x',
      size: '1024x1024',
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(400);
    expect(result.message).toContain('bad prompt');
  });
});
