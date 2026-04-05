'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Default active-state accent when `activeAccentClass` is omitted (listening room / fixed blue). */
const DEFAULT_ACTIVE_ACCENT_CLASS = 'text-[#91b7d8]';

/**
 * Pill control for discovery-style filters (blog, projects, listen).
 * Lives under `components/content/` — not `components/ui/` — so section accents stay composable.
 */
export function DiscoveryTagButton({
  active,
  onClick,
  children,
  activeAccentClass,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  /** Applied when active (e.g. `identity.accentClass` from `ContentIndexClient`). Defaults to listen-room blue. */
  activeAccentClass?: string;
}) {
  const accent = activeAccentClass ?? DEFAULT_ACTIVE_ACCENT_CLASS;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition',
        active
          ? cn('border-accent/70 bg-accent/15', accent)
          : 'border-border/70 bg-dark-alt/60 text-text-muted hover:border-border hover:text-primary'
      )}
    >
      {children}
    </button>
  );
}
