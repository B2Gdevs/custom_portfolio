import { describe, expect, it } from 'vitest';
import {
  cycleRagMode,
  formatRagModeLabel,
  parseSlashChatLine,
} from '@magicborn/mb-cli-framework';

describe('slash-chat-commands', () => {
  it('parseSlashChatLine parses model and rag', () => {
    expect(parseSlashChatLine('/model gpt-4o-mini')).toEqual({ kind: 'model', args: ['gpt-4o-mini'] });
    expect(parseSlashChatLine('/rag')).toEqual({ kind: 'rag', sub: 'cycle' });
    expect(parseSlashChatLine('/rag off')).toEqual({ kind: 'rag', sub: 'off' });
    expect(parseSlashChatLine('/index off')).toEqual({ kind: 'rag', sub: 'off' });
    expect(parseSlashChatLine('hello')).toBeNull();
  });

  it('cycleRagMode walks through modes and back to env', () => {
    let cur: ReturnType<typeof cycleRagMode> = undefined;
    cur = cycleRagMode(cur);
    expect(cur).toBe('off');
    cur = cycleRagMode(cur);
    expect(cur).toBe('books');
    cur = cycleRagMode('books_planning_repo');
    expect(cur).toBeUndefined();
  });

  it('formatRagModeLabel', () => {
    expect(formatRagModeLabel(undefined)).toContain('env');
    expect(formatRagModeLabel('off')).toBe('off');
  });
});
