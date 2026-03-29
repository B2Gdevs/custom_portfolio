'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { RepoPlannerCockpitClient } from '@/components/repo-planner/RepoPlannerCockpitClient';
import { bookContextFromModalPayload } from '@/lib/repo-planner/book-planning-context';
import type { ModalShellProps } from '@/lib/modal-types';
import { cn } from '@/lib/utils';

export function RepoPlannerModal({ onClose, payload }: ModalShellProps) {
  const bookContext = bookContextFromModalPayload(payload);
  const wide = bookContext?.embedReader === true;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Repo Planner cockpit"
        className={cn(
          'relative z-[201] flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-dark-alt shadow-[0_24px_80px_rgba(0,0,0,0.55)]',
          wide ? 'max-w-6xl xl:max-w-[88rem]' : 'max-w-6xl'
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border/80 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Repo Planner</p>
            <h2 className="font-display text-xl text-primary sm:text-2xl">Planning cockpit</h2>
            <p className="mt-1 max-w-2xl text-xs text-text-muted sm:text-sm">
              Same client as{' '}
              <Link href="/apps/repo-planner" className="text-accent underline" onClick={onClose}>
                Apps - Repo Planner
              </Link>
              . From the reader you can open this modal with the book&apos;s planning links and an embedded EPUB tab.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-border p-2 text-text-muted transition hover:border-accent hover:text-primary"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
          <RepoPlannerCockpitClient bookContext={bookContext} />
        </div>
      </div>
    </div>
  );
}
