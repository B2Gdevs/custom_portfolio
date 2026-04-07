export type OpenAiChatRole = 'system' | 'user' | 'assistant';

export type OpenAiChatMessage = { role: OpenAiChatRole; content: string };

type ChatPayload = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
} | null;

/** POST `/v1/chat/completions`; returns assistant text or a failure message (no `process.exit`). */
export async function fetchOpenAiChatText(params: {
  apiKey: string;
  model: string;
  temperature: number;
  messages: OpenAiChatMessage[];
}): Promise<{ ok: true; text: string } | { ok: false; errorMessage: string }> {
  const { apiKey, model, temperature, messages } = params;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
    }),
  });
  const payload = (await response.json().catch(() => null)) as ChatPayload;
  if (!response.ok) {
    return {
      ok: false,
      errorMessage: payload?.error?.message || `OpenAI request failed (${response.status})`,
    };
  }
  const text = payload?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    return { ok: false, errorMessage: 'No style suggestion returned.' };
  }
  return { ok: true, text };
}
