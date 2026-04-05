'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Listen index aside + hero panel gradient (shared with `ListenIndexClient` + discovery skeleton). */
export const LISTEN_DISCOVERY_PANEL_CLASS =
  'bg-[radial-gradient(circle_at_top_left,rgba(103,147,186,0.18),transparent_45%),rgba(19,23,29,0.88)]';

/**
 * Shared two-column shell for blog/projects/listen discovery pages:
 * sticky filter rail + main column. Section accents go on `asidePanelClassName` / hero `panelClassName`.
 */
export function DiscoveryIndexLayout({
  asidePanelClassName,
  aside,
  children,
}: {
  asidePanelClassName: string;
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <aside
        className={cn(
          'sticky top-24 hidden h-fit w-72 shrink-0 rounded-[2rem] border border-border/70 p-5 lg:block',
          asidePanelClassName
        )}
      >
        {aside}
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Top “hero” card: title row, search, and meta strip — shared chrome for discovery indexes. */
export function DiscoveryHeroPanel({
  panelClassName,
  top,
  metaRow,
}: {
  panelClassName: string;
  top: ReactNode;
  metaRow: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-border/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]',
        panelClassName
      )}
    >
      {top}
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-text-muted">{metaRow}</div>
    </div>
  );
}
