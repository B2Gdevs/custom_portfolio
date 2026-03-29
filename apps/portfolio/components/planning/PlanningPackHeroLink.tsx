'use client';

import { Layers } from 'lucide-react';
import { PLANNING_PACK_MODAL_ID } from '@/lib/modal-ids';
import { useModalStore } from '@/stores/modalStore';

export function PlanningPackHeroLink() {
  const openModal = useModalStore((s) => s.openModal);

  return (
    <button
      type="button"
      onClick={() => openModal(PLANNING_PACK_MODAL_ID)}
      className="inline-flex items-center gap-2 text-sm font-medium text-text-muted underline decoration-border/80 underline-offset-4 transition hover:text-accent"
    >
      <Layers size={16} />
      Planning templates and exports
    </button>
  );
}
