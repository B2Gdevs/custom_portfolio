import { NextResponse } from 'next/server';
import { runReaderStateWorker } from '@/lib/reader/reading-state-worker-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function applySetCookie(response: NextResponse, setCookie?: string) {
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const storageKey = url.searchParams.get('storageKey')?.trim();
  const contentHash = url.searchParams.get('contentHash')?.trim();

  if (!storageKey || !contentHash) {
    return NextResponse.json(
      {
        ok: false,
        error: 'storageKey and contentHash are required.',
      },
      { status: 400 },
    );
  }

  const result = await runReaderStateWorker({
    command: 'get',
    cookieHeader: request.headers.get('cookie') ?? '',
    storageKey,
    contentHash,
  });
  const response = NextResponse.json(result.body, { status: result.status });
  applySetCookie(response, result.setCookie);
  return response;
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Record<string, unknown>;
  const storageKey = typeof payload.storageKey === 'string' ? payload.storageKey.trim() : '';
  const contentHash = typeof payload.contentHash === 'string' ? payload.contentHash.trim() : '';
  const sourceKind = payload.sourceKind === 'uploaded' ? 'uploaded' : 'built-in';

  if (!storageKey || !contentHash) {
    return NextResponse.json(
      {
        ok: false,
        error: 'storageKey and contentHash are required.',
      },
      { status: 400 },
    );
  }

  const result = await runReaderStateWorker({
    command: 'save',
    cookieHeader: request.headers.get('cookie') ?? '',
    input: {
      storageKey,
      contentHash,
      bookSlug: typeof payload.bookSlug === 'string' ? payload.bookSlug : null,
      sourceKind,
      location: typeof payload.location === 'string' ? payload.location : null,
      progress:
        typeof payload.progress === 'number' && Number.isFinite(payload.progress)
          ? payload.progress
          : null,
      annotations: Array.isArray(payload.annotations) ? payload.annotations : [],
    },
  });
  const response = NextResponse.json(result.body, { status: result.status });
  applySetCookie(response, result.setCookie);
  return response;
}
