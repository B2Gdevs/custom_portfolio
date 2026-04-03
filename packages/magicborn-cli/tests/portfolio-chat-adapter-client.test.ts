import { describe, expect, it } from 'vitest';
import {
  createPortfolioSiteChatAdapter,
  type SiteChatApiResponse,
} from '@magicborn/mb-cli-framework';

describe('createPortfolioSiteChatAdapter client metadata', () => {
  it('includes client in POST JSON when provided', async () => {
    const bodies: unknown[] = [];
    const fetchImpl: typeof fetch = async (_url, init) => {
      bodies.push(JSON.parse(init.body as string));
      return new Response(JSON.stringify({ text: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };

    const adapter = createPortfolioSiteChatAdapter({
      chatApiUrl: 'http://127.0.0.1:3000/api/chat',
      fetchImpl,
      client: { acceptEditsAuto: true, source: 'magicborn-cli' },
    });

    const gen = adapter.run({
      messages: [
        {
          id: 'm1',
          role: 'user',
          createdAt: new Date(),
          content: [{ type: 'text', text: 'Hello' }],
          metadata: { custom: {} },
          attachments: [],
        },
      ],
      abortSignal: AbortSignal.timeout(60_000),
    } as Parameters<typeof adapter.run>[0]);

    for await (const _ of gen) {
      // consume
    }

    expect(bodies[0]).toMatchObject({
      messages: [{ role: 'user', content: 'Hello' }],
      client: { acceptEditsAuto: true, source: 'magicborn-cli' },
    });
  });

  it('sends model and ragMode from getSession when set', async () => {
    const bodies: unknown[] = [];
    const fetchImpl: typeof fetch = async (_url, init) => {
      bodies.push(JSON.parse(init.body as string));
      return new Response(JSON.stringify({ text: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const adapter = createPortfolioSiteChatAdapter({
      chatApiUrl: 'http://127.0.0.1:3000/api/chat',
      fetchImpl,
      client: { source: 'magicborn-cli' },
      getSession: () => ({ chatModel: 'gpt-4o', ragMode: 'books' }),
      persistSession: () => {},
    });

    const gen = adapter.run({
      messages: [
        {
          id: 'm1',
          role: 'user',
          createdAt: new Date(),
          content: [{ type: 'text', text: 'Hello' }],
          metadata: { custom: {} },
          attachments: [],
        },
      ],
      abortSignal: AbortSignal.timeout(60_000),
    } as Parameters<typeof adapter.run>[0]);

    for await (const _ of gen) {
      // consume
    }

    expect(bodies[0]).toMatchObject({
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'gpt-4o',
      ragMode: 'books',
    });
  });

  it('invokes onChatResponse with server JSON before yielding assistant text (e.g. copilotForm)', async () => {
    const seen: SiteChatApiResponse[] = [];
    const fetchImpl: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          text: 'Schema ready.',
          hits: [],
          query: 'q',
          model: 'gpt-4o-mini',
          copilotForm: {
            collection: 'project-records',
            intent: 'create',
            title: 'Project records',
            fields: [{ name: 'slug', kind: 'text', label: 'Slug', required: true }],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );

    const adapter = createPortfolioSiteChatAdapter({
      chatApiUrl: 'http://127.0.0.1:3000/api/chat',
      fetchImpl,
      onChatResponse: (data) => {
        seen.push(data);
      },
    });

    const gen = adapter.run({
      messages: [
        {
          id: 'm1',
          role: 'user',
          createdAt: new Date(),
          content: [{ type: 'text', text: 'Open create form for projects' }],
          metadata: { custom: {} },
          attachments: [],
        },
      ],
      abortSignal: AbortSignal.timeout(60_000),
    } as Parameters<typeof adapter.run>[0]);

    const chunks: unknown[] = [];
    for await (const y of gen) {
      chunks.push(y);
    }

    expect(seen).toHaveLength(1);
    expect(seen[0].copilotForm?.collection).toBe('project-records');
    expect(seen[0].copilotForm?.intent).toBe('create');
    expect(chunks.length).toBeGreaterThan(0);
  });
});
