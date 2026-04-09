'use client';

import { ContentCommandPaletteModal } from '@/components/content/ContentCommandPaletteModal';
import { PlanningPackModal } from '@/components/modals/planning-pack/PlanningPackModal';
import type { ModalComponent } from '@/lib/modal-types';
import { CONTENT_SEARCH_MODAL_ID } from '@/lib/modal-ids';

export type { ModalShellProps } from '@/lib/modal-types';

/** Stable map for eslint react-hooks/static-components (avoid dynamic <Comp />). */
export const modalComponents: Record<string, ModalComponent> = {
  'planning-pack': PlanningPackModal,
  [CONTENT_SEARCH_MODAL_ID]: ContentCommandPaletteModal,
};

/** Register an additional modal type at module init (e.g. from a feature entry). */
export function registerModal(id: string, Component: ModalComponent) {
  modalComponents[id] = Component;
}
