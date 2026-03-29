import { NextResponse } from 'next/server';
import { requireBasicAdminAuth } from '@/lib/rag/basic-auth';

export async function GET(request: Request) {
  const authError = requireBasicAdminAuth(request);
  if (authError) {
    return authError;
  }

  return NextResponse.json({
    ok: false,
    error: 'ingest_route_not_enabled',
    message:
      'Use `pnpm --filter @portfolio/app rag:ingest` for now. The Payload-backed admin trigger is deferred until the Next.js/Payload route integration is hardened.',
  });
}

export async function POST(request: Request) {
  const authError = requireBasicAdminAuth(request);
  if (authError) {
    return authError;
  }

  return NextResponse.json({
    ok: false,
    error: 'ingest_route_not_enabled',
    message:
      'Use `pnpm --filter @portfolio/app rag:ingest` for now. The Payload-backed admin trigger is deferred until the Next.js/Payload route integration is hardened.',
  }, {
    status: 503,
  });
}
