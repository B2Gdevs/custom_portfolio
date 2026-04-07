'use client';

import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from '@assistant-ui/react';
import { DevToolsFrame } from '@assistant-ui/react-devtools';
import { motion, useDragControls } from 'framer-motion';
import { ArrowUp, Plus, Wrench, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef } from 'react';
import { SiteCopilotSources, type SiteCopilotSourceBundle } from './SiteCopilotSources';

export interface SiteCopilotChatPanelSourceProps {
  pendingBundle: SiteCopilotSourceBundle | null;
  setPendingBundle: Dispatch<SetStateAction<SiteCopilotSourceBundle | null>>;
  sourcesByMessageId: Record<string, SiteCopilotSourceBundle>;
  setSourcesByMessageId: Dispatch<SetStateAction<Record<string, SiteCopilotSourceBundle>>>;
  sourcesLoading: boolean;
}

const CHAT_TITLE = 'Chat';
const CHAT_INTRO = 'Ask about the books, music, projects, or Magicborn.';
const DEVTOOLS_ENABLED = process.env.NODE_ENV === 'development';

function AssistantTurnSources({
  pendingBundle,
  setPendingBundle,
  setSourcesByMessageId,
  sourcesByMessageId,
  sourcesLoading,
}: SiteCopilotChatPanelSourceProps) {
  const messageId = useAuiState((state) => state.message.id);
  const isAssistant = useAuiState((state) => state.message.role === 'assistant');
  const isLastMessage = useAuiState(
    (state) => state.message.index === state.thread.messages.length - 1,
  );

  useEffect(() => {
    if (!isAssistant || !messageId || !pendingBundle) {
      return;
    }

    setSourcesByMessageId((current) => {
      if (current[messageId]) {
        return current;
      }

      return {
        ...current,
        [messageId]: pendingBundle,
      };
    });

    setPendingBundle((current) => (current === pendingBundle ? null : current));
  }, [
    isAssistant,
    messageId,
    pendingBundle,
    setPendingBundle,
    setSourcesByMessageId,
  ]);

  if (!isAssistant) {
    return null;
  }

  const bundle =
    (messageId ? sourcesByMessageId[messageId] : undefined) ??
    (isLastMessage ? pendingBundle ?? undefined : undefined);

  return (
    <SiteCopilotSources
      bundle={bundle}
      isLoading={isLastMessage && sourcesLoading && !bundle}
    />
  );
}

const messagePartComponents = {
  Image: ({ image }: { image: string }) => (
    <img
      src={image}
      alt="Generated cover image"
      className="max-h-[min(22rem,50vh)] max-w-full rounded-xl border border-[#ded9cf] object-contain dark:border-[#3a372f]"
    />
  ),
};

function ClaudeChatMessage(props: SiteCopilotChatPanelSourceProps) {
  const isUser = useAuiState((state) => state.message.role === 'user');

  return (
    <MessagePrimitive.Root
      className={`mb-4 flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={[
            'rounded-[1.75rem] border px-4 py-3 shadow-sm',
            isUser
              ? 'border-[#d8a46e] bg-[#ae5630] text-white'
              : 'border-[#ded9cf] bg-white/95 text-[#201b18] dark:border-[#3a372f] dark:bg-[#1f1e1b] dark:text-[#f3eee5]',
          ].join(' ')}
        >
          <MessagePrimitive.Parts components={messagePartComponents} />
        </div>
        <AssistantTurnSources {...props} />
      </div>
    </MessagePrimitive.Root>
  );
}

function appCoverLabelFromContext(contextId: string | null): string | null {
  if (!contextId?.startsWith('app-cover:')) {
    return null;
  }
  const id = contextId.slice('app-cover:'.length).trim();
  if (!id) {
    return null;
  }
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function ClaudeEmptyState({ coverImageContext }: { coverImageContext: string | null }) {
  const coverLabel = appCoverLabelFromContext(coverImageContext);
  const isCover = Boolean(coverLabel);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#8e7f72] dark:text-[#b4ab9f]">
        {CHAT_TITLE}
      </p>
      <h2 className="mt-4 font-serif text-3xl text-[#1f1a17] dark:text-[#f3eee5]">
        {isCover ? `Cover for ${coverLabel}` : CHAT_INTRO}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f665f] dark:text-[#c7beb1]">
        {isCover
          ? 'Describe the cover you want and send — the thread will show a generated image. Send again to iterate on the look.'
          : 'This assistant only answers from public portfolio material and retrieved site context.'}
      </p>
    </div>
  );
}

function ClaudeComposer({ coverImageContext }: { coverImageContext: string | null }) {
  const coverLabel = appCoverLabelFromContext(coverImageContext);
  const placeholder = coverLabel
    ? `Describe the ${coverLabel} cover image…`
    : 'How can I help you today?';
  const modeHint = coverLabel ? 'Cover image' : 'Site search · assistant';

  return (
    <ComposerPrimitive.Root className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-[1.75rem] border border-[#ded9cf] bg-white/96 p-3 shadow-[0_24px_80px_rgba(39,28,18,0.12)] transition-[box-shadow] duration-300 ease-out focus-within:shadow-[0_28px_90px_rgba(39,28,18,0.18)] dark:border-[#39342d] dark:bg-[#1f1e1b]/96 dark:focus-within:shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
      <ComposerPrimitive.Input
        aria-label="Type a message..."
        placeholder={placeholder}
        minRows={2}
        maxRows={9}
        style={{ transition: 'height 0.22s ease-out' }}
        className="w-full resize-none overflow-y-auto bg-transparent px-2 py-1 font-serif text-base leading-7 text-[#1d1815] outline-none placeholder:text-[#8f8376] dark:text-[#f3eee5] dark:placeholder:text-[#92887c]"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ComposerPrimitive.AddAttachment
            aria-label="Add attachment"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ddd3c8] text-[#77685d] transition hover:bg-[#f2ede4] dark:border-[#3b362f] dark:text-[#d3c8ba] dark:hover:bg-[#2a2723]"
          >
            <Plus className="h-4 w-4" />
          </ComposerPrimitive.AddAttachment>
          <span className="text-xs uppercase tracking-[0.24em] text-[#8b7c6f] dark:text-[#b7aea3]">
            {modeHint}
          </span>
        </div>
        <ComposerPrimitive.Send
          aria-label="Send message"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ae5630] text-white transition hover:bg-[#c4633a]"
        >
          <ArrowUp className="h-4 w-4" />
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
}

interface SiteCopilotChatPanelProps extends SiteCopilotChatPanelSourceProps {
  coverImageContext: string | null;
  isDevtoolsOpen: boolean;
  onClose: () => void;
  onOpenDevtools: () => void;
  onCloseDevtools: () => void;
}

export function SiteCopilotChatPanel({
  coverImageContext,
  isDevtoolsOpen,
  onClose,
  onOpenDevtools,
  onCloseDevtools,
  ...sourceProps
}: SiteCopilotChatPanelProps) {
  const coverLabel = appCoverLabelFromContext(coverImageContext);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  return (
    <motion.div
      ref={constraintsRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] pointer-events-auto"
    >
      <div
        className="absolute inset-0 bg-[rgba(24,17,12,0.28)] backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={CHAT_TITLE}
        drag
        dragConstraints={constraintsRef}
        dragControls={dragControls}
        dragElastic={0}
        dragListener={false}
        dragMomentum={false}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={[
          'absolute bottom-3 right-3 grid h-[min(44rem,calc(100vh-1.5rem))] w-full overflow-hidden rounded-[2rem] border border-[#d9cfbf] bg-[#f4efe6] shadow-[0_28px_90px_rgba(24,18,13,0.24)] dark:border-[#343029] dark:bg-[#26231f] sm:bottom-6 sm:right-6',
          isDevtoolsOpen
            ? 'max-w-[min(84rem,calc(100vw-1.5rem))] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_26rem]'
            : 'max-w-[min(54rem,calc(100vw-1.5rem))] grid-cols-1',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-0 flex-col bg-[radial-gradient(circle_at_top,#fffaf1_0%,#f4efe6_55%,#ece4d7_100%)] dark:bg-[radial-gradient(circle_at_top,#37312a_0%,#26231f_56%,#1e1b17_100%)]">
          <header className="flex items-center justify-between gap-3 border-b border-[#ddd3c5] px-5 py-4 dark:border-[#3b362f]">
            <div
              className="min-w-0 flex-1 cursor-grab touch-none select-none active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#8b7b6d] dark:text-[#b2a899]">
                Assistant UI
              </p>
              <h2 className="mt-1 font-serif text-xl text-[#1d1815] dark:text-[#f3eee5]">
                {CHAT_TITLE}
              </h2>
              {coverLabel ? (
                <p className="mt-1 text-xs text-[#7a6e62] dark:text-[#a69b8e]">
                  Cover context: {coverLabel}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {DEVTOOLS_ENABLED ? (
                <button
                  type="button"
                  onClick={isDevtoolsOpen ? onCloseDevtools : onOpenDevtools}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#ddd3c5] px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#6f6155] transition hover:bg-[#ede5d8] dark:border-[#3b362f] dark:text-[#d4c8ba] dark:hover:bg-[#302b25]"
                >
                  <Wrench className="h-4 w-4" />
                  {isDevtoolsOpen ? 'Hide Devtools' : 'Show Devtools'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ddd3c5] text-[#6f6155] transition hover:bg-[#ede5d8] dark:border-[#3b362f] dark:text-[#d4c8ba] dark:hover:bg-[#302b25]"
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <ThreadPrimitive.Root className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-5 sm:px-5">
            <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto px-1">
              <ThreadPrimitive.Empty>
                <ClaudeEmptyState coverImageContext={coverImageContext} />
              </ThreadPrimitive.Empty>
              <ThreadPrimitive.Messages>{() => <ClaudeChatMessage {...sourceProps} />}</ThreadPrimitive.Messages>
            </ThreadPrimitive.Viewport>
            <div className="pt-4">
              <ClaudeComposer coverImageContext={coverImageContext} />
            </div>
          </ThreadPrimitive.Root>
        </div>

        {DEVTOOLS_ENABLED && isDevtoolsOpen ? (
          <div className="border-t border-[#ddd3c5] bg-[#f7f2e8] p-3 dark:border-[#3b362f] dark:bg-[#221f1b] xl:border-l xl:border-t-0">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#8b7b6d] dark:text-[#b2a899]">
                Runtime Devtools
              </p>
            </div>
            <DevToolsFrame className="h-full min-h-72 w-full rounded-2xl border border-[#ddd3c5] bg-white dark:border-[#3b362f] dark:bg-[#1b1815]" />
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
