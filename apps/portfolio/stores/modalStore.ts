import { create } from 'zustand';
import type { KnownModalId } from '@/lib/modal-ids';

type ModalPayload = Record<string, unknown> | undefined;

type ModalState = {
  activeId: KnownModalId | null;
  payload: ModalPayload;
  openModal: (id: KnownModalId, payload?: ModalPayload) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  activeId: null,
  payload: undefined,
  openModal: (id, payload) => set({ activeId: id, payload }),
  closeModal: () => set({ activeId: null, payload: undefined }),
}));
