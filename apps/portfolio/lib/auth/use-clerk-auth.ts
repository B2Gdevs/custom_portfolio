'use client';

import { useEffect, useState } from 'react';
import type { AuthSessionResponseBody } from './client';

type ClerkBrowserUser = {
  id: string;
  primaryEmailAddress?: { emailAddress?: string } | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};

type ClerkBrowser = {
  user?: ClerkBrowserUser | null;
  signOut: () => Promise<void>;
};

type ClerkGlobalWindow = Window & {
  Clerk?: ClerkBrowser | null;
  __clerk_frontend_api?: string;
};

function readClerkUser():
  | {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    }
  | null {
  if (typeof window === 'undefined') return null;
  const w = window as ClerkGlobalWindow;
  const user = w.Clerk?.user;
  if (!user) return null;
  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  };
}

/**
 * Hook that bridges Clerk authentication with Payload authorization.
 *
 * When Clerk is enabled:
 * 1. Gets the authenticated user from Clerk
 * 2. Looks up their Payload user by clerkId
 * 3. Returns their entitlements and session data
 *
 * This keeps Clerk as identity provider and Payload as authorization source.
 */
export function useClerkAuth() {
  const [clerkUser, setClerkUser] = useState<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  } | null>(null);
  const [clerkLoaded, setClerkLoaded] = useState(false);
  const [session, setSession] = useState<AuthSessionResponseBody['session'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function syncFromWindow() {
      const next = readClerkUser();
      setClerkUser((prev) => {
        if (prev?.id === next?.id && prev?.email === next?.email) return prev;
        return next;
      });
    }

    try {
      syncFromWindow();
    } catch {
      /* Clerk not on page */
    }
    setClerkLoaded(true);

    const interval = setInterval(() => {
      try {
        syncFromWindow();
      } catch {
        /* ignore */
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadPayloadSession() {
      if (!clerkLoaded) return;

      if (!clerkUser) {
        setSession(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/auth/clerk-session?clerkId=${encodeURIComponent(clerkUser.id)}`,
          { credentials: 'include' },
        );
        const body = (await response.json()) as { ok?: boolean; session?: AuthSessionResponseBody['session'] };

        if (body.ok && body.session) {
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

    void loadPayloadSession();
  }, [clerkUser, clerkLoaded]);

  async function signOut() {
    try {
      if (typeof window !== 'undefined') {
        const clerk = (window as ClerkGlobalWindow).Clerk;
        if (clerk) {
          await clerk.signOut();
        }
      }
    } catch {
      /* ignore */
    }
    setClerkUser(null);
    setSession(null);
  }

  return {
    loading: !clerkLoaded || loading,
    clerkUser,
    session,
    signOut,
    isAuthenticated: Boolean(clerkUser && session?.authenticated),
  };
}

/**
 * Check if Clerk is configured and available
 */
export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}
