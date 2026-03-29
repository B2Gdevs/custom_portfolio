'use client';

import { Layers } from 'lucide-react';
import { PLANNING_PACK_MODAL_ID } from '@/lib/modal-ids';
import { useModalStore } from '@/stores/modalStore';

export function PlanningPackSidebarButton({ collapsed }: { collapsed?: boolean }) {
  const openModal = useModalStore((s) => s.openModal);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => openModal(PLANNING_PACK_MODAL_ID)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-dark/60 text-text-muted transition-colors hover:border-[rgba(213,176,131,0.4)] hover:text-primary"
        aria-label="Planning pack"
        title="Planning pack"
      >
        <Layers size={17} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openModal(PLANNING_PACK_MODAL_ID)}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/70 bg-dark/40 px-4 py-2.5 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-primary"
    >
      <Layers size={16} />
      Planning pack
    </button>
  );
}
