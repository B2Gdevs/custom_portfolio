/**
 * Shared types for site media generation (OpenAI Images API).
 * Keep in sync with `app/api/media/generate/route.ts`.
 */

export type MediaImageSize = '1024x1024' | '1792x1024' | '1024x1792';

export type MediaGenerateRequestBody = {
  prompt: string;
  /** Stable API field: cover / app-tile target id (e.g. `app-cover:reader`). */
  mediaSlot?: string;
  size?: MediaImageSize;
};

export type MediaGenerateSuccess = {
  ok: true;
  model: string;
  mediaSlot?: string;
  revisedPrompt?: string;
  /** PNG as base64 (no data: prefix). */
  b64Json: string;
};

export type MediaGenerateFailure = {
  ok: false;
  error: string;
  message: string;
};

export type MediaGenerateResponse = MediaGenerateSuccess | MediaGenerateFailure;
