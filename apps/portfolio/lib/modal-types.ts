import type { ComponentType } from 'react';

export type ModalShellProps = {
  onClose: () => void;
  payload?: Record<string, unknown>;
};

export type ModalComponent = ComponentType<ModalShellProps>;
