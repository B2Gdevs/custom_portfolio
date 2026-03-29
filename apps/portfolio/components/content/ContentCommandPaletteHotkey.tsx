'use client';

import { useEffect } from 'react';
import { CONTENT_SEARCH_MODAL_ID } from '@/lib/modal-ids';
import { useModalStore } from '@/stores/modalStore';

export function ContentCommandPaletteHotkey() {
  const openModal = useModalStore((state) => state.openModal);
  const activeId = useModalStore((state) => state.activeId);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      const tag = target.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select';
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') {
        const printableKey =
          event.key.length === 1 &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          !isEditableTarget(event.target);

        if (!printableKey || activeId === CONTENT_SEARCH_MODAL_ID) {
          return;
        }

        event.preventDefault();
        openModal(CONTENT_SEARCH_MODAL_ID, { initialQuery: event.key });
        return;
      }

      event.preventDefault();

      if (activeId === CONTENT_SEARCH_MODAL_ID) {
        return;
      }

      openModal(CONTENT_SEARCH_MODAL_ID);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeId, openModal]);

  return null;
}
