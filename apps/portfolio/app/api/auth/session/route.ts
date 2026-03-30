import { NextResponse } from 'next/server';
import { runAuthWorker } from '@/lib/auth/worker-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const result = await runAuthWorker('session', {
    cookieHeader: request.headers.get('cookie') ?? '',
  });
  const response = NextResponse.json(result.body, { status: result.status });
  if (result.setCookie) {
    response.headers.set('set-cookie', result.setCookie);
  }
  return response;
}
