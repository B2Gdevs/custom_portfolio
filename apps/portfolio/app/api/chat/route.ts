import { logChatRuntimeProcessEnvOnce } from '@/lib/chat-runtime-env-log';
import { isCopilotToolsAuthorized } from '@/lib/copilot/copilot-tools-auth';
import { COPILOT_TOOLS_SYSTEM_SUPPLEMENT, runCopilotChatOpenAiLoop } from '@/lib/copilot/openai-chat-tools';
import { buildRagSystemMessage } from '@/lib/rag/chat-context';
import { createLogger } from '@/lib/logging';
import { retrieveRagContext } from '@/lib/rag/retrieve';
import {
  SITE_CHAT_INSTRUCTIONS,
  type SiteChatApiRequest,
  type SiteChatApiResponse,
  type SiteChatConversationMessage,
  type SiteChatRagMode,
} from '@/lib/site-chat';

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';
const MAX_CONVERSATION_MESSAGES = 12;
const CHAT_LOGGER = createLogger('chat.api');

/** Node runtime — full env dump uses `fs` in `logChatRuntimeProcessEnvOnce`. */
export const runtime = 'nodejs';

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

function normalizeConversation(messages: SiteChatConversationMessage[] | undefined) {
  return (messages ?? [])
    .filter((message): message is SiteChatConversationMessage => {
      if (!message || typeof message !== 'object') {
        return false;
      }

      if (!['system', 'user', 'assistant'].includes(message.role)) {
        return false;
      }

      return typeof message.content === 'string' && Boolean(message.content.trim());
    })
    .slice(-MAX_CONVERSATION_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
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

function extractCompletionText(payload: unknown) {
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]
    ?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (
          part &&
          typeof part === 'object' &&
          (part as { type?: string }).type === 'text' &&
          typeof (part as { text?: string }).text === 'string'
        ) {
          return (part as { text: string }).text;
        }

        return '';
      })
      .join('')
      .trim();
  }

  return '';
}

function previewText(value: string, limit = 160) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit)}...`;
}

/** When `SITE_CHAT_RAG` is `0`, `false`, or `off`, skip RAG/embeddings (chat uses only system + conversation). */
function isSiteChatRagEnabled(): boolean {
  const v = process.env.SITE_CHAT_RAG?.trim().toLowerCase();
  return v !== '0' && v !== 'false' && v !== 'off';
}

function resolveRagForRequest(payload: SiteChatApiRequest | null): {
  ragEnabled: boolean;
  ragMode: SiteChatRagMode | undefined;
} {
  const mode = payload?.ragMode;
  if (mode === 'off') {
    return { ragEnabled: false, ragMode: 'off' };
  }
  if (mode === 'books' || mode === 'books_planning' || mode === 'books_planning_repo') {
    return { ragEnabled: true, ragMode: mode };
  }
  return { ragEnabled: isSiteChatRagEnabled(), ragMode: undefined };
}

function resolveChatModel(payload: SiteChatApiRequest | null): string {
  const raw = payload?.model?.trim();
  if (raw && /^[a-zA-Z0-9._-]+$/.test(raw) && raw.length <= 128) {
    return raw;
  }
  return process.env.OPENAI_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;
}

export async function POST(request: Request) {
  logChatRuntimeProcessEnvOnce('POST /api/chat');
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const responseHeaders = { 'x-portfolio-request-id': requestId };
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    CHAT_LOGGER.warn('chat rejected because OPENAI_API_KEY is missing', {
      requestId,
    });
    return jsonResponse(
      {
        error: 'site_chat_unconfigured',
        message: 'Chat is not configured (missing OPENAI_API_KEY).',
      },
      503,
      responseHeaders,
    );
  }

  const payload = (await request.json().catch(() => null)) as SiteChatApiRequest | null;
  const conversation = normalizeConversation(payload?.messages);
  const query = extractLatestUserQuery(conversation);
  CHAT_LOGGER.info('chat request received', {
    requestId,
    messageCount: payload?.messages?.length ?? 0,
    normalizedMessageCount: conversation.length,
    queryPreview: previewText(query),
    clientSource: payload?.client?.source,
    clientAcceptEditsAuto: payload?.client?.acceptEditsAuto,
    requestModel: payload?.model,
    requestRagMode: payload?.ragMode,
    enableCopilotTools: payload?.enableCopilotTools === true,
  });
  CHAT_LOGGER.debug('normalized chat conversation', {
    requestId,
    conversation,
  });

  if (!query) {
    CHAT_LOGGER.warn('chat rejected because no user query was present', {
      requestId,
    });
    return jsonResponse(
      {
        error: 'missing_query',
        message: 'Provide at least one user message before starting a chat turn.',
      },
      400,
      responseHeaders,
    );
  }

  if (payload?.enableCopilotTools === true && !isCopilotToolsAuthorized(request)) {
    CHAT_LOGGER.warn('copilot tools rejected (unauthorized)', { requestId });
    return jsonResponse(
      {
        error: 'copilot_tools_forbidden',
        message:
          'Copilot tools require COPILOT_TOOLS_BEARER (Authorization: Bearer ...) or SITE_CHAT_COPILOT_TOOLS=1 for local dev.',
      },
      403,
      responseHeaders,
    );
  }

  const { ragEnabled, ragMode } = resolveRagForRequest(payload);
  const retrievalStartedAt = Date.now();
  const hits = ragEnabled
    ? await retrieveRagContext(query, { ragMode }).catch((error) => {
        CHAT_LOGGER.warn('rag retrieval failed for chat request; continuing without hits', {
          requestId,
          elapsedMs: Date.now() - retrievalStartedAt,
          error,
        });
        return [];
      })
    : [];
  if (!ragEnabled) {
    CHAT_LOGGER.info('site chat RAG skipped (request or SITE_CHAT_RAG; no embedding calls)', {
      requestId,
      ragMode: payload?.ragMode,
    });
  }
  CHAT_LOGGER.info('rag retrieval completed for chat request', {
    requestId,
    elapsedMs: Date.now() - retrievalStartedAt,
    hitCount: hits.length,
    ragEnabled,
    ragMode,
  });
  CHAT_LOGGER.debug('rag retrieval hits', {
    requestId,
    hits: hits.map((hit) => ({
      chunkId: hit.chunkId,
      sourceId: hit.sourceId,
      title: hit.title,
      heading: hit.heading,
      score: hit.score,
      publicUrl: hit.publicUrl,
      snippet: previewText(hit.snippet || hit.content),
    })),
  });
  const ragSystemMessage = buildRagSystemMessage(hits);
  const model = resolveChatModel(payload);

  const openAiMessages = [
    { role: 'system', content: SITE_CHAT_INSTRUCTIONS },
    ...(ragSystemMessage ? [{ role: 'system', content: ragSystemMessage }] : []),
    ...conversation.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  if (payload?.enableCopilotTools === true) {
    const toolMessages = [
      {
        role: 'system',
        content: `${SITE_CHAT_INSTRUCTIONS}\n\n${COPILOT_TOOLS_SYSTEM_SUPPLEMENT}`,
      },
      ...(ragSystemMessage ? [{ role: 'system', content: ragSystemMessage }] : []),
      ...conversation.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ] as Record<string, unknown>[];

    CHAT_LOGGER.debug('dispatching copilot tool loop', {
      requestId,
      model,
      upstreamMessageCount: toolMessages.length,
      ragContextIncluded: Boolean(ragSystemMessage),
    });

    const upstreamStartedAt = Date.now();
    try {
      const loop = await runCopilotChatOpenAiLoop({
        apiKey,
        model,
        messages: toolMessages,
        signal: request.signal,
      });
      const result: SiteChatApiResponse = {
        text: loop.text,
        hits,
        query,
        model,
        copilotToolRounds: loop.toolRounds,
        copilotToolCalls: loop.toolCallCount,
        copilotForm: loop.copilotForm,
      };
      CHAT_LOGGER.info('chat request completed (copilot tools)', {
        requestId,
        elapsedMs: Date.now() - startedAt,
        upstreamElapsedMs: Date.now() - upstreamStartedAt,
        hitCount: hits.length,
        model,
        copilotToolRounds: loop.toolRounds,
        copilotToolCalls: loop.toolCallCount,
      });
      return jsonResponse(result, 200, responseHeaders);
    } catch (error) {
      CHAT_LOGGER.error('copilot tool loop failed', {
        requestId,
        elapsedMs: Date.now() - upstreamStartedAt,
        error,
      });
      return jsonResponse(
        {
          error: 'copilot_tools_failed',
          message: error instanceof Error ? error.message : 'Copilot tool loop failed.',
        },
        502,
        responseHeaders,
      );
    }
  }

  CHAT_LOGGER.debug('dispatching upstream chat request', {
    requestId,
    model,
    upstreamMessageCount: openAiMessages.length,
    ragContextIncluded: Boolean(ragSystemMessage),
  });

  const upstreamStartedAt = Date.now();
  let response: Response;
  try {
    response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      signal: request.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        messages: openAiMessages,
      }),
    });
  } catch (error) {
    CHAT_LOGGER.error('upstream chat request threw before a response was returned', {
      requestId,
      elapsedMs: Date.now() - upstreamStartedAt,
      error,
    });
    return jsonResponse(
      {
        error: 'upstream_chat_failed',
        message: 'The upstream chat provider could not be reached.',
      },
      502,
      responseHeaders,
    );
  }

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    CHAT_LOGGER.error('upstream chat provider returned an error', {
      requestId,
      elapsedMs: Date.now() - upstreamStartedAt,
      status: response.status,
      statusText: response.statusText,
      bodyPreview: previewText(details, 280),
    });
    return jsonResponse(
      {
        error: 'upstream_chat_failed',
        message: details || 'The upstream chat provider returned an error.',
      },
      502,
      responseHeaders,
    );
  }

  const data = await response.json().catch(async () => {
    const rawBody = await response.text().catch(() => '');
    CHAT_LOGGER.error('upstream chat provider returned non-json content', {
      requestId,
      elapsedMs: Date.now() - upstreamStartedAt,
      status: response.status,
      bodyPreview: previewText(rawBody, 280),
    });
    return null;
  });
  const text = extractCompletionText(data);
  const result: SiteChatApiResponse = {
    text: text || 'I could not produce an answer from the current public-site context.',
    hits,
    query,
    model,
  };
  CHAT_LOGGER.info('chat request completed', {
    requestId,
    elapsedMs: Date.now() - startedAt,
    upstreamElapsedMs: Date.now() - upstreamStartedAt,
    hitCount: hits.length,
    model,
  });
  CHAT_LOGGER.debug('chat response payload', {
    requestId,
    textPreview: previewText(result.text, 280),
  });

  return jsonResponse(result, 200, responseHeaders);
}
