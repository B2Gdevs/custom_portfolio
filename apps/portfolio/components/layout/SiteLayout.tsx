'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Nav from './Nav';
import type { NavMenuSection } from '@/lib/site-menus';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { isImmersiveAppsRoute } from '@/lib/app-routes';

const SIDEBAR_COLLAPSED_KEY = 'site-sidebar-collapsed';

export function SiteLayout({
  children,
  navMenus,
  siteLogoSrc,
}: {
  children: React.ReactNode;
  navMenus: NavMenuSection[];
  /** Payload active brand logo URL; omit to use static `/logo.svg`. */
  siteLogoSrc?: string | null;
}) {
  const pathname = usePathname();
  const isImmersiveApp = isImmersiveAppsRoute(pathname);
  const isBookReadRoute = isImmersiveApp;
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isImmersiveApp);
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
    /** Default: icon rail (collapsed) on first visit; reader routes stay collapsed. */
    const nextCollapsed = savedPreference ? savedPreference === 'true' : true;
    const frame = window.requestAnimationFrame(() => {
      setSidebarCollapsed(nextCollapsed);
      setSidebarReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isImmersiveApp, sidebarReady]);

  useEffect(() => {
    if (!sidebarReady || typeof window === 'undefined') return;
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed, sidebarReady]);

  /** Immersive apps (reader, screenshot-annotate) mount their own chrome; site sidebar is not mounted (see Nav). */
  const siteSidebarOpen = !isImmersiveApp && !sidebarCollapsed;

  return (
    <TooltipProvider delay={0}>
      <SidebarProvider
        {...(isImmersiveApp
          ? { defaultOpen: false }
          : {
              open: siteSidebarOpen,
              onOpenChange: (open: boolean) => setSidebarCollapsed(!open),
            })}
        className="min-h-svh w-full"
        style={
          {
            '--sidebar-width': '20rem',
            '--sidebar-width-icon': '5.5rem',
          } as React.CSSProperties
        }
      >
        <Nav
          navMenus={navMenus}
          siteLogoSrc={siteLogoSrc}
          portfolioSidebarHoverHandlers={
            !isImmersiveApp && sidebarCollapsed
              ? {
                  /** Expand and persist open until user hits collapse (no expand control when rail is icon-only). */
                  onMouseEnter: () => setSidebarCollapsed(false),
                }
              : undefined
          }
        />
        <SidebarInset
          className={cn(
            'min-h-svh',
            isImmersiveApp ? 'bg-background' : 'bg-transparent',
            /** Immersive apps: bound to viewport so inner `h-full` resolves. */
            isBookReadRoute ? 'h-svh min-h-0 overflow-hidden' : ''
          )}
        >
          <div
            className={cn(
              'flex flex-col',
              isImmersiveApp ? 'h-full min-h-0 flex-1 overflow-hidden' : 'min-h-svh',
            )}
          >
            <div
              className={cn(
                'min-h-0 flex-1',
                isImmersiveApp ? 'flex min-h-0 flex-col overflow-hidden' : '',
              )}
            >
              {children}
            </div>
            {!isImmersiveApp ? (
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
