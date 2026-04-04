'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { dispatchPortfolioAuthChanged } from '@/lib/auth/events';

type InviteContext = {
  email: string;
  role: string;
  tenant: { name: string | null; slug: string | null } | null;
  expiresAt: string;
};

type PageState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'form'; invite: InviteContext }
  | { phase: 'success' };

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';

  const [state, setState] = useState<PageState>({ phase: 'loading' });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState({ phase: 'error', message: 'No invite token found in this link.' });
      return;
    }

    fetch(`/api/auth/invite/accept?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        const body = (await res.json()) as
          | { ok: true; invite: InviteContext }
          | { ok: false; message: string };
        if (!body.ok) {
          setState({ phase: 'error', message: body.message });
        } else {
          setState({ phase: 'form', invite: body.invite });
        }
      })
      .catch(() => {
        setState({ phase: 'error', message: 'Could not reach the server. Try again.' });
      });
  }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (password !== confirm) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/invite/accept', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          displayName: displayName.trim() || undefined,
        }),
      });

      const body = (await res.json()) as
        | { ok: true; autoLogin?: boolean; session?: object }
        | { ok: false; message: string };

      if (!body.ok) {
        setFormError((body as { ok: false; message: string }).message);
        return;
      }

      dispatchPortfolioAuthChanged();
      setState({ phase: 'success' });

      // If auto-login succeeded (session cookie set), go home; else go to login.
      const autoLogin = 'session' in body;
      setTimeout(() => {
        router.replace(autoLogin ? '/' : '/login');
      }, 1500);
    } catch {
      setFormError('Could not reach the server. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (state.phase === 'loading') {
    return (
      <div className="section-shell flex min-h-[60vh] items-center justify-center text-text-muted">
        Verifying invite…
      </div>
    );
  }

  if (state.phase === 'error') {
    return (
      <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center gap-4 pb-20">
        <div className="w-full max-w-md rounded-2xl border border-border/80 bg-dark-alt/85 p-8 shadow-lg backdrop-blur">
          <p className="section-kicker">Invite</p>
          <h1 className="mt-2 font-display text-3xl text-primary">Link unavailable</h1>
          <p className="mt-4 text-sm text-destructive">{state.message}</p>
          <p className="mt-6 text-sm text-text-muted">
            <Link href="/login" className="text-accent underline-offset-4 hover:underline">
              Go to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (state.phase === 'success') {
    return (
      <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center gap-4 pb-20">
        <div className="w-full max-w-md rounded-2xl border border-border/80 bg-dark-alt/85 p-8 shadow-lg backdrop-blur text-center">
          <h1 className="font-display text-3xl text-primary">You&apos;re in!</h1>
          <p className="mt-3 text-sm text-text-muted">Account created. Redirecting…</p>
        </div>
      </div>
    );
  }

  const { invite } = state;
  const tenantName = invite.tenant?.name ?? 'your organisation';
  const roleLabel = invite.role === 'admin' ? 'Admin' : 'Member';

  return (
    <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center pb-20">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-dark-alt/85 p-8 shadow-lg backdrop-blur">
        <p className="section-kicker">Invite</p>
        <h1 className="mt-2 font-display text-3xl text-primary">Accept your invite</h1>
        <p className="mt-3 text-sm text-text-muted">
          You have been invited to{' '}
          <span className="text-primary">{tenantName}</span> as{' '}
          <span className="text-primary">{roleLabel}</span>.
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Joining as <span className="text-primary">{invite.email}</span>
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Display name (optional)
            </span>
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Confirm password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Accept invite'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-accent underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="section-shell flex min-h-[40vh] items-center justify-center text-text-muted">
          Loading…
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
