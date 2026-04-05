import type { Where } from 'payload';
import type { CopilotFormDescriptor } from '@/lib/copilot/form-descriptor';
import { buildCopilotFormDescriptor } from '@/lib/copilot/form-descriptor';
import { COPILOT_FORM_OPENAI_TOOLS } from '@/lib/copilot/payload-form-tools';
import {
  COPILOT_READ_OPENAI_TOOLS,
  copilotPayloadFind,
  copilotPayloadFindById,
} from '@/lib/copilot/payload-read-tools';

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';

/** Read + list + get + form schema tools for `POST /api/chat` (`enableCopilotTools`). */
export const COPILOT_CHAT_TOOLS = [...COPILOT_READ_OPENAI_TOOLS, ...COPILOT_FORM_OPENAI_TOOLS];

export const COPILOT_TOOL_MAX_ROUNDS = 4;

export const COPILOT_TOOLS_SYSTEM_SUPPLEMENT = `You may call read-only tools to fetch exact rows from allowlisted site catalog collections (projects, apps, resumes, published artifacts, listen rows, media metadata). Prefer tools when the user needs database-backed facts; combine with normal reasoning for visitors. You may call copilot_open_form to load a create/update field schema (names, types, required) before suggesting structured edits — arrays, uploads, and relationships are marked unsupported and are edited in Payload admin.`;

/** Execute one OpenAI tool call from the Copilot read set; returns JSON string for the `tool` message. */
export async function executeCopilotToolCall(name: string, argsJson: string): Promise<string> {
  let args: Record<string, unknown>;
  try {
    args = JSON.parse(argsJson || '{}') as Record<string, unknown>;
  } catch {
    return JSON.stringify({ ok: false, error: 'invalid_arguments_json' });
  }

  if (name === 'copilot_payload_list') {
    const res = await copilotPayloadFind({
      collection: String(args.collection ?? ''),
      where: args.where as Where | undefined,
      limit: args.limit,
      page: args.page,
      depth: args.depth,
      sort: typeof args.sort === 'string' ? args.sort : undefined,
    });
    return JSON.stringify(res);
  }

  if (name === 'copilot_payload_get') {
    const res = await copilotPayloadFindById({
      collection: String(args.collection ?? ''),
      id: String(args.id ?? ''),
      depth: args.depth,
    });
    return JSON.stringify(res);
  }

  if (name === 'copilot_open_form') {
    const intent = args.intent === 'update' ? 'update' : 'create';
    const collection = String(args.collection ?? '');
    const id = typeof args.id === 'string' ? args.id.trim() : undefined;
    if (intent === 'update' && !id) {
      return JSON.stringify({ ok: false, error: 'missing_id_for_update' });
    }
    const descriptor = buildCopilotFormDescriptor({ collection, intent, id });
    if (!descriptor) {
      return JSON.stringify({ ok: false, error: 'collection_not_allowed_or_unknown' });
    }
    return JSON.stringify({ ok: true, descriptor });
  }

  return JSON.stringify({ ok: false, error: 'unknown_tool', name });
}

function extractAssistantText(choice: { content?: unknown }): string {
  const content = choice?.content;
  if (typeof content === 'string') {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
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

export type CopilotChatLoopResult = {
  text: string;
  toolRounds: number;
  toolCallCount: number;
  /** Last successful `copilot_open_form` tool result in this turn, if any. */
  copilotForm?: CopilotFormDescriptor;
};

/**
 * Multi-round OpenAI chat with **`COPILOT_CHAT_TOOLS`** (Payload read + form schema tools).
 */
export async function runCopilotChatOpenAiLoop(options: {
  apiKey: string;
  model: string;
  /** OpenAI `messages` array (system/user/assistant). */
  messages: Record<string, unknown>[];
  signal: AbortSignal;
  maxRounds?: number;
  temperature?: number;
  fetchImpl?: typeof fetch;
}): Promise<CopilotChatLoopResult> {
  const fetchFn = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const maxRounds = options.maxRounds ?? COPILOT_TOOL_MAX_ROUNDS;
  const working = options.messages.map((m) => ({ ...m }));
  let toolRounds = 0;
  let toolCallCount = 0;
  let lastForm: CopilotFormDescriptor | undefined;

  for (let i = 0; i < maxRounds; i += 1) {
    const httpResponse = await fetchFn(OPENAI_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      signal: options.signal,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        temperature: options.temperature ?? 0.6,
        messages: working,
        tools: COPILOT_CHAT_TOOLS,
        tool_choice: 'auto',
      }),
    });

    const raw = await httpResponse.text();
    if (!httpResponse.ok) {
      throw new Error(`OpenAI chat failed (${httpResponse.status}): ${raw.slice(0, 800)}`);
    }

    let data: {
      choices?: Array<{ message?: Record<string, unknown> }>;
    };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      throw new Error('OpenAI returned non-JSON');
    }

    const choice = data?.choices?.[0]?.message;
    if (!choice || typeof choice !== 'object') {
      throw new Error('OpenAI response missing message');
    }

    const toolCalls = choice.tool_calls as
      | Array<{ id?: string; function?: { name?: string; arguments?: string } }>
      | undefined;

    if (!toolCalls || !Array.isArray(toolCalls) || toolCalls.length === 0) {
      return {
        text: extractAssistantText(choice) || 'I could not produce an answer.',
        toolRounds,
        toolCallCount,
        copilotForm: lastForm,
      };
    }

    toolRounds += 1;
    working.push(choice as Record<string, unknown>);

    for (const tc of toolCalls) {
      const id = tc.id;
      const fn = tc.function;
      const name = fn?.name ?? '';
      const argsStr = fn?.arguments ?? '{}';
      if (!id || !name) {
        continue;
      }
      toolCallCount += 1;
      let content: string;
      try {
        content = await executeCopilotToolCall(name, argsStr);
      } catch (e) {
        content = JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) });
      }
      try {
        const parsed = JSON.parse(content) as { ok?: boolean; descriptor?: CopilotFormDescriptor };
        if (parsed?.ok && parsed.descriptor) {
          lastForm = parsed.descriptor;
        }
      } catch {
        /* ignore */
      }
      working.push({
        role: 'tool',
        tool_call_id: id,
        content,
      });
    }
  }

  throw new Error('copilot_tool_max_rounds_exceeded');
}
