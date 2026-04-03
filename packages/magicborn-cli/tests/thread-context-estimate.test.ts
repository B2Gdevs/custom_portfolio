import type { ThreadMessage } from '@assistant-ui/core';
import { describe, expect, it } from 'vitest';
import { approxCharsFromThreadMessages, approxContextPctFromChars } from '@magicborn/mb-cli-framework';

describe('approxContextPctFromChars', () => {
  it('maps 0 to 0', () => {
    expect(approxContextPctFromChars(0)).toBe(0);
  });

  it('caps at 100 for huge char counts', () => {
    expect(approxContextPctFromChars(999_999_999)).toBe(100);
  });

  it('uses chars/4 vs 128k reference window', () => {
    // 128k * 4 = 512k chars → ~100%
    expect(approxContextPctFromChars(512_000)).toBe(100);
    expect(approxContextPctFromChars(256_000)).toBe(50);
  });
});

describe('approxCharsFromThreadMessages', () => {
  const assistantBase = {
    id: 'a1',
    role: 'assistant' as const,
    createdAt: new Date(),
    status: { type: 'complete' as const, reason: 'stop' as const },
    metadata: {
      unstable_state: {},
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      custom: {},
    },
  };

  it('sums text parts across user and assistant', () => {
    const messages: ThreadMessage[] = [
      {
        id: 'u1',
        role: 'user',
        createdAt: new Date(),
        content: [{ type: 'text', text: 'hi' }],
        metadata: { custom: {} },
        attachments: [],
      },
      {
        ...assistantBase,
        content: [{ type: 'text', text: 'there' }],
      },
    ];
    expect(approxCharsFromThreadMessages(messages)).toBe(7);
  });

  it('includes tool-call argsText and capped result JSON', () => {
    const messages: ThreadMessage[] = [
      {
        ...assistantBase,
        content: [
          {
            type: 'tool-call',
            toolCallId: 't1',
            toolName: 'x',
            args: { q: 1 },
            argsText: '{"q":1}',
            result: { ok: true },
          },
        ],
      },
    ];
    const n = approxCharsFromThreadMessages(messages);
    expect(n).toBeGreaterThan('{"q":1}'.length);
    expect(n).toBe('{"q":1}'.length + '{"ok":true}'.length);
  });
});
