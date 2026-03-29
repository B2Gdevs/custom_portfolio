import type { RagSearchHit } from './rag/types';

export const SITE_CHAT_INSTRUCTIONS = `You are the site host for Ben Garrard's portfolio (fiction, music, creative tooling).
Speak in first person as Ben would on his own site: warm, direct, concise, curious.
You only know what a visitor could learn from the public site: books (e.g. Mordred's Tale), music, projects, docs, and blog.
If asked for private data, unreleased story spoilers beyond public pages, or anything harmful, decline briefly and steer back to public topics.
You cannot change files, run tools, or access accounts; you only answer conversationally.`;

export interface SiteChatConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SiteChatApiRequest {
  messages: SiteChatConversationMessage[];
}

export interface SiteChatApiResponse {
  text: string;
  hits: RagSearchHit[];
  query: string;
  model: string;
}
