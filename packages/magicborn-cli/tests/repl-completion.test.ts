import { describe, expect, it } from 'vitest';
import {
  applyTabCompletion,
  completionGhostAfter,
  filterSlashPalette,
  mergeSlashPalette,
} from '../src/tui/repl-completion.ts';

describe('repl-completion', () => {
  it('Tab on exact primary jumps to first suffix', () => {
    expect(applyTabCompletion('book')).toBe('book generate ');
  });

  it('Tab on slash-prefixed primary keeps slash', () => {
    expect(applyTabCompletion('/book')).toBe('/book generate ');
  });

  it('Tab after primary + space fills first suffix', () => {
    expect(applyTabCompletion('book ')).toBe('book generate ');
  });

  it('ghost shows remainder after Tab expansion', () => {
    expect(completionGhostAfter('book')).toBe(' generate ');
  });

  it('slash palette lists actions for bare /', () => {
    const p = filterSlashPalette('/', 5);
    expect(p.length).toBe(5);
    expect(p.every((x) => x.startsWith('/'))).toBe(true);
  });

  it('slash palette filters by query', () => {
    const p = filterSlashPalette('/payload', 20);
    expect(p.some((x) => x.includes('payload'))).toBe(true);
  });

  it('mergeSlashPalette prepends extra vendor lines', () => {
    const merged = mergeSlashPalette('/', ['/vendor use acme', '/vendor use beta'], 80, 10);
    expect(merged[0]).toBe('/vendor use acme');
    expect(merged[1]).toBe('/vendor use beta');
    expect(merged.length).toBeGreaterThan(2);
  });
});
