import { NextResponse } from 'next/server';

export { unknownErrorMessage } from '@/lib/unknown-error';

/** JSON error body `{ error }` with optional extra fields (e.g. `{ markdown: '' }`). */
export function jsonApiError(
  message: string,
  status = 500,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}
