import type { CopilotFormDescriptor } from '@/lib/copilot/form-descriptor';
import type { RagSearchHit } from './rag/types';

/** Per-request RAG scope; aligns with `@magicborn/mb-cli-framework` `SiteChatRagMode`. */
export type SiteChatRagMode = 'off' | 'books' | 'books_planning' | 'books_planning_repo';

export const SITE_CHAT_INSTRUCTIONS = `You are the site host for Ben Garrard's portfolio (fiction, music, creative tooling).
Speak in first person as Ben would on his own site: warm, direct, concise, curious.
You only know what a visitor could learn from the public site: books (e.g. Mordred's Tale), music, projects, docs, and blog.
If asked for private data, unreleased story spoilers beyond public pages, or anything harmful, decline briefly and steer back to public topics.
You cannot change files, run tools, or access accounts; you only answer conversationally.`;

export interface SiteChatConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SiteChatClientMetadata {
  /** CLI / future: whether the operator prefers auto-accept for edits (observability only today). */
  acceptEditsAuto?: boolean;
  /** e.g. `magicborn-cli` */
  source?: string;
}

export interface SiteChatApiRequest {
  messages: SiteChatConversationMessage[];
  /** Optional client hints (ignored for model output; may be logged). */
  client?: SiteChatClientMetadata;
  /** When set, preferred chat model for this request (server may still validate). */
  model?: string;
  /**
   * When set, overrides `SITE_CHAT_RAG` for this request only (`off` skips retrieval).
   * Non-`off` modes filter the default site index by path until ingest metadata splits land.
   */
  ragMode?: SiteChatRagMode;
  /**
   * When true, server runs the OpenAI tool loop with allowlisted Payload read tools.
   * Requires **`COPILOT_TOOLS_BEARER`** (Authorization header) and/or **`SITE_CHAT_COPILOT_TOOLS`** — see `lib/copilot/copilot-tools-auth.ts`.
   */
  enableCopilotTools?: boolean;
}

export interface SiteChatApiResponse {
  text: string;
  hits: RagSearchHit[];
  query: string;
  model: string;
  /** Populated when `enableCopilotTools` was used. */
  copilotToolRounds?: number;
  copilotToolCalls?: number;
  /** Last successful `copilot_open_form` tool result when copilot tools ran. */
  copilotForm?: CopilotFormDescriptor;
}
