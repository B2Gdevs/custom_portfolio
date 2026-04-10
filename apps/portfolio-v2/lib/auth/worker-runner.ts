import {
  runLoginCommandWithTimeout,
  runSessionCommandWithTimeout,
} from '@/lib/auth/auth-commands';

export type AuthWorkerCommand = 'login' | 'session';

export type AuthWorkerResult = {
  status: number;
  body: unknown;
  setCookie?: string | null;
};

/**
 * Runs auth in-process (same Node runtime as the route). Subprocess + tsx was removed so Vercel
 * serverless bundles do not need `tsx` on disk. Timeout behavior matches the former worker
 * (`AUTH_WORKER_TIMEOUT_MS`, default 25s).
 */
export async function runAuthWorker(
  command: AuthWorkerCommand,
  payload: Record<string, unknown>,
): Promise<AuthWorkerResult> {
  if (command === 'session') {
    const cookieHeader =
      typeof payload.cookieHeader === 'string' ? payload.cookieHeader : '';
    const request = new Request('http://localhost/api/auth/session', {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    });
    return runSessionCommandWithTimeout(request);
  }

  if (command === 'login') {
    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    const password = typeof payload.password === 'string' ? payload.password : '';
    return runLoginCommandWithTimeout(email, password);
  }

  throw new Error(`unknown auth worker command: ${command}`);
}
