import { getViewerFeatureAccess } from '@/lib/auth/permissions';
import {
  getSessionViewer,
  loginWithCredentials,
  maybeAutoLoginForDevelopment,
} from '@/lib/auth/session';

export type AuthCommandResult = {
  status: number;
  body: unknown;
  setCookie: string | null;
};

const DEFAULT_AUTH_COMMAND_TIMEOUT_MS = 25_000;

function authCommandTimeoutMs(): number {
  const raw = process.env.AUTH_WORKER_TIMEOUT_MS?.trim();
  if (!raw) return DEFAULT_AUTH_COMMAND_TIMEOUT_MS;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 3000 ? Math.floor(n) : DEFAULT_AUTH_COMMAND_TIMEOUT_MS;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** In-process session resolution (replaces tsx subprocess; safe on Vercel). */
export async function runSessionCommand(request: Request): Promise<AuthCommandResult> {
  const autoLoginResponse = await maybeAutoLoginForDevelopment(request);
  if (autoLoginResponse) {
    return {
      status: autoLoginResponse.status,
      body: await autoLoginResponse.json(),
      setCookie: autoLoginResponse.headers.get('set-cookie'),
    };
  }

  const viewer = await getSessionViewer(request);
  return {
    status: 200,
    body: {
      ok: true,
      session: getViewerFeatureAccess(viewer),
    },
    setCookie: null,
  };
}

export async function runSessionCommandWithTimeout(request: Request): Promise<AuthCommandResult> {
  const ms = authCommandTimeoutMs();
  return withTimeout(runSessionCommand(request), ms, 'auth session');
}

export async function runLoginCommand(email: string, password: string): Promise<AuthCommandResult> {
  const response = await loginWithCredentials({ email, password });
  return {
    status: response.status,
    body: await response.json(),
    setCookie: response.headers.get('set-cookie'),
  };
}

export async function runLoginCommandWithTimeout(
  email: string,
  password: string,
): Promise<AuthCommandResult> {
  const ms = authCommandTimeoutMs();
  return withTimeout(runLoginCommand(email, password), ms, 'auth login');
}
