'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Nav from './Nav';
import type { NavMenuSection } from '@/lib/site-menus';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const SIDEBAR_COLLAPSED_KEY = 'site-sidebar-collapsed';

export function SiteLayout({
  children,
  navMenus,
}: {
  children: React.ReactNode;
  navMenus: NavMenuSection[];
}) {
  const pathname = usePathname();
  const isReaderAppRoute =
    pathname === '/apps/reader' || (pathname?.startsWith('/apps/reader/') ?? false);
  const isBookReadRoute = isReaderAppRoute;
  const isImmersiveReader = isReaderAppRoute;
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isReaderAppRoute);
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
    const nextCollapsed = savedPreference ? savedPreference === 'true' : isImmersiveReader;
    const frame = window.requestAnimationFrame(() => {
      setSidebarCollapsed(nextCollapsed);
      setSidebarReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isImmersiveReader, sidebarReady]);

  useEffect(() => {
    if (!sidebarReady || typeof window === 'undefined') return;
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed, sidebarReady]);

  return (
    <TooltipProvider delay={0}>
      <SidebarProvider
        open={!sidebarCollapsed}
        onOpenChange={(open) => setSidebarCollapsed(!open)}
        className="min-h-svh w-full"
        style={
          {
            '--sidebar-width': '20rem',
            '--sidebar-width-icon': '5.5rem',
          } as React.CSSProperties
        }
      >
        <Nav navMenus={navMenus} />
        <SidebarInset
          className={cn(
            'min-h-svh bg-transparent',
            isBookReadRoute ? 'lg:h-screen lg:overflow-hidden' : ''
          )}
        >
          <div className={cn('flex min-h-svh flex-col', isReaderAppRoute ? 'lg:h-full lg:min-h-0' : '')}>
            <main className="min-h-0 flex-1">{children}</main>
            {!isReaderAppRoute ? (
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
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
