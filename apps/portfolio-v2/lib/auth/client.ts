import type { AuthFeatureAccess } from './permissions';

export type AuthSessionResponseBody = {
  ok: boolean;
  session: AuthFeatureAccess;
};

type AuthLoginResponse = AuthSessionResponseBody;

const AUTH_SESSION_FETCH_MS = 28_000;

export async function fetchAuthSession(init?: RequestInit) {
  const { signal: userSignal, ...rest } = init ?? {};
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
    signal: userSignal ?? AbortSignal.timeout(AUTH_SESSION_FETCH_MS),
    ...rest,
  });

  const body = (await response.json()) as AuthSessionResponseBody;
  return { response, body };
}

const AUTH_LOGIN_FETCH_MS = 32_000;

export async function loginAuthSession(input: {
  email: string;
  password: string;
}) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    signal: AbortSignal.timeout(AUTH_LOGIN_FETCH_MS),
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const body = (await response.json()) as AuthLoginResponse | {
    ok: false;
    error: string;
    message?: string;
  };

  return { response, body };
}

export async function logoutAuthSession() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  const body = (await response.json()) as { ok: boolean };
  return { response, body };
}
