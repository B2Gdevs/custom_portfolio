import type { OcrWord } from './ocr-words';

export type RedactKind = 'email' | 'phone';

/** Reasonable email pattern (not RFC-complete; good for screenshots). */
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

/**
 * Phone-like runs: optional +, digits/spaces/dots/dashes/parens, 7+ digits total.
 * Matches many US/international formats in UI screenshots.
 */
const PHONE_RE = /(?:\+?\d[\d\s().-]{5,}\d|\(\d{3}\)\s*\d{3}[-.]?\d{4}|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b)/g;

function stripNoise(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function countDigits(s: string): number {
  return (s.match(/\d/g) ?? []).length;
}

/** Words to cover with redact rectangles, with kind for styling. */
export function findRedactWordMatches(
  words: readonly OcrWord[],
  kinds: ReadonlySet<RedactKind>,
): { word: OcrWord; kind: RedactKind }[] {
  const out: { word: OcrWord; kind: RedactKind }[] = [];
  const used = new Set<string>();

  for (const w of words) {
    const t = stripNoise(w.text);
    if (!t) continue;
    const key = `${w.bbox.x0}-${w.bbox.y0}-${w.bbox.x1}-${w.bbox.y1}`;

    if (kinds.has('email')) {
      EMAIL_RE.lastIndex = 0;
      if (EMAIL_RE.test(t) && !used.has(`email:${key}`)) {
        used.add(`email:${key}`);
        out.push({ word: w, kind: 'email' });
        continue;
      }
    }

    if (kinds.has('phone')) {
      PHONE_RE.lastIndex = 0;
      if (PHONE_RE.test(t) && countDigits(t) >= 7 && !used.has(`phone:${key}`)) {
        used.add(`phone:${key}`);
        out.push({ word: w, kind: 'phone' });
      }
    }
  }

  return out;
}
