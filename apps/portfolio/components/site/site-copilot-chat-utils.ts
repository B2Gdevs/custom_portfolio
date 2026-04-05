import type { SiteChatConversationMessage } from '@/lib/site-chat';

export interface AssistantUiMessagePart {
  type?: string;
  text?: string;
}

export interface AssistantUiMessageLike {
  role?: string;
  content?: string | readonly AssistantUiMessagePart[];
}

export function joinMessageText(content: AssistantUiMessageLike['content']) {
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

export function normalizeConversation(messages: readonly AssistantUiMessageLike[] | undefined) {
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

export function extractLatestUserQuery(messages: SiteChatConversationMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === 'user' && message.content.trim()) {
      return message.content.trim();
    }
  }

  return '';
}

export function previewText(value: string, limit = 140) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit)}...`;
}

export function isAppCoverImageContext(contextId: string | null): contextId is string {
  return Boolean(contextId?.startsWith('app-cover:'));
}
