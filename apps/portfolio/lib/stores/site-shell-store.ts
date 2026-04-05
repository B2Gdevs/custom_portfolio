'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StateStorage } from 'zustand/middleware';

/** Legacy key before `portfolio-site-shell` persisted JSON. */
const LEGACY_SIDEBAR_KEY = 'site-sidebar-collapsed';

export const SITE_SHELL_STORE_NAME = 'portfolio-site-shell';

type SiteShellState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
};

function noopStorage(): StateStorage {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

export const useSiteShellStore = create<SiteShellState>()(
  persist(
    immer((set) => ({
      sidebarCollapsed: true,
      setSidebarCollapsed: (v) =>
        set((draft) => {
          draft.sidebarCollapsed = v;
        }),
    })),
    {
      name: SITE_SHELL_STORE_NAME,
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') return noopStorage();
        return {
          getItem: (name) => {
            let raw = localStorage.getItem(name);
            if (!raw) {
              const legacy = localStorage.getItem(LEGACY_SIDEBAR_KEY);
              if (legacy !== null) {
                raw = JSON.stringify({
                  state: { sidebarCollapsed: legacy === 'true' },
                  version: 0,
                });
              }
            }
            return raw;
          },
          setItem: (name, value) => localStorage.setItem(name, value),
          removeItem: (name) => localStorage.removeItem(name),
        };
      }),
    },
  ),
);

/** Subscribe once persist has rehydrated from localStorage (SSR-safe default first). */
export function useSiteShellHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    typeof window !== 'undefined' && useSiteShellStore.persist.hasHydrated(),
  );
  useEffect(() => {
    const unsub = useSiteShellStore.persist.onFinishHydration(() => setHydrated(true));
    queueMicrotask(() => {
      if (useSiteShellStore.persist.hasHydrated()) setHydrated(true);
    });
    return unsub;
  }, []);
  return hydrated;
}
