'use client';

import { createElement, useEffect } from 'react';
import { useModalStore } from '@/stores/modalStore';
import { modalComponents } from '@/lib/modal-registry';

export function ModalRoot() {
  const activeId = useModalStore((s) => s.activeId);
  const payload = useModalStore((s) => s.payload);
  const closeModal = useModalStore((s) => s.closeModal);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, closeModal]);

  if (!activeId) return null;

  const Comp = modalComponents[activeId];
  if (!Comp) return null;

  return createElement(Comp, { onClose: closeModal, payload });
}
