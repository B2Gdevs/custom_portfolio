'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { loginAuthSession } from '@/lib/auth/client';
import { dispatchPortfolioAuthChanged } from '@/lib/auth/events';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next')?.trim() || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { response, body } = await loginAuthSession({ email, password });
      if (!response.ok || !('ok' in body) || !body.ok) {
        const fromServer =
          'message' in body && typeof body.message === 'string' ? body.message : null;
        const code =
          'error' in body && typeof body.error === 'string' ? body.error : null;
        const msg =
          fromServer ||
          (code === 'auth_timeout'
            ? 'Sign-in timed out. Check that the database is reachable and DATABASE_URL is set.'
            : null) ||
          (code === 'invalid_credentials' ? 'Email or password is incorrect.' : null) ||
          'Sign-in failed.';
        setError(msg);
        return;
      }
      dispatchPortfolioAuthChanged();
      router.replace(nextPath.startsWith('/') ? nextPath : '/');
      router.refresh();
    } catch {
      setError(
        'Could not reach the server. If you use `pnpm start`, ensure Payload can connect (see DATABASE_URL) and try again.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center pb-20">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-dark-alt/85 p-8 shadow-lg backdrop-blur">
        <p className="section-kicker">Account</p>
        <h1 className="mt-2 font-display text-3xl text-primary">Sign in</h1>
        <p className="mt-3 text-sm text-text-muted">
          Use the owner credentials from your environment. After signing in you will be redirected back.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/" className="text-accent underline-offset-4 hover:underline">
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="section-shell flex min-h-[40vh] items-center justify-center text-text-muted">Loading...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
