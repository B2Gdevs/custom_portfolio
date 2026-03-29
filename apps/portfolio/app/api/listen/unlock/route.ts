import { NextResponse } from 'next/server';
import { listenGroupCookieName, parseListenLockGroups, verifyListenGroupPassword } from '@/lib/listen-unlock';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const group = typeof rec.group === 'string' ? rec.group.trim() : '';
  const password = typeof rec.password === 'string' ? rec.password : '';

  if (!group) {
    return NextResponse.json({ ok: false, error: 'missing_group' }, { status: 400 });
  }

  const map = parseListenLockGroups();
  if (!(group in map)) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 400 });
  }

  if (!verifyListenGroupPassword(group, password)) {
    return NextResponse.json({ ok: false, error: 'invalid_password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const name = listenGroupCookieName(group);
  const maxAge = 60 * 60 * 24 * 30;
  res.cookies.set(name, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  });
  return res;
}
