import { NextResponse } from 'next/server';
import { runReaderWorkspaceWorker } from '@/lib/reader/workspace-worker-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const result = await runReaderWorkspaceWorker({
    cookieHeader: request.headers.get('cookie') ?? '',
  });
  const response = NextResponse.json(result.body, {
    status: result.status,
  });

  if (result.setCookie) {
    response.headers.set('set-cookie', result.setCookie);
  }

  return response;
}
