'use client';

import { useEffect } from 'react';
import { CONTENT_SEARCH_MODAL_ID } from '@/lib/modal-ids';
import { useModalStore } from '@/stores/modalStore';

export function ContentCommandPaletteHotkey() {
  const openModal = useModalStore((state) => state.openModal);
  const activeId = useModalStore((state) => state.activeId);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') {
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
