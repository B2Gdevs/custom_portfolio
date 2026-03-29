'use client';

import { cn } from '@/lib/utils';

/**
 * Thin host for the planning cockpit: layout chrome only. Features live in
 * {@link PlanningCockpitDashboard} and the vendored cockpit / placeholders.
 */
export function RepoPlannerWorkspaceShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'planning-cockpit-host min-h-0 w-full rounded-2xl border border-border/80 bg-dark-alt/20',
        className,
      )}
    >
      {children}
    </div>
  );
}
