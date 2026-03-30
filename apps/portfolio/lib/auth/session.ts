import { NextResponse } from 'next/server';
import {
  AUTH_COLLECTION_SLUG,
  getOwnerSeedConfig,
  isLocalAutoLoginEnabled,
} from './config';
import { applyAuthCookie } from './cookies';
import { getViewerFeatureAccess } from './permissions';
import { viewerFromUser, type AuthViewer } from './viewer';

export async function getSessionViewer(
  request: Request,
): Promise<AuthViewer> {
  const { getPayloadClient } = await import('@/lib/payload');
  const payload = await getPayloadClient();
  const result = await payload.auth({
    headers: request.headers,
  });

  return viewerFromUser(result.user);
}

export async function loginWithCredentials(input: {
  email: string;
  password: string;
  autoLoggedIn?: boolean;
}) {
  const { getPayloadClient } = await import('@/lib/payload');
  const payload = await getPayloadClient();
  const login = await payload.login({
    collection: AUTH_COLLECTION_SLUG,
    data: {
      email: input.email,
      password: input.password,
    },
    overrideAccess: true,
  });

  const viewer = viewerFromUser(login.user, input.autoLoggedIn);
  const response = NextResponse.json({
    ok: true,
    session: getViewerFeatureAccess(viewer),
  });

  if (!login.token) {
    throw new Error('payload login did not return a token');
  }

  applyAuthCookie(response, login.token);
  return response;
}

export async function maybeAutoLoginForDevelopment(request: Request) {
  if (!isLocalAutoLoginEnabled()) {
    return null;
  }

  const current = await getSessionViewer(request);
  if (current.authenticated) {
    return null;
  }

  const { ensureOwnerSeed } = await import('./seed');
  await ensureOwnerSeed();
  const owner = getOwnerSeedConfig();
  return loginWithCredentials({
    email: owner.email,
    password: owner.password,
    autoLoggedIn: true,
  });
}
