import { describe, expect, it, vi } from 'vitest';
import { executeCopilotToolCall, runCopilotChatOpenAiLoop } from '@/lib/copilot/openai-chat-tools';
import { copilotPayloadFind } from '@/lib/copilot/payload-read-tools';

const formMocks = vi.hoisted(() => ({
  buildCopilotFormDescriptor: vi.fn(),
}));

vi.mock('@/lib/copilot/form-descriptor', () => ({
  buildCopilotFormDescriptor: formMocks.buildCopilotFormDescriptor,
}));

vi.mock('@/lib/copilot/payload-read-tools', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/copilot/payload-read-tools')>();
  return {
    ...mod,
    copilotPayloadFind: vi.fn(),
    copilotPayloadFindById: vi.fn(),
  };
});

describe('executeCopilotToolCall', () => {
  beforeEach(() => {
    formMocks.buildCopilotFormDescriptor.mockReset();
  });

  it('returns error JSON for invalid JSON arguments', async () => {
    const out = await executeCopilotToolCall('copilot_payload_list', '{');
    expect(out).toContain('invalid_arguments_json');
  });

  it('delegates to copilotPayloadFind for list', async () => {
    vi.mocked(copilotPayloadFind).mockResolvedValue({
      ok: true,
      operation: 'find',
      collection: 'project-records',
      result: {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
    const out = await executeCopilotToolCall(
      'copilot_payload_list',
      JSON.stringify({ collection: 'project-records' }),
    );
    expect(copilotPayloadFind).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'project-records' }),
    );
    expect(JSON.parse(out)).toMatchObject({ ok: true, operation: 'find' });
  });

  it('returns descriptor JSON for copilot_open_form', async () => {
    formMocks.buildCopilotFormDescriptor.mockReturnValue({
      collection: 'project-records',
      intent: 'create',
      title: 'Projects',
      fields: [{ name: 'slug', kind: 'text', label: 'Slug', required: true }],
    });
    const out = await executeCopilotToolCall(
      'copilot_open_form',
      JSON.stringify({ collection: 'project-records', intent: 'create' }),
    );
    expect(formMocks.buildCopilotFormDescriptor).toHaveBeenCalledWith({
      collection: 'project-records',
      intent: 'create',
      id: undefined,
    });
    expect(JSON.parse(out)).toMatchObject({ ok: true, descriptor: expect.objectContaining({ collection: 'project-records' }) });
  });

  it('returns error when update intent missing id', async () => {
    const out = await executeCopilotToolCall(
      'copilot_open_form',
      JSON.stringify({ collection: 'project-records', intent: 'update' }),
    );
    expect(JSON.parse(out)).toMatchObject({ ok: false, error: 'missing_id_for_update' });
  });
});

describe('runCopilotChatOpenAiLoop', () => {
  it('returns assistant text when first response has no tool_calls', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Hello from model.' } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await runCopilotChatOpenAiLoop({
      apiKey: 'k',
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hi' }],
      signal: AbortSignal.timeout(30_000),
      fetchImpl,
    });

    expect(result.text).toBe('Hello from model.');
    expect(result.toolRounds).toBe(0);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('runs tool round then returns final text', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: null,
                  tool_calls: [
                    {
                      id: 'call_1',
                      type: 'function',
                      function: {
                        name: 'copilot_payload_list',
                        arguments: JSON.stringify({ collection: 'project-records', limit: 5 }),
                      },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'Here is what I found.' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    vi.mocked(copilotPayloadFind).mockResolvedValue({
      ok: true,
      operation: 'find',
      collection: 'project-records',
      result: {
        docs: [{ id: '1' }],
        totalDocs: 1,
        limit: 5,
        page: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });

    const result = await runCopilotChatOpenAiLoop({
      apiKey: 'k',
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'List projects' }],
      signal: AbortSignal.timeout(30_000),
      fetchImpl,
    });

    expect(result.text).toBe('Here is what I found.');
    expect(result.toolRounds).toBe(1);
    expect(result.toolCallCount).toBe(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('captures last copilot_open_form descriptor on the result', async () => {
    const sampleDescriptor = {
      collection: 'project-records',
      intent: 'create' as const,
      title: 'Projects',
      fields: [] as { name: string; kind: 'text'; label: string; required: boolean }[],
    };
    formMocks.buildCopilotFormDescriptor.mockReturnValue(sampleDescriptor);

    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: 'assistant',
                  content: null,
                  tool_calls: [
                    {
                      id: 'call_form',
                      type: 'function',
                      function: {
                        name: 'copilot_open_form',
                        arguments: JSON.stringify({ collection: 'project-records', intent: 'create' }),
                      },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: 'Schema loaded.' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    const result = await runCopilotChatOpenAiLoop({
      apiKey: 'k',
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Open form' }],
      signal: AbortSignal.timeout(30_000),
      fetchImpl,
    });

    expect(result.text).toBe('Schema loaded.');
    expect(result.copilotForm).toEqual(sampleDescriptor);
  });
});
