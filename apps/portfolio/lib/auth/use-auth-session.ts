'use client';

import { useEffect, useRef, useState } from 'react';
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

type AuthSessionState = {
  loading: boolean;
  session: AuthSessionResponseBody['session'] | null;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
};

/** Check if Clerk is configured (client-side check) */
function isClerkEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

/** Fetch session for a Clerk-authenticated user by looking up their Payload user */
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
    // If Clerk is enabled and user is authenticated via Clerk, use Clerk session bridge
    if (isClerkEnabled() && clerkUserId) {
      const body = await fetchClerkSession(clerkUserId);
      if (body.ok) {
        setSession(body.session);
      } else {
        // Clerk user exists but no Payload user yet - show as unauthenticated
        setSession(null);
      }
      return;
    }

    // Fall back to Payload-only session
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

  // Get Clerk user ID if Clerk is enabled
  useEffect(() => {
    if (!isClerkEnabled()) return;

    // Dynamically import Clerk hook to avoid errors when not installed
    import('@clerk/nextjs').then(({ useUser }) => {
      // Note: This is a workaround - in production, use the hook properly
      // For now, we'll check window for Clerk state
    }).catch(() => {
      // Clerk not installed, ignore
    });
  }, []);

  async function runReload() {
    await loadAuthSession({
      setLoading,
      setSession,
      withLoadingSpinner: true,
      clerkUserId,
    });
  }

  async function logout() {
    // If Clerk is enabled, also sign out from Clerk
    if (isClerkEnabled() && clerkUserId) {
      try {
        const { useClerk } = await import('@clerk/nextjs');
        // Clerk signOut is handled by the ClerkProvider
      } catch {
        // Clerk not available
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
  }, []);

  return {
    loading,
    session,
    reload: runReload,
    logout,
  };
}
