'use client';

import {
  AssistantRuntimeProvider,
  type ChatModelRunOptions,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
  useLocalRuntime,
} from '@assistant-ui/react';
import { DevToolsFrame } from '@assistant-ui/react-devtools';
import { ArrowUp, Plus, Wrench, X } from 'lucide-react';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';
import { SiteCopilotSources, type SiteCopilotSourceBundle } from './SiteCopilotSources';
import { useSiteCopilot } from './SiteCopilotContext';
import { createLogger } from '@/lib/logging';
import type { RagSearchHit } from '@/lib/rag/types';
import type {
  SiteChatApiResponse,
  SiteChatConversationMessage,
} from '@/lib/site-chat';
import type { MediaGenerateResponse } from '@/lib/site-media';

interface AssistantUiMessagePart {
  type?: string;
  text?: string;
}

interface AssistantUiMessageLike {
  role?: string;
  content?: string | readonly AssistantUiMessagePart[];
}

interface AssistantTurnSourcesProps {
  pendingBundle: SiteCopilotSourceBundle | null;
  setPendingBundle: Dispatch<SetStateAction<SiteCopilotSourceBundle | null>>;
  sourcesByMessageId: Record<string, SiteCopilotSourceBundle>;
  setSourcesByMessageId: Dispatch<SetStateAction<Record<string, SiteCopilotSourceBundle>>>;
  sourcesLoading: boolean;
}

const CHAT_TITLE = 'Chat';
const CHAT_INTRO = 'Ask about the books, music, projects, or Magicborn.';
const DEVTOOLS_ENABLED = process.env.NODE_ENV === 'development';
const CHAT_LOGGER = createLogger('chat.ui', { runtime: 'client' });

function joinMessageText(content: AssistantUiMessageLike['content']) {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((part) => (part?.type === 'text' && typeof part.text === 'string' ? part.text : ''))
    .join('')
    .trim();
}

function normalizeConversation(messages: readonly AssistantUiMessageLike[] | undefined) {
  return (messages ?? [])
    .map((message) => {
      const role = message?.role;
      const content = joinMessageText(message?.content);
      if (!role || !content) {
        return null;
      }

      if (role !== 'user' && role !== 'assistant' && role !== 'system') {
        return null;
      }

      return {
        role,
        content,
      } satisfies SiteChatConversationMessage;
    })
    .filter((message): message is SiteChatConversationMessage => Boolean(message));
}

function extractLatestUserQuery(messages: SiteChatConversationMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === 'user' && message.content.trim()) {
      return message.content.trim();
    }
  }

  return '';
}

function previewText(value: string, limit = 140) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit)}...`;
}

function AssistantTurnSources({
  pendingBundle,
  setPendingBundle,
  setSourcesByMessageId,
  sourcesByMessageId,
  sourcesLoading,
}: AssistantTurnSourcesProps) {
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

function ClaudeChatMessage(props: AssistantTurnSourcesProps) {
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
  const modeHint = coverLabel ? 'OpenAI Images · cover' : 'OpenAI + site RAG';

  return (
    <ComposerPrimitive.Root className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-[1.75rem] border border-[#ded9cf] bg-white/96 p-3 shadow-[0_24px_80px_rgba(39,28,18,0.12)] dark:border-[#39342d] dark:bg-[#1f1e1b]/96">
      <ComposerPrimitive.Input
        aria-label="Type a message..."
        placeholder={placeholder}
        className="min-h-24 w-full resize-none bg-transparent px-2 py-1 font-serif text-base leading-7 text-[#1d1815] outline-none placeholder:text-[#8f8376] dark:text-[#f3eee5] dark:placeholder:text-[#92887c]"
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

interface ClaudePanelProps extends AssistantTurnSourcesProps {
  coverImageContext: string | null;
  isDevtoolsOpen: boolean;
  onClose: () => void;
  onOpenDevtools: () => void;
  onCloseDevtools: () => void;
}

function ClaudePanel({
  coverImageContext,
  isDevtoolsOpen,
  onClose,
  onOpenDevtools,
  onCloseDevtools,
  ...sourceProps
}: ClaudePanelProps) {
  const coverLabel = appCoverLabelFromContext(coverImageContext);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-[rgba(24,17,12,0.28)] p-3 backdrop-blur-[2px] sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={CHAT_TITLE}
        className={[
          'grid h-[min(44rem,calc(100vh-1.5rem))] w-full overflow-hidden rounded-[2rem] border border-[#d9cfbf] bg-[#f4efe6] shadow-[0_28px_90px_rgba(24,18,13,0.24)] dark:border-[#343029] dark:bg-[#26231f]',
          isDevtoolsOpen
            ? 'max-w-[min(84rem,calc(100vw-1.5rem))] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_26rem]'
            : 'max-w-[min(54rem,calc(100vw-1.5rem))] grid-cols-1',
        ].join(' ')}
      >
        <div className="flex min-h-0 flex-col bg-[radial-gradient(circle_at_top,#fffaf1_0%,#f4efe6_55%,#ece4d7_100%)] dark:bg-[radial-gradient(circle_at_top,#37312a_0%,#26231f_56%,#1e1b17_100%)]">
          <header className="flex items-center justify-between gap-3 border-b border-[#ddd3c5] px-5 py-4 dark:border-[#3b362f]">
            <div>
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
            <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}

function isAppCoverImageContext(contextId: string | null): contextId is string {
  return Boolean(contextId?.startsWith('app-cover:'));
}

export function SiteCopilot() {
  const { isOpen, openChat, closeChat, coverImageContext } = useSiteCopilot();
  const [isDevtoolsOpen, setIsDevtoolsOpen] = useState(false);
  const [pendingBundle, setPendingBundle] = useState<SiteCopilotSourceBundle | null>(null);
  const [sourcesByMessageId, setSourcesByMessageId] = useState<Record<string, SiteCopilotSourceBundle>>({});
  const [sourcesLoading, setSourcesLoading] = useState(false);

  const runChatModel = useCallback(
    async ({ abortSignal, messages = [] }: ChatModelRunOptions) => {
      const conversation = normalizeConversation(messages as readonly AssistantUiMessageLike[]);
      const query = extractLatestUserQuery(conversation);
      const startedAt = Date.now();

      if (!query) {
        CHAT_LOGGER.debug('chat send skipped because there was no user query', {
          normalizedMessageCount: conversation.length,
        });
        setPendingBundle(null);
        setSourcesLoading(false);
        return {
          content: [{ type: 'text' as const, text: 'Ask a question about the public site first.' }],
          status: { type: 'complete' as const, reason: 'stop' as const },
        };
      }

      if (isAppCoverImageContext(coverImageContext)) {
        setPendingBundle(null);
        setSourcesLoading(false);
        CHAT_LOGGER.info('cover image generate started', {
          queryPreview: previewText(query),
          coverImageContext,
        });
        try {
          const response = await fetch('/api/media/generate', {
            method: 'POST',
            signal: abortSignal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: query,
              mediaSlot: coverImageContext,
            }),
          });
          const data = (await response.json().catch(() => null)) as MediaGenerateResponse | null;
          if (!response.ok || !data || data.ok !== true) {
            const message =
              data && 'ok' in data && data.ok === false && typeof data.message === 'string'
                ? data.message
                : 'Image generation failed.';
            const error = new Error(message) as Error & { status?: number };
            error.status = response.status;
            throw error;
          }
          const src = `data:image/png;base64,${data.b64Json}`;
          const caption =
            typeof data.revisedPrompt === 'string' && data.revisedPrompt.trim()
              ? data.revisedPrompt.trim()
              : 'Here is a draft cover image. Adjust your next message to iterate.';
          CHAT_LOGGER.info('cover image generate completed', {
            elapsedMs: Date.now() - startedAt,
            model: data.model,
          });
          return {
            content: [
              { type: 'image' as const, image: src },
              { type: 'text' as const, text: caption },
            ],
            status: { type: 'complete' as const, reason: 'stop' as const },
          };
        } catch (error) {
          CHAT_LOGGER.error('cover image generate threw', {
            elapsedMs: Date.now() - startedAt,
            error,
          });
          throw error;
        }
      }

      setSourcesLoading(true);
      CHAT_LOGGER.info('chat send started', {
        normalizedMessageCount: conversation.length,
        queryPreview: previewText(query),
      });
      CHAT_LOGGER.debug('chat conversation payload', {
        conversation,
      });

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          signal: abortSignal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: conversation }),
        });
        const requestId = response.headers.get('x-portfolio-request-id');

        const data = (await response.json().catch(() => null)) as SiteChatApiResponse | { message?: string } | null;
        if (!response.ok) {
          const message =
            typeof data === 'object' && data && 'message' in data && typeof data.message === 'string'
              ? data.message
              : 'The site chat request failed.';
          const error = new Error(message) as Error & { status?: number };
          error.status = response.status;
          (error as Error & { requestId?: string | null }).requestId = requestId;
          throw error;
        }

        const hits = Array.isArray((data as SiteChatApiResponse)?.hits)
          ? ((data as SiteChatApiResponse).hits as RagSearchHit[])
          : [];

        setPendingBundle({
          query,
          hits,
        });
        CHAT_LOGGER.info('chat send completed', {
          elapsedMs: Date.now() - startedAt,
          hitCount: hits.length,
          model: (data as SiteChatApiResponse)?.model ?? null,
          requestId,
        });
        CHAT_LOGGER.debug('chat send response bundle', {
          queryPreview: previewText(query),
          hits: hits.map((hit) => ({
            chunkId: hit.chunkId,
            sourceId: hit.sourceId,
            title: hit.title,
            heading: hit.heading,
            publicUrl: hit.publicUrl,
          })),
        });

        return {
          content: [
            {
              type: 'text' as const,
              text:
                (data as SiteChatApiResponse)?.text?.trim() ||
                'I could not produce an answer from the current public-site context.',
            },
          ],
          status: { type: 'complete' as const, reason: 'stop' as const },
        };
      } catch (error) {
        CHAT_LOGGER.error('chat send threw', {
          elapsedMs: Date.now() - startedAt,
          status:
            typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
              ? error.status
              : null,
          requestId:
            typeof error === 'object' &&
            error &&
            'requestId' in error &&
            (typeof error.requestId === 'string' || error.requestId === null)
              ? error.requestId
              : null,
          error,
        });
        throw error;
      } finally {
        setSourcesLoading(false);
      }
    },
    [coverImageContext],
  );

  const runtime = useLocalRuntime(
    {
      run: runChatModel,
    },
    {},
  );

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <button
        type="button"
        onClick={openChat}
        className="inline-flex items-center gap-2 rounded-full border border-[#d6c8b3] bg-[#f7f0e2]/96 px-4 py-3 font-serif text-sm text-[#2a2119] shadow-[0_18px_44px_rgba(34,22,14,0.16)] transition hover:-translate-y-0.5 hover:bg-[#fbf5ea] dark:border-[#3a332c] dark:bg-[#211d19]/96 dark:text-[#f5ecdf] dark:hover:bg-[#2a2520]"
      >
        Open Chat
      </button>

      {isOpen ? (
        <ClaudePanel
          coverImageContext={coverImageContext}
          pendingBundle={pendingBundle}
          setPendingBundle={setPendingBundle}
          setSourcesByMessageId={setSourcesByMessageId}
          sourcesByMessageId={sourcesByMessageId}
          sourcesLoading={sourcesLoading}
          isDevtoolsOpen={isDevtoolsOpen}
          onClose={() => {
            closeChat();
            setIsDevtoolsOpen(false);
          }}
          onOpenDevtools={() => setIsDevtoolsOpen(true)}
          onCloseDevtools={() => setIsDevtoolsOpen(false)}
        />
      ) : null}
    </AssistantRuntimeProvider>
  );
}
