import { createLogger } from '@/lib/logging';
import type { MediaGenerateRequestBody, MediaGenerateResponse, MediaGenerateSuccess } from '@/lib/site-media';
import { z } from 'zod';

const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';
const MEDIA_LOGGER = createLogger('media.api');

const BodySchema = z.object({
  prompt: z.string().trim().min(1).max(4000),
  mediaSlot: z.string().trim().min(1).max(240).optional(),
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional(),
});

function jsonResponse(body: MediaGenerateResponse, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

function getImageModel(): string {
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
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const responseHeaders = { 'x-portfolio-request-id': requestId };
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    MEDIA_LOGGER.warn('media generate rejected: missing OPENAI_API_KEY', { requestId });
    return jsonResponse(
      {
        ok: false,
        error: 'media_unconfigured',
        message: 'Image generation is not configured (missing OPENAI_API_KEY).',
      },
      503,
      responseHeaders,
    );
  }

  const raw = (await request.json().catch(() => null)) as MediaGenerateRequestBody | null;
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        error: 'invalid_body',
        message: 'Request body must include a non-empty prompt (max 4000 characters).',
      },
      400,
      responseHeaders,
    );
  }

  const { prompt, mediaSlot, size } = parsed.data;
  const model = getImageModel();
  const imageSize = size ?? '1024x1024';

  MEDIA_LOGGER.info('media generate started', {
    requestId,
    model,
    imageSize,
    hasMediaSlot: Boolean(mediaSlot),
    promptChars: prompt.length,
  });

  try {
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size: imageSize,
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
      MEDIA_LOGGER.error('media generate upstream error', {
        requestId,
        status: response.status,
        upstreamPreview: upstream.slice(0, 200),
      });
      return jsonResponse(
        {
          ok: false,
          error: 'upstream_error',
          message: upstream,
        },
        response.status >= 400 && response.status < 600 ? response.status : 502,
        responseHeaders,
      );
    }

    const first = payload?.data?.[0];
    const b64Json = first?.b64_json?.trim();
    if (!b64Json) {
      MEDIA_LOGGER.error('media generate missing b64 payload', { requestId });
      return jsonResponse(
        {
          ok: false,
          error: 'invalid_upstream_response',
          message: 'Image API returned no image data.',
        },
        502,
        responseHeaders,
      );
    }

    const body: MediaGenerateSuccess = {
      ok: true,
      model,
      b64Json,
      ...(typeof first?.revised_prompt === 'string' && first.revised_prompt.trim()
        ? { revisedPrompt: first.revised_prompt.trim() }
        : {}),
      ...(mediaSlot ? { mediaSlot } : {}),
    };

    MEDIA_LOGGER.info('media generate completed', { requestId, model });
    return jsonResponse(body, 200, responseHeaders);
  } catch (error) {
    MEDIA_LOGGER.error('media generate threw', { requestId, error });
    return jsonResponse(
      {
        ok: false,
        error: 'media_request_failed',
        message: 'The image request failed before a response was received.',
      },
      500,
      responseHeaders,
    );
  }
}
