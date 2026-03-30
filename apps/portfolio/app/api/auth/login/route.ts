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
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_credentials',
        message: 'Login failed.',
      },
      { status: 401 },
    );
  }
}
