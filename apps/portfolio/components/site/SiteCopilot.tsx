'use client';

import {
  AssistantRuntimeProvider,
  type ChatModelRunOptions,
  useLocalRuntime,
} from '@assistant-ui/react';
import { AnimatePresence } from 'framer-motion';
import { useCallback, useState } from 'react';
import { SiteCopilotChatPanel } from './SiteCopilotChatPanel';
import { useSiteCopilot } from './SiteCopilotContext';
import type { SiteCopilotSourceBundle } from './SiteCopilotSources';
import {
  extractLatestUserQuery,
  isAppCoverImageContext,
  normalizeConversation,
  previewText,
  type AssistantUiMessageLike,
} from './site-copilot-chat-utils';
import { createLogger } from '@/lib/logging';
import type { RagSearchHit } from '@/lib/rag/types';
import type { SiteChatApiResponse } from '@/lib/site-chat';
import type { MediaGenerateResponse } from '@/lib/site-media';

const CHAT_LOGGER = createLogger('chat.ui', { runtime: 'client' });

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
            credentials: 'include',
            signal: abortSignal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: query,
              mediaSlot: coverImageContext,
              useMagicbornStyle: true,
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

      <AnimatePresence>
        {isOpen ? (
          <SiteCopilotChatPanel
            key="site-copilot-panel"
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
      </AnimatePresence>
    </AssistantRuntimeProvider>
  );
}
