import { describe, expect, it } from 'vitest';
import { getCompleteLines } from '@/scripts/magicborn/complete-words';

describe('getCompleteLines', () => {
  it('returns seed keys for seed-keys', () => {
    const lines = getCompleteLines('seed-keys');
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => typeof l === 'string' && l.length > 0)).toBe(true);
  });

  it('returns book slugs for book-slugs', () => {
    const lines = getCompleteLines('book-slugs');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('returns empty array for unknown topic', () => {
    expect(getCompleteLines('not-a-real-topic-xyz')).toEqual([]);
  });

  it('returns openai subcommands', () => {
    expect(getCompleteLines('openai')).toEqual(
      expect.arrayContaining(['status', 'models', 'projects', 'help']),
    );
  });

  it('includes update in top-level commands', () => {
    expect(getCompleteLines('top')).toContain('update');
  });

  it('includes pnpm passthrough in top-level commands', () => {
    expect(getCompleteLines('top')).toContain('pnpm');
  });

  it('lists vendor forward targets', () => {
    expect(getCompleteLines('vendor')).toEqual(
      expect.arrayContaining(['add', 'list', 'users', 'org', 'tenant', 'blog']),
    );
  });

  it('returns vendor-ids including grimetime', () => {
    expect(getCompleteLines('vendor-ids')).toContain('grimetime');
  });
});
