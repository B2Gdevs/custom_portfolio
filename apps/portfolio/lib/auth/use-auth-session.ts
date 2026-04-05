'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  fetchAuthSession,
  logoutAuthSession,
  type AuthSessionResponseBody,
} from './client';
import {
  PORTFOLIO_AUTH_CHANGED_EVENT,
  dispatchPortfolioAuthChanged,
} from './events';

type ClerkGlobalWindow = Window & {
  Clerk?: {
    user?: { id: string } | null;
    signOut: () => Promise<void>;
  } | null;
};

type AuthSessionState = {
  loading: boolean;
  session: AuthSessionResponseBody['session'] | null;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
};

function isClerkEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

function getClerkUserIdFromWindow(): string | null {
  if (typeof window === 'undefined') return null;
  return (window as ClerkGlobalWindow).Clerk?.user?.id ?? null;
}

async function fetchClerkSession(clerkUserId: string) {
  const response = await fetch(`/api/auth/clerk-session?clerkId=${encodeURIComponent(clerkUserId)}`, {
    method: 'GET',
    credentials: 'include',
  });
  return response.json() as Promise<AuthSessionResponseBody & { error?: string }>;
}

async function loadAuthSession({
  setLoading,
  setSession,
  withLoadingSpinner,
  clerkUserId,
}: {
  setLoading: (value: boolean) => void;
  setSession: (value: AuthSessionResponseBody['session'] | null) => void;
  withLoadingSpinner: boolean;
  clerkUserId?: string | null;
}) {
  if (withLoadingSpinner) {
    setLoading(true);
  }
  try {
    if (isClerkEnabled() && clerkUserId) {
      const body = await fetchClerkSession(clerkUserId);
      if (body.ok) {
        setSession(body.session);
      } else {
        setSession(null);
      }
      return;
    }

    const { response, body } = await fetchAuthSession({
      cache: 'no-store',
    });

    if (response.ok && body.ok) {
      setSession(body.session);
    } else {
      setSession(null);
    }
  } catch {
    setSession(null);
  } finally {
    setLoading(false);
  }
}

export function useAuthSession(): AuthSessionState {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSessionResponseBody['session'] | null>(
    null,
  );
  const [clerkUserId, setClerkUserId] = useState<string | null>(null);
  const firstPathnameLoadRef = useRef(true);

  useEffect(() => {
    if (!isClerkEnabled()) return;

    function sync() {
      const id = getClerkUserIdFromWindow();
      setClerkUserId((prev) => (prev === id ? prev : id));
    }

    sync();
    const interval = setInterval(sync, 1000);
    return () => clearInterval(interval);
  }, []);

  const runReload = useCallback(async () => {
    await loadAuthSession({
      setLoading,
      setSession,
      withLoadingSpinner: true,
      clerkUserId,
    });
  }, [clerkUserId]);

  async function logout() {
    if (isClerkEnabled() && clerkUserId) {
      try {
        const clerk = (window as ClerkGlobalWindow).Clerk;
        if (clerk) {
          await clerk.signOut();
        }
      } catch {
        /* ignore */
      }
    }
    await logoutAuthSession();
    dispatchPortfolioAuthChanged();
    await runReload();
    router.refresh();
  }

  useEffect(() => {
    const showSpinner = firstPathnameLoadRef.current;
    firstPathnameLoadRef.current = false;
    void loadAuthSession({
      setLoading,
      setSession,
      withLoadingSpinner: showSpinner,
      clerkUserId,
    });
  }, [pathname, clerkUserId]);

  useEffect(() => {
    const handleAuthChanged = () => {
      void runReload();
    };

    window.addEventListener(PORTFOLIO_AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => {
      window.removeEventListener(PORTFOLIO_AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [runReload]);

  return {
    loading,
    session,
    reload: runReload,
    logout,
  };
}
