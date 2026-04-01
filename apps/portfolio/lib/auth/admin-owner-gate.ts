import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

type SessionPayload = {
  session?:
    | {
        isOwner?: boolean;
        features?: {
          admin?: {
            access?: boolean;
          };
        };
      }
    | null;
};

function isOwnerAdminSession(data: SessionPayload | null | undefined) {
  return Boolean(data?.session?.isOwner && data?.session?.features?.admin?.access);
}

async function fetchSessionPayload(sessionUrl: string, cookie: string) {
  const response = await fetch(sessionUrl, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as SessionPayload;
}

export async function isAdminOwnerRequest(request: Request): Promise<boolean> {
  const sessionUrl = new URL('/api/auth/session', request.url);
  const data = await fetchSessionPayload(
    sessionUrl.toString(),
    request.headers.get('cookie') ?? '',
  );
  return isOwnerAdminSession(data);
}

export async function assertAdminOwnerOrRedirect(nextPath = '/admin') {
  const h = await headers();
  const cookie = h.get('cookie') ?? '';
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const sessionUrl = `${proto}://${host}/api/auth/session`;
  const data = await fetchSessionPayload(sessionUrl, cookie);

  if (!isOwnerAdminSession(data)) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
}

export function adminUnauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: 'admin_access_required',
      message: 'Owner admin access is required.',
    },
    { status: 401 },
  );
}
