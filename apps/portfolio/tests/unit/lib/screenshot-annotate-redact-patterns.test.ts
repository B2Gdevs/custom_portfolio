import { describe, expect, it } from 'vitest';
import { findRedactWordMatches, type RedactKind } from '@/lib/screenshot-annotate/redact-patterns';
import type { OcrWord } from '@/lib/screenshot-annotate/ocr-words';

function w(
  text: string,
  bbox: { x0: number; y0: number; x1: number; y1: number },
): OcrWord {
  return { text, bbox, confidence: 90 };
}

describe('redact-patterns', () => {
  it('detects email words', () => {
    const words: OcrWord[] = [w('Contact', { x0: 0, y0: 0, x1: 10, y1: 10 }), w('me@site.com', { x0: 20, y0: 0, x1: 40, y1: 10 })];
    const hits = findRedactWordMatches(words, new Set<RedactKind>(['email']));
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('email');
    expect(hits[0].word.text).toContain('me@');
  });

  it('detects phone-like words with enough digits', () => {
    const words: OcrWord[] = [w('Call', { x0: 0, y0: 0, x1: 10, y1: 10 }), w('555-123-4567', { x0: 20, y0: 0, x1: 50, y1: 10 })];
    const hits = findRedactWordMatches(words, new Set<RedactKind>(['phone']));
    expect(hits).toHaveLength(1);
    expect(hits[0].kind).toBe('phone');
  });

  it('filters by requested kinds', () => {
    const words: OcrWord[] = [w('a@b.co', { x0: 0, y0: 0, x1: 10, y1: 10 }), w('999-999-9999', { x0: 0, y0: 20, x1: 10, y1: 30 })];
    const emailOnly = findRedactWordMatches(words, new Set<RedactKind>(['email']));
    expect(emailOnly).toHaveLength(1);
  });
});
