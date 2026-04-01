import { NextResponse } from 'next/server';
import { runAuthWorker } from '@/lib/auth/worker-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: unknown; password?: unknown }
    | null;

  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_login_payload',
        message: 'Email and password are required.',
      },
      { status: 400 },
    );
  }

  try {
    const result = await runAuthWorker('login', { email, password });
    const response = NextResponse.json(result.body, { status: result.status });
    if (result.setCookie) {
      response.headers.set('set-cookie', result.setCookie);
    }
    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const timedOut = msg.includes('timed out');
    return NextResponse.json(
      {
        ok: false,
        error: timedOut ? 'auth_timeout' : 'invalid_credentials',
        message: timedOut
          ? 'Sign-in service timed out. Check DATABASE_URL / network and try again.'
          : 'Login failed.',
      },
      { status: timedOut ? 503 : 401 },
    );
  }
}
