'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Nav from './Nav';
import type { NavMenuSection } from '@/lib/site-menus';

const SIDEBAR_COLLAPSED_KEY = 'site-sidebar-collapsed';

export function ConditionalLayout({
  children,
  navMenus,
}: {
  children: React.ReactNode;
  navMenus: NavMenuSection[];
}) {
  const pathname = usePathname();
  const isDialogueForge = pathname?.startsWith('/dialogue-forge');
  const isBookReadRoute = /^\/books\/[^/]+\/read$/.test(pathname ?? '');
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isBookReadRoute);
  const [sidebarReady, setSidebarReady] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    const activateScrollbars = () => {
      root.classList.add('scrollbars-active');
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        root.classList.remove('scrollbars-active');
      }, 700);
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'PageDown' ||
        event.key === 'PageUp' ||
        event.key === 'Home' ||
        event.key === 'End' ||
        event.key === ' '
      ) {
        activateScrollbars();
      }
    };

    window.addEventListener('scroll', activateScrollbars, { passive: true });
    window.addEventListener('wheel', activateScrollbars, { passive: true });
    window.addEventListener('touchmove', activateScrollbars, { passive: true });
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('scroll', activateScrollbars);
      window.removeEventListener('wheel', activateScrollbars);
      window.removeEventListener('touchmove', activateScrollbars);
      window.removeEventListener('keydown', handleKeydown);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      root.classList.remove('scrollbars-active');
    };
  }, []);

  useEffect(() => {
    if (sidebarReady || typeof window === 'undefined') return;

    const savedPreference = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    const nextCollapsed = savedPreference ? savedPreference === 'true' : isBookReadRoute;
    const frame = window.requestAnimationFrame(() => {
      setSidebarCollapsed(nextCollapsed);
      setSidebarReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isBookReadRoute, sidebarReady]);

  useEffect(() => {
    if (!sidebarReady || typeof window === 'undefined') return;
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed, sidebarReady]);

  if (isDialogueForge) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid"
      style={{
        gridTemplateColumns: sidebarCollapsed ? '88px minmax(0, 1fr)' : '320px minmax(0, 1fr)',
      }}
    >
      <Nav
        navMenus={navMenus}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />
      <div className={`flex min-h-screen flex-col ${isBookReadRoute ? 'lg:h-screen lg:overflow-hidden' : ''}`}>
        <main className="flex-1 min-h-0">{children}</main>
        {!isBookReadRoute ? (
          <footer className="mt-16 border-t border-border/80 bg-dark-alt/80 py-10">
            <div className="mx-auto max-w-7xl px-6 text-center">
              <p className="font-display text-2xl text-primary">Ben Garrard</p>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] text-text-muted">
                Fiction, songs, and the systems underneath them
              </p>
              <p className="mt-4 text-sm text-text-muted">
                &copy; {new Date().getFullYear()} Built with Next.js, MDX, EPUB tooling, and a growing archive.
              </p>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
