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

async function loadAuthSession({
  setLoading,
  setSession,
  withLoadingSpinner,
}: {
  setLoading: (value: boolean) => void;
  setSession: (value: AuthSessionResponseBody['session'] | null) => void;
  withLoadingSpinner: boolean;
}) {
  if (withLoadingSpinner) {
    setLoading(true);
  }
  try {
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
  const firstPathnameLoadRef = useRef(true);

  async function runReload() {
    await loadAuthSession({
      setLoading,
      setSession,
      withLoadingSpinner: true,
    });
  }

  async function logout() {
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
    });
  }, [pathname]);

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
