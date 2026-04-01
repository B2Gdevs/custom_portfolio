import { canGeneratePortfolioMedia } from '@/lib/auth/media-generate-access';
import { getSessionViewer } from '@/lib/auth/session';
import { composeMagicbornImagePrompt } from '@/lib/magicborn-prompts/compose-image-prompt';
import { generateOpenAiImage, getOpenAiImageModel } from '@/lib/magicborn/openai-image-generate';
import { createLogger } from '@/lib/logging';
import type { MediaGenerateRequestBody, MediaGenerateResponse, MediaGenerateSuccess } from '@/lib/site-media';
import { z } from 'zod';

const MEDIA_LOGGER = createLogger('media.api');

const BodySchema = z.object({
  prompt: z.string().trim().min(1).max(4000),
  mediaSlot: z.string().trim().min(1).max(240).optional(),
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional(),
  useMagicbornStyle: z.boolean().optional(),
  sceneKey: z.string().trim().min(1).max(240).optional(),
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

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const responseHeaders = { 'x-portfolio-request-id': requestId };
  const viewer = await getSessionViewer(request);

  if (!viewer.authenticated || !viewer.user) {
    MEDIA_LOGGER.warn('media generate rejected: unauthenticated', { requestId });
    return jsonResponse(
      {
        ok: false,
        error: 'media_auth_required',
        message: 'Sign in to generate images.',
      },
      401,
      responseHeaders,
    );
  }

  if (!canGeneratePortfolioMedia(viewer)) {
    MEDIA_LOGGER.warn('media generate rejected: insufficient role', {
      requestId,
      userId: viewer.user.id,
    });
    return jsonResponse(
      {
        ok: false,
        error: 'media_access_required',
        message: 'Admin access is required to generate images.',
      },
      403,
      responseHeaders,
    );
  }

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

  const { prompt, mediaSlot, size, useMagicbornStyle, sceneKey } = parsed.data;
  const openAiPrompt = useMagicbornStyle
    ? composeMagicbornImagePrompt({
        sceneKey,
        sceneText: sceneKey ? undefined : prompt,
        extraInstructions: sceneKey ? prompt : undefined,
      })
    : prompt;

  const model = getOpenAiImageModel();
  const imageSize = size ?? '1024x1024';

  MEDIA_LOGGER.info('media generate started', {
    requestId,
    model,
    imageSize,
    hasMediaSlot: Boolean(mediaSlot),
    useMagicbornStyle: Boolean(useMagicbornStyle),
    promptChars: openAiPrompt.length,
  });

  try {
    const result = await generateOpenAiImage({
      apiKey,
      prompt: openAiPrompt,
      size: imageSize,
      model,
    });

    if (!result.ok) {
      MEDIA_LOGGER.error('media generate upstream error', {
        requestId,
        status: result.status,
        upstreamPreview: result.message.slice(0, 200),
      });
      return jsonResponse(
        {
          ok: false,
          error: 'upstream_error',
          message: result.message,
        },
        result.status,
        responseHeaders,
      );
    }

    const body: MediaGenerateSuccess = {
      ok: true,
      model: result.model,
      b64Json: result.b64Json,
      ...(typeof result.revisedPrompt === 'string' && result.revisedPrompt.trim()
        ? { revisedPrompt: result.revisedPrompt.trim() }
        : {}),
      ...(mediaSlot ? { mediaSlot } : {}),
    };

    MEDIA_LOGGER.info('media generate completed', { requestId, model: result.model });
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
