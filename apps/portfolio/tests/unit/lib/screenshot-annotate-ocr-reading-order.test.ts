import { describe, expect, it } from 'vitest';
import {
  joinLinesAsPlainText,
  ocrLineKey,
  sortLinesReadingOrder,
  type OcrLine,
} from '@/lib/screenshot-annotate/ocr-reading-order';

describe('ocr-reading-order', () => {
  it('sorts lines top-to-bottom then left-to-right', () => {
    const lines: OcrLine[] = [
      { text: 'b', bbox: { x0: 10, y0: 40, x1: 20, y1: 50 }, confidence: 90 },
      { text: 'a', bbox: { x0: 10, y0: 10, x1: 20, y1: 20 }, confidence: 90 },
      { text: 'c', bbox: { x0: 30, y0: 10, x1: 40, y1: 20 }, confidence: 90 },
    ];
    const sorted = sortLinesReadingOrder(lines);
    expect(sorted.map((l) => l.text).join(',')).toBe('a,c,b');
  });

  it('joinLinesAsPlainText preserves reading order', () => {
    const lines: OcrLine[] = [
      { text: 'Second row', bbox: { x0: 0, y0: 30, x1: 10, y1: 40 }, confidence: 90 },
      { text: 'First row', bbox: { x0: 0, y0: 0, x1: 10, y1: 10 }, confidence: 90 },
    ];
    expect(joinLinesAsPlainText(lines)).toBe('First row\nSecond row');
  });

  it('ocrLineKey is stable for the same line', () => {
    const line: OcrLine = {
      text: 'Hello',
      bbox: { x0: 1, y0: 2, x1: 3, y1: 4 },
      confidence: 99,
    };
    expect(ocrLineKey(line)).toBe(ocrLineKey(line));
  });
});
