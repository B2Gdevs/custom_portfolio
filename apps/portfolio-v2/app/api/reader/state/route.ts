import { NextResponse } from 'next/server';
import { prepareReaderApiRequest } from '@/lib/reader/inline-route-helpers';
import { getReaderPersistedState, saveReaderPersistedState } from '@/lib/reader/reading-state';
import type { ReaderPersistedStateInput } from '@/lib/reader/reading-state-contract';

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

  const { request: authedReq, setCookie } = await prepareReaderApiRequest(
    request.headers.get('cookie') ?? '',
    '/api/reader/state',
  );
  const state = await getReaderPersistedState({ storageKey, contentHash }, authedReq);
  const response = NextResponse.json({ ok: true, state }, { status: 200 });
  applySetCookie(response, setCookie);
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

  const input: ReaderPersistedStateInput = {
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
  };

  const { request: authedReq, setCookie } = await prepareReaderApiRequest(
    request.headers.get('cookie') ?? '',
    '/api/reader/state',
  );
  const state = await saveReaderPersistedState(input, authedReq);
  const response = NextResponse.json({ ok: true, state }, { status: 200 });
  applySetCookie(response, setCookie);
  return response;
}
