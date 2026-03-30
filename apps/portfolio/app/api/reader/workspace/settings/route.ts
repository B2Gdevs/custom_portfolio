import { NextResponse } from 'next/server';
import { runReaderWorkspaceWriteWorker } from '@/lib/reader/workspace-write-worker-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function applySetCookie(response: NextResponse, setCookie?: string) {
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Record<string, unknown>;

  const result = await runReaderWorkspaceWriteWorker({
    command: 'save-settings',
    cookieHeader: request.headers.get('cookie') ?? '',
    input: {
      defaultWorkspaceView:
        payload.defaultWorkspaceView === 'continue-reading' ? 'continue-reading' : 'library',
      preferPagedReader: payload.preferPagedReader !== false,
      showProgressBadges: payload.showProgressBadges !== false,
    },
  });

  const response = NextResponse.json(result.body, { status: result.status });
  applySetCookie(response, result.setCookie);
  return response;
}
