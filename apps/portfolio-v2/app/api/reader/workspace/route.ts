import { NextResponse } from 'next/server';
import { maybeAutoLoginForDevelopment } from '@/lib/auth/session';
import { getReaderWorkspaceBootstrap } from '@/lib/reader/workspace-bootstrap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * In-process workspace bootstrap (no tsx subprocess).
 * Production deploys omit devDependencies, so `tsx` is not available on Vercel — the previous
 * worker spawn always failed with ENOENT / exit 1 → 500 and broke the reader.
 */
export async function GET(request: Request) {
  try {
    let cookieHeader = request.headers.get('cookie') ?? '';

    const autoLoginResponse = await maybeAutoLoginForDevelopment(request);
    let setCookie: string | undefined;
    if (autoLoginResponse) {
      setCookie = autoLoginResponse.headers.get('set-cookie') ?? undefined;
      if (setCookie) {
        cookieHeader = setCookie.split(';', 1)[0] ?? cookieHeader;
      }
    }

    const workspace = await getReaderWorkspaceBootstrap(
      new Request('http://localhost/api/reader/workspace', {
        headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      }),
    );

    const response = NextResponse.json(
      { ok: true, workspace },
      { status: 200 },
    );
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  } catch (error) {
    console.error('[api/reader/workspace]', error);
    return NextResponse.json(
      { ok: false, error: 'reader_workspace_failed' },
      { status: 500 },
    );
  }
}
