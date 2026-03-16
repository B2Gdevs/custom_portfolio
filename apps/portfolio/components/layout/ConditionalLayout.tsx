'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Nav from './Nav';
import type { NavMenuSection } from '@/lib/site-menus';

export function ConditionalLayout({
  children,
  navMenus,
}: {
  children: React.ReactNode;
  navMenus: NavMenuSection[];
}) {
  const pathname = usePathname();
  const isDialogueForge = pathname?.startsWith('/dialogue-forge');
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  if (isDialogueForge) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
      <Nav navMenus={navMenus} />
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-border/80 bg-dark-alt/80 py-10">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="font-display text-2xl text-primary">Ben Garrard</p>
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-text-muted">
              Fiction, songs, and the systems underneath them
            </p>
            <p className="mt-4 text-sm text-text-muted">
              © {new Date().getFullYear()} Built with Next.js, MDX, EPUB tooling, and a growing archive.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
