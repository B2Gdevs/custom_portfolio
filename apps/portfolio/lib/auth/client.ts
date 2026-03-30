import type { AuthFeatureAccess } from './permissions';

type AuthSessionResponse = {
  ok: boolean;
  session: AuthFeatureAccess;
};

type AuthLoginResponse = AuthSessionResponse;

export async function fetchAuthSession(init?: RequestInit) {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
    ...init,
  });

  const body = (await response.json()) as AuthSessionResponse;
  return { response, body };
}

export async function loginAuthSession(input: {
  email: string;
  password: string;
}) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
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
