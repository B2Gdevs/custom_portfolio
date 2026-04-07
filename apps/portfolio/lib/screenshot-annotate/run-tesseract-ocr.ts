import type { OcrLine } from './ocr-reading-order';
import { sortLinesReadingOrder } from './ocr-reading-order';

/**
 * Runs Tesseract in a Web Worker (tesseract.js default). Lazy-loads the library on first call.
 * All processing stays in the browser — no server upload.
 */
export async function runTesseractOnFile(
  file: File,
  onProgress?: (status: string, progress: number) => void,
): Promise<OcrLine[]> {
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
      data: { lines },
    } = await worker.recognize(file);
    const raw: OcrLine[] = (lines ?? [])
      .map((line) => ({
        text: line.text.replace(/\s+/g, ' ').trim(),
        bbox: { ...line.bbox },
        confidence: line.confidence,
      }))
      .filter((l) => l.text.length > 0);
    return sortLinesReadingOrder(raw);
  } finally {
    await worker.terminate();
  }
}
