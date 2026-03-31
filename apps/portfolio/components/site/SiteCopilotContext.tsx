'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type SiteCopilotContextValue = {
  isOpen: boolean;
  /**
   * When set (e.g. `app-cover:reader` from an app tile), the composer sends prompts to **image generation**
   * instead of RAG chat. Cleared on close or plain Open Chat.
   */
  coverImageContext: string | null;
  openChat: () => void;
  openChatForCoverImage: (contextId: string) => void;
  closeChat: () => void;
};

const SiteCopilotContext = createContext<SiteCopilotContextValue | null>(null);

export function SiteCopilotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coverImageContext, setCoverImageContext] = useState<string | null>(null);

  const openChat = useCallback(() => {
    setCoverImageContext(null);
    setIsOpen(true);
  }, []);

  const openChatForCoverImage = useCallback((contextId: string) => {
    setCoverImageContext(contextId.trim() || null);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setCoverImageContext(null);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      coverImageContext,
      openChat,
      openChatForCoverImage,
      closeChat,
    }),
    [isOpen, coverImageContext, openChat, openChatForCoverImage, closeChat],
  );

  return (
    <SiteCopilotContext.Provider value={value}>{children}</SiteCopilotContext.Provider>
  );
}

export function useSiteCopilot(): SiteCopilotContextValue {
  const ctx = useContext(SiteCopilotContext);
  if (!ctx) {
    throw new Error('useSiteCopilot must be used within SiteCopilotProvider');
  }
  return ctx;
}

/** Safe when site chat is disabled and the provider is not mounted. */
export function useSiteCopilotOptional(): SiteCopilotContextValue | null {
  return useContext(SiteCopilotContext);
}
