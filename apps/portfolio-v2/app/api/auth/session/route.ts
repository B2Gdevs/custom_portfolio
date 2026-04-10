import { NextResponse } from 'next/server';
import { getViewerFeatureAccess } from '@/lib/auth/permissions';
import { runAuthWorker } from '@/lib/auth/worker-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const result = await runAuthWorker('session', {
      cookieHeader: request.headers.get('cookie') ?? '',
    });
    const response = NextResponse.json(result.body, { status: result.status });
    if (result.setCookie) {
      response.headers.set('set-cookie', result.setCookie);
    }
    return response;
  } catch (err) {
    console.error('[api/auth/session]', err);
    /** Avoid hanging SSR / client: treat worker failure or DB timeout as logged-out. */
    return NextResponse.json({
      ok: true,
      session: getViewerFeatureAccess(null),
    });
  }
}
