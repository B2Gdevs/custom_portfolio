import { NextResponse } from 'next/server';
import { prepareReaderApiRequest } from '@/lib/reader/inline-route-helpers';
import { saveReaderWorkspaceSettings } from '@/lib/reader/workspace-write';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function applySetCookie(response: NextResponse, setCookie?: string) {
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Record<string, unknown>;

  const { request: authedReq, setCookie } = await prepareReaderApiRequest(
    request.headers.get('cookie') ?? '',
    '/api/reader/workspace/settings',
  );

  const settings = await saveReaderWorkspaceSettings(
    {
      defaultWorkspaceView:
        payload.defaultWorkspaceView === 'continue-reading' ? 'continue-reading' : 'library',
      preferPagedReader: payload.preferPagedReader !== false,
      showProgressBadges: payload.showProgressBadges !== false,
    },
    authedReq,
  );

  if (!settings) {
    const response = NextResponse.json(
      { ok: false, error: 'Reader settings write access denied.' },
      { status: 403 },
    );
    applySetCookie(response, setCookie);
    return response;
  }

  const response = NextResponse.json({ ok: true, settings }, { status: 200 });
  applySetCookie(response, setCookie);
  return response;
}
