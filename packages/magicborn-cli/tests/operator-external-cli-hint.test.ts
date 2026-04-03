import { describe, expect, it } from 'vitest';
import { formatExternalOperatorCliHint } from '../src/operator-external-cli-hint.js';

describe('formatExternalOperatorCliHint', () => {
  it('mentions cd, repo root, and cdmb for claude', () => {
    const s = formatExternalOperatorCliHint('claude', [], '/r');
    expect(s).toContain('not forwarded');
    expect(s).toContain('cd "/r" && claude');
    expect(s).toContain('cdmb');
  });

  it('appends args for codex', () => {
    const s = formatExternalOperatorCliHint('codex', ['--help'], '/repo');
    expect(s).toContain('cd "/repo" && codex --help');
  });
});
