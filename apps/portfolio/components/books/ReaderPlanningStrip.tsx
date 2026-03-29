'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, PanelRight } from 'lucide-react';
import { REPO_PLANNER_MODAL_ID } from '@/lib/modal-ids';
import { MORDREDS_TALE_PLANNING_LINKS, mordredsTaleRepoPlannerModalPayload } from '@/lib/repo-planner/reader-book-modal-payloads';
import { useModalStore } from '@/stores/modalStore';

export function ReaderPlanningStrip({
  bookSlug,
  open,
  onToggle,
}: {
  bookSlug?: string;
  open: boolean;
  onToggle: () => void;
}) {
  const openModal = useModalStore((s) => s.openModal);

  if (bookSlug !== 'mordreds_tale') return null;

  return (
    <div className="shrink-0 border-b border-[rgba(140,102,67,0.14)] bg-[rgba(12,9,7,0.55)]">
      <div className="mx-auto flex max-w-[120rem] flex-wrap items-center justify-between gap-2 px-4 py-2 md:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.28)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(213,176,131,0.88)] transition-colors hover:border-[rgba(213,176,131,0.45)] hover:text-[#fff3e5]"
          >
            <ClipboardList size={14} />
            Planning
          </button>
          <button
            type="button"
            onClick={() => openModal(REPO_PLANNER_MODAL_ID, mordredsTaleRepoPlannerModalPayload())}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.28)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(213,176,131,0.95)] transition-colors hover:border-[rgba(213,176,131,0.5)] hover:text-[#fff3e5]"
          >
            <PanelRight size={14} />
            Planning cockpit
          </button>
        </div>
        <p className="text-[0.65rem] text-[rgba(236,223,204,0.45)]">
          Opens the modular cockpit (uploads + repo pane); optional EPUB tab — no need to leave the reader.
        </p>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[rgba(140,102,67,0.1)]"
          >
            <div className="mx-auto flex max-w-[120rem] flex-wrap gap-2 px-4 py-3 md:px-5">
              {MORDREDS_TALE_PLANNING_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-[rgba(140,102,67,0.2)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-sm text-[rgba(236,223,204,0.88)] transition-colors hover:border-[rgba(213,176,131,0.4)] hover:text-[#fff3e5]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
