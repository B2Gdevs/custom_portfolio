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

  it('lists vendor subcommands (ids come from vendor-suggest)', () => {
    expect(getCompleteLines('vendor')).toEqual(
      expect.arrayContaining(['add', 'list', 'use', 'clear', 'scope']),
    );
    expect(getCompleteLines('vendor')).not.toContain('users');
  });

  it('includes payload in top-level commands', () => {
    expect(getCompleteLines('top')).toContain('payload');
  });

  it('returns payload subcommands', () => {
    expect(getCompleteLines('payload')).toEqual(expect.arrayContaining(['collections', 'app']));
  });

  it('returns payload app generate aliases', () => {
    expect(getCompleteLines('payload-app')).toEqual(expect.arrayContaining(['generate', 'gen']));
  });

  it('includes chat in top-level commands', () => {
    expect(getCompleteLines('top')).toContain('chat');
  });

  it('vendor-suggest includes grimetime when monorepo root is discoverable', () => {
    const lines = getCompleteLines('vendor-suggest');
    expect(lines.some((l) => l.startsWith('grimetime'))).toBe(true);
  });

  it('returns vendor-ids including grimetime', () => {
    expect(getCompleteLines('vendor-ids')).toContain('grimetime');
  });
});
