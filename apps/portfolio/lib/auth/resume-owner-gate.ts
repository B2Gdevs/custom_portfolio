import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

type SessionPayload = {
  session?: { isOwner?: boolean } | null;
};

export async function isResumeOwnerRequest(request: Request): Promise<boolean> {
  const sessionUrl = new URL('/api/auth/session', request.url);
  const res = await fetch(sessionUrl, {
    headers: { cookie: request.headers.get('cookie') ?? '' },
    cache: 'no-store',
  });
  if (!res.ok) return false;
  const data = (await res.json()) as SessionPayload;
  return Boolean(data.session?.isOwner);
}

/** Server component / RSC: owner check without importing Payload into the page graph. */
export async function assertResumeOwnerOrRedirect() {
  const h = await headers();
  const cookie = h.get('cookie') ?? '';
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const sessionUrl = `${proto}://${host}/api/auth/session`;
  const res = await fetch(sessionUrl, {
    headers: { cookie },
    cache: 'no-store',
  });
  const data = (await res.json()) as SessionPayload;
  if (!data?.session?.isOwner) {
    redirect('/login?next=/resumes');
  }
}
