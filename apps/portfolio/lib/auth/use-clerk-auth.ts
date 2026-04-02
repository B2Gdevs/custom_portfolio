'use client';

import { useEffect, useState } from 'react';
import type { AuthSessionResponseBody } from './client';

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

  // Load Clerk user
  useEffect(() => {
    async function loadClerkUser() {
      try {
        const clerk = await import('@clerk/nextjs');

        // Check if we're in a browser context with Clerk loaded
        if (typeof window !== 'undefined' && (window as any).__clerk_frontend_api) {
          const clerkInstance = (window as any).Clerk;
          if (clerkInstance?.user) {
            const user = clerkInstance.user;
            setClerkUser({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
            });
          }
        }
        setClerkLoaded(true);
      } catch {
        // Clerk not available
        setClerkLoaded(true);
      }
    }

    loadClerkUser();

    // Listen for Clerk user changes
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).Clerk?.user) {
        const user = (window as any).Clerk.user;
        setClerkUser((prev) => {
          if (prev?.id !== user.id) {
            return {
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
            };
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load Payload session when Clerk user is available
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
          { credentials: 'include' }
        );
        const body = await response.json();

        if (body.ok) {
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

    loadPayloadSession();
  }, [clerkUser, clerkLoaded]);

  async function signOut() {
    try {
      const clerk = (window as any).Clerk;
      if (clerk) {
        await clerk.signOut();
      }
    } catch {
      // Ignore errors
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
