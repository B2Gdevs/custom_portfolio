import { describe, expect, it } from 'vitest';
import { maskOpenAiKey } from '@/scripts/magicborn/openai-cli';

describe('maskOpenAiKey', () => {
  it('masks a typical key shape', () => {
    expect(maskOpenAiKey('sk-proj-abcdefghijklmnop')).toMatch(/^sk-proj…/);
    expect(maskOpenAiKey('sk-proj-abcdefghijklmnop')).toMatch(/…[a-z]{4}$/);
  });

  it('handles short keys', () => {
    expect(maskOpenAiKey('short')).toBe('sho…');
  });

  it('handles empty', () => {
    expect(maskOpenAiKey('')).toBe('(empty)');
    expect(maskOpenAiKey('   ')).toBe('(empty)');
  });
});
