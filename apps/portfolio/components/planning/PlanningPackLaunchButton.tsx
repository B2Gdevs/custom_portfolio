'use client';

import { Layers } from 'lucide-react';
import { PLANNING_PACK_MODAL_ID } from '@/lib/modal-ids';
import { useModalStore } from '@/stores/modalStore';
import { cn } from '@/lib/utils';

/**
 * Distinctive planning-pack entry control (gradient ring, teal/ember palette).
 * Use `variant="featured"` on tutorial surfaces; `default` matches legacy pill buttons.
 */
export function PlanningPackLaunchButton({
  label = 'Open planning pack',
  subtitle,
  variant = 'default',
  className,
}: {
  label?: string;
  subtitle?: string;
  variant?: 'default' | 'featured';
  className?: string;
}) {
  const openModal = useModalStore((s) => s.openModal);

  if (variant === 'featured') {
    return (
      <button
        type="button"
        onClick={() => openModal(PLANNING_PACK_MODAL_ID)}
        className={cn(
          'group relative w-full max-w-xl rounded-2xl p-[2px] text-left transition',
          'bg-gradient-to-br from-teal-400/90 via-emerald-600/85 to-amber-600/90',
          'shadow-[0_12px_40px_rgba(13,148,136,0.25)] hover:shadow-[0_16px_48px_rgba(217,119,6,0.22)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
      >
        <span
          className={cn(
            'flex w-full items-start gap-4 rounded-[14px] px-5 py-4',
            'bg-[linear-gradient(145deg,rgba(15,23,22,0.98)_0%,rgba(12,18,20,0.98)_45%,rgba(20,28,26,0.97)_100%)]',
            'border border-teal-500/15',
          )}
        >
          <span
            className={cn(
              'mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              'bg-gradient-to-br from-teal-500/25 to-amber-600/20 text-teal-200',
              'ring-1 ring-teal-400/35 group-hover:from-teal-400/35 group-hover:to-amber-500/25',
            )}
            aria-hidden
          >
            <Layers className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-lg font-semibold tracking-tight text-teal-50">
              {label}
            </span>
            {subtitle ? (
              <span className="mt-1 block text-sm leading-relaxed text-teal-100/75">{subtitle}</span>
            ) : null}
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
              Site export · Markdown mirrors
            </span>
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openModal(PLANNING_PACK_MODAL_ID)}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border/70 bg-dark-alt/70 px-4 py-2 text-sm font-medium text-primary transition hover:border-accent/60 hover:bg-dark-alt hover:text-accent',
        className,
      )}
    >
      <Layers size={16} className="text-teal-400/90" />
      <span>{label}</span>
    </button>
  );
}
