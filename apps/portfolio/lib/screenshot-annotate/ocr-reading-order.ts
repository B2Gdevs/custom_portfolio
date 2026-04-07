/** Tesseract bbox in image pixel space (origin top-left). */
export type OcrBbox = { x0: number; y0: number; x1: number; y1: number };

export type OcrLine = { text: string; bbox: OcrBbox; confidence: number };

export function ocrLineKey(line: OcrLine): string {
  return `${line.bbox.x0}-${line.bbox.y0}-${line.bbox.x1}-${line.bbox.y1}-${line.text.slice(0, 32)}`;
}

/** Sort lines top-to-bottom, then left-to-right when on the same row. */
export function sortLinesReadingOrder(lines: OcrLine[], rowSlopPx = 14): OcrLine[] {
  return [...lines].sort((a, b) => {
    const dy = a.bbox.y0 - b.bbox.y0;
    if (Math.abs(dy) > rowSlopPx) {
      return a.bbox.y0 - b.bbox.y0;
    }
    return a.bbox.x0 - b.bbox.x0;
  });
}

export function joinLinesAsPlainText(lines: OcrLine[]): string {
  return sortLinesReadingOrder(lines)
    .map((l) => l.text.trim())
    .filter(Boolean)
    .join('\n');
}
