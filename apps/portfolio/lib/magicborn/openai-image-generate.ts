/**
 * OpenAI Images API — shared by `POST /api/media/generate` and the magicborn CLI.
 * @see https://platform.openai.com/docs/api-reference/images/create
 */
import type { MediaImageSize } from '@/lib/site-media';

export const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';

export function getOpenAiImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || 'dall-e-3';
}

interface OpenAIImageData {
  b64_json?: string;
  url?: string;
  revised_prompt?: string;
}

interface OpenAIImagesResponse {
  data?: OpenAIImageData[];
  error?: { message?: string };
  usage?: {
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
  };
}

export type OpenAiImageGenerateOk = {
  ok: true;
  model: string;
  b64Json: string;
  revisedPrompt?: string;
  /** Present when the upstream JSON includes a usage object (not all image responses do). */
  usage?: {
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
};

export type OpenAiImageGenerateErr = {
  ok: false;
  status: number;
  message: string;
};

export type OpenAiImageGenerateResult = OpenAiImageGenerateOk | OpenAiImageGenerateErr;

export type OpenAiImageGenerateInput = {
  apiKey: string;
  /** Final string sent as `prompt` to OpenAI (already composed). */
  prompt: string;
  size: MediaImageSize;
  /** Defaults from env `OPENAI_IMAGE_MODEL` or `dall-e-3`. */
  model?: string;
};

/**
 * Calls OpenAI Images `generations` with `response_format: b64_json`.
 */
export async function generateOpenAiImage(
  input: OpenAiImageGenerateInput,
): Promise<OpenAiImageGenerateResult> {
  const model = input.model?.trim() || getOpenAiImageModel();

  const response = await fetch(OPENAI_IMAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt: input.prompt,
      n: 1,
      size: input.size,
      response_format: 'b64_json',
    }),
  });

  const payload = (await response.json().catch(() => null)) as OpenAIImagesResponse | null;

  if (!response.ok) {
    const upstream =
      payload?.error?.message?.trim() ||
      (typeof payload === 'object' && payload && 'message' in payload
        ? String((payload as { message?: string }).message)
        : '') ||
      `OpenAI images request failed (${response.status})`;
    return {
      ok: false,
      status: response.status >= 400 && response.status < 600 ? response.status : 502,
      message: upstream,
    };
  }

  const first = payload?.data?.[0];
  const b64Json = first?.b64_json?.trim();
  if (!b64Json) {
    return {
      ok: false,
      status: 502,
      message: 'Image API returned no image data.',
    };
  }

  const usage = payload?.usage;
  const out: OpenAiImageGenerateOk = {
    ok: true,
    model,
    b64Json,
    ...(typeof first?.revised_prompt === 'string' && first.revised_prompt.trim()
      ? { revisedPrompt: first.revised_prompt.trim() }
      : {}),
    ...(usage &&
    (usage.total_tokens != null ||
      usage.input_tokens != null ||
      usage.output_tokens != null)
      ? {
          usage: {
            ...(usage.total_tokens != null ? { totalTokens: usage.total_tokens } : {}),
            ...(usage.input_tokens != null ? { inputTokens: usage.input_tokens } : {}),
            ...(usage.output_tokens != null ? { outputTokens: usage.output_tokens } : {}),
          },
        }
      : {}),
  };

  return out;
}
