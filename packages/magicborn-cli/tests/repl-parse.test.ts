import { describe, expect, it } from 'vitest';
import { parseReplLine, splitArgvLine } from '../src/tui/repl-parse.ts';

describe('repl-parse', () => {
  it('splitArgvLine respects quotes', () => {
    expect(splitArgvLine(`foo "bar baz" q`)).toEqual(['foo', 'bar baz', 'q']);
  });

  it('parseReplLine strips leading slash', () => {
    expect(parseReplLine('/payload collections')).toEqual(['payload', 'collections']);
  });

  it('parseReplLine handles empty', () => {
    expect(parseReplLine('   ')).toEqual([]);
  });
});
