'use client';

import { Copy, Loader2, ScanText, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OcrLine } from '@/lib/screenshot-annotate/ocr-reading-order';
import { joinLinesAsPlainText, ocrLineKey } from '@/lib/screenshot-annotate/ocr-reading-order';
import { runTesseractOnFile } from '@/lib/screenshot-annotate/run-tesseract-ocr';

function pickLineAtCanvasPoint(
  lines: OcrLine[],
  px: number,
  py: number,
  scaleX: number,
  scaleY: number,
): OcrLine | null {
  const ix = px / scaleX;
  const iy = py / scaleY;
  for (let i = lines.length - 1; i >= 0; i--) {
    const { bbox } = lines[i];
    if (ix >= bbox.x0 && ix <= bbox.x1 && iy >= bbox.y0 && iy <= bbox.y1) {
      return lines[i];
    }
  }
  return null;
}

export function ScreenshotOcrModal({
  file,
  onClose,
}: {
  file: File;
  onClose: () => void;
}) {
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lines, setLines] = useState<OcrLine[]>([]);
  const [progressLabel, setProgressLabel] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedHint, setCopiedHint] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await runTesseractOnFile(file, (status, p) => {
          if (!cancelled) {
            setProgressLabel(`${status} ${Math.round(p * 100)}%`);
          }
        });
        if (!cancelled) {
          setLines(result);
          setPhase('ready');
          setProgressLabel('');
        }
      } catch (e) {
        if (!cancelled) {
          setPhase('error');
          setErrorMessage(e instanceof Error ? e.message : 'OCR failed.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const redrawSpotlight = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || lines.length === 0 || !img.naturalWidth) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const cw = img.clientWidth;
    const ch = img.clientHeight;
    canvas.width = Math.max(1, Math.floor(cw * window.devicePixelRatio));
    canvas.height = Math.max(1, Math.floor(ch * window.devicePixelRatio));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const scaleX = cw / w;
    const scaleY = ch / h;

    ctx.drawImage(img, 0, 0, cw, ch);
    ctx.fillStyle = 'rgba(12, 8, 6, 0.68)';
    ctx.fillRect(0, 0, cw, ch);

    for (const line of lines) {
      const b = line.bbox;
      ctx.clearRect(b.x0 * scaleX, b.y0 * scaleY, (b.x1 - b.x0) * scaleX, (b.y1 - b.y0) * scaleY);
    }

    ctx.strokeStyle = 'rgba(213, 176, 131, 0.95)';
    ctx.lineWidth = 2;
    for (const line of lines) {
      const b = line.bbox;
      const key = ocrLineKey(line);
      if (selectedId === key) {
        ctx.strokeStyle = 'rgba(255, 220, 170, 1)';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'rgba(213, 176, 131, 0.85)';
        ctx.lineWidth = 2;
      }
      ctx.strokeRect(b.x0 * scaleX, b.y0 * scaleY, (b.x1 - b.x0) * scaleX, (b.y1 - b.y0) * scaleY);
    }
  }, [lines, selectedId]);

  useEffect(() => {
    redrawSpotlight();
  }, [redrawSpotlight]);

  useEffect(() => {
    if (phase !== 'ready') return;
    const ro = new ResizeObserver(() => redrawSpotlight());
    if (wrapRef.current) ro.observe(wrapRef.current);
    const img = imgRef.current;
    if (img?.complete) redrawSpotlight();
    return () => ro.disconnect();
  }, [phase, redrawSpotlight]);

  const copyText = useCallback(async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHint(label);
      window.setTimeout(() => setCopiedHint(null), 2000);
    } catch {
      setCopiedHint('Copy blocked');
      window.setTimeout(() => setCopiedHint(null), 2000);
    }
  }, []);

  const onCanvasClick = useCallback(
    (ev: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img || !img.naturalWidth) return;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const w = img.naturalWidth;
      const nh = img.naturalHeight;
      const cw = img.clientWidth;
      const ch = img.clientHeight;
      const scaleX = cw / w;
      const scaleY = ch / nh;
      const hit = pickLineAtCanvasPoint(lines, x, y, scaleX, scaleY);
      if (hit) {
        setSelectedId(ocrLineKey(hit));
        void copyText('line', hit.text);
      }
    },
    [lines, copyText],
  );

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="screenshot-ocr-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[min(92vh,52rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-dark-alt shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <ScanText className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            <div className="min-w-0">
              <p id="screenshot-ocr-title" className="font-medium text-primary">
                Text scan
              </p>
              <p className="truncate text-xs text-text-muted">
                Dimmed regions are de-emphasized; lit boxes are detected lines. Click a line on the image or use the list to copy.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {phase === 'ready' && lines.length > 0 ? (
              <button
                type="button"
                onClick={() => void copyText('all', joinLinesAsPlainText(lines))}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-primary hover:border-accent"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden />
                Copy all text
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted hover:border-accent hover:text-primary"
              aria-label="Close text scan"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {phase === 'loading' ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-sm text-text-muted">
              <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
              <p>Loading OCR… {progressLabel}</p>
            </div>
          ) : null}

          {phase === 'error' ? (
            <div className="px-6 py-10 text-sm text-red-300">
              {errorMessage ?? 'Could not read text from this image.'}
            </div>
          ) : null}

          {phase === 'ready' ? (
            <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_min(20rem,40vw)]">
              <div className="flex justify-center">
                <div
                  ref={wrapRef}
                  className="relative inline-block max-w-full overflow-hidden rounded-xl border border-border/60 bg-black/20"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- object URL from user file */}
                  <img
                    ref={imgRef}
                    src={objectUrl}
                    alt=""
                    className="block h-auto max-h-[min(58vh,28rem)] w-auto max-w-full object-contain"
                    onLoad={redrawSpotlight}
                  />
                  <canvas
                    ref={canvasRef}
                    className={
                      lines.length > 0
                        ? 'pointer-events-auto absolute inset-0 h-full w-full cursor-crosshair'
                        : 'pointer-events-none absolute inset-0 h-full w-full'
                    }
                    onClick={lines.length > 0 ? onCanvasClick : undefined}
                    aria-hidden
                  />
                </div>
              </div>

              <div className="flex min-h-[12rem] flex-col gap-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Detected lines
                </p>
                {lines.length === 0 ? (
                  <p className="text-sm text-text-muted">No text found.</p>
                ) : (
                  <ul className="max-h-[min(58vh,28rem)] space-y-1.5 overflow-y-auto pr-1">
                    {lines.map((line) => {
                      const id = ocrLineKey(line);
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(id);
                              void copyText('line', line.text);
                            }}
                            className={[
                              'w-full rounded-lg border px-2.5 py-2 text-left text-sm leading-snug transition-colors',
                              selectedId === id
                                ? 'border-accent bg-accent/15 text-primary'
                                : 'border-border/70 bg-background/40 text-text-muted hover:border-accent/60 hover:text-primary',
                            ].join(' ')}
                          >
                            {line.text}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {copiedHint ? (
          <p className="border-t border-border px-4 py-2 text-center text-xs text-accent" role="status">
            Copied {copiedHint === 'all' ? 'all text' : 'line'} to clipboard.
          </p>
        ) : null}
      </div>
    </div>
  );
}
