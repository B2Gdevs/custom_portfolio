import { NextResponse } from 'next/server';
import { acceptInvite, verifyInviteToken, type InviteRejectReason } from '@/lib/auth/invite';
import { loginWithCredentials } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter: max 5 POST attempts per IP per 15 minutes.
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

const REJECT_MESSAGES: Record<InviteRejectReason, string> = {
  not_found: 'Invite link not found or already expired.',
  expired: 'This invite link has expired. Ask the operator to send a new invite.',
  already_used: 'This invite link has already been used.',
  revoked: 'This invite link has been revoked.',
};

/**
 * GET /api/auth/invite/accept?token=<plaintext>
 * Verify the token and return context (tenant name, role) without consuming it.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token')?.trim() || '';

  if (!token) {
    return NextResponse.json({ ok: false, error: 'missing_token' }, { status: 400 });
  }

  const result = await verifyInviteToken(token);

  if (!result.valid) {
    return NextResponse.json(
      { ok: false, error: result.reason, message: REJECT_MESSAGES[result.reason] },
      { status: 400 },
    );
  }

  const { record } = result;
  const tenant = typeof record.tenant === 'object' ? record.tenant : null;

  return NextResponse.json({
    ok: true,
    invite: {
      email: record.email,
      role: record.role,
      tenant: tenant
        ? { name: tenant.name, slug: tenant.slug }
        : null,
      expiresAt: record.expiresAt,
    },
  });
}

/**
 * POST /api/auth/invite/accept
 * Body: { token, password, displayName? }
 * Consume invite, create/update user, return a logged-in session.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', message: 'Too many attempts. Try again later.' },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { token?: unknown; password?: unknown; displayName?: unknown }
    | null;

  const token = typeof body?.token === 'string' ? body.token.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const displayName =
    typeof body?.displayName === 'string' ? body.displayName.trim() || undefined : undefined;

  if (!token || !password) {
    return NextResponse.json(
      { ok: false, error: 'invalid_payload', message: 'token and password are required.' },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: 'weak_password', message: 'Password must be at least 8 characters.' },
      { status: 400 },
    );
  }

  const result = await acceptInvite({ plaintext: token, password, displayName });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.reason, message: REJECT_MESSAGES[result.reason] },
      { status: 400 },
    );
  }

  // Log in the newly created/updated user and set the session cookie.
  try {
    const loginResponse = await loginWithCredentials({
      email: result.email,
      password,
    });

    return loginResponse;
  } catch {
    // Account was created but auto-login failed; return partial success.
    return NextResponse.json(
      { ok: true, autoLogin: false, message: 'Account created. Please sign in.' },
      { status: 201 },
    );
  }
}
