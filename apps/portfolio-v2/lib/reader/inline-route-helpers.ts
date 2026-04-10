import { maybeAutoLoginForDevelopment } from '@/lib/auth/session';

/**
 * Dev auto-login + cookie forwarding for reader API routes (replaces tsx workers on Vercel).
 */
export async function prepareReaderApiRequest(cookieHeader: string, path: string) {
  let nextCookie = cookieHeader;
  let setCookie: string | undefined;

  const probe = new Request(`http://localhost${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
  const autoLoginResponse = await maybeAutoLoginForDevelopment(probe);
  if (autoLoginResponse) {
    setCookie = autoLoginResponse.headers.get('set-cookie') ?? undefined;
    if (setCookie) {
      nextCookie = setCookie.split(';', 1)[0] ?? nextCookie;
    }
  }

  const request = new Request(`http://localhost${path}`, {
    headers: nextCookie ? { cookie: nextCookie } : undefined,
  });

  return { request, setCookie };
}
