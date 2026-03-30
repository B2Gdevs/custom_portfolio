'use client';

import { Layers } from 'lucide-react';
import { PLANNING_PACK_MODAL_ID } from '@/lib/modal-ids';
import { useModalStore } from '@/stores/modalStore';

export function PlanningPackInlineButton({
  label = 'Open the planning pack modal',
}: {
  label?: string;
}) {
  const openModal = useModalStore((s) => s.openModal);

  return (
    <button
      type="button"
      onClick={() => openModal(PLANNING_PACK_MODAL_ID)}
      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-dark-alt/70 px-4 py-2 text-sm font-medium text-primary transition hover:border-accent/60 hover:bg-dark-alt hover:text-accent"
    >
      <Layers size={16} />
      <span>{label}</span>
    </button>
  );
}
