import type { OcrBbox } from './ocr-reading-order';

export type OcrWord = { text: string; bbox: OcrBbox; confidence: number };

/** Word-level OCR for redact presets (same worker path as line OCR). */
export async function runTesseractWords(
  file: File,
  onProgress?: (status: string, progress: number) => void,
): Promise<OcrWord[]> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(m.status, m.progress);
      }
    },
  });

  try {
    const {
      data: { words },
    } = await worker.recognize(file);
    const raw: OcrWord[] = (words ?? [])
      .map((w) => ({
        text: w.text.trim(),
        bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 },
        confidence: w.confidence,
      }))
      .filter((w) => w.text.length > 0);
    return sortWordsReadingOrder(raw);
  } finally {
    await worker.terminate();
  }
}

function sortWordsReadingOrder(words: OcrWord[]): OcrWord[] {
  return [...words].sort((a, b) => {
    const dy = a.bbox.y0 - b.bbox.y0;
    if (Math.abs(dy) > 10) return a.bbox.y0 - b.bbox.y0;
    return a.bbox.x0 - b.bbox.x0;
  });
}
