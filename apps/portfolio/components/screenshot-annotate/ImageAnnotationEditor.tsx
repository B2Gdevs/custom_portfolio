'use client';

import Link from 'next/link';
import { Loader2, Mail, Phone, ScanText, Shield } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Tldraw, useEditor, type Editor } from '@tldraw/tldraw';
import 'tldraw/tldraw.css';
import {
  applyRedactPresetsToEditor,
  applyScreenshotCameraConstraints,
} from '@/lib/screenshot-annotate/tldraw-screenshot-helpers';
import { errorMessageOrFallback } from '@/lib/unknown-error';
import type { RedactKind } from '@/lib/screenshot-annotate/redact-patterns';
import { ScreenshotOcrModal } from './ScreenshotOcrModal';
import { ScreenshotAnnotateContextMenu } from './ScreenshotAnnotateContextMenu';
import { ScreenshotAnnotateStylePanel } from './ScreenshotAnnotateStylePanel';
import { ScreenshotAnnotateToolbar } from './ScreenshotAnnotateToolbar';

function AnnotateChrome({
  file,
  onBackToPicker,
  onExported,
  onOpenTextScan,
}: {
  file: File;
  onBackToPicker: () => void;
  onExported: (blob: Blob) => void;
  onOpenTextScan: () => void;
}) {
  const editor = useEditor();
  const [redactBusy, setRedactBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    const ids = Array.from(editor.getCurrentPageShapeIds());
    if (ids.length === 0) return;
    const result = await editor.toImage(ids, { format: 'png' });
    onExported(result.blob);
  }, [editor, onExported]);

  const runRedact = useCallback(
    async (kinds: RedactKind[]) => {
      setRedactBusy(true);
      setHint(null);
      try {
        const { added } = await applyRedactPresetsToEditor(editor, file, kinds);
        setHint(
          added === 0
            ? 'No matching emails or phone numbers found on this image.'
            : `Added ${added} redact box${added === 1 ? '' : 'es'}. Drag to adjust if needed.`,
        );
      } catch (e) {
        setHint(errorMessageOrFallback(e, 'Could not run redact.'));
      } finally {
        setRedactBusy(false);
      }
    },
    [editor, file],
  );

  return (
    <div className="pointer-events-auto absolute top-3 left-3 z-[300] flex max-w-[calc(100%-1.5rem)] flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/apps"
        className="rounded-full border border-border bg-dark-alt/95 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-sm hover:border-accent"
      >
        Apps
      </Link>
      <button
        type="button"
        onClick={onBackToPicker}
        className="rounded-full border border-border bg-dark-alt/95 px-3 py-1.5 text-xs font-medium text-text-muted backdrop-blur-sm hover:border-accent hover:text-primary"
      >
        New image
      </button>
      <button
        type="button"
        onClick={onOpenTextScan}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-dark-alt/95 px-3 py-1.5 text-xs font-medium text-text-muted backdrop-blur-sm hover:border-accent hover:text-primary"
      >
        <ScanText className="h-3.5 w-3.5" aria-hidden />
        Text scan
      </button>
      <button
        type="button"
        disabled={redactBusy}
        onClick={() => void runRedact(['email'])}
        title="Cover detected email addresses (OCR)"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-dark-alt/95 px-3 py-1.5 text-xs font-medium text-text-muted backdrop-blur-sm hover:border-accent hover:text-primary disabled:opacity-50"
      >
        {redactBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Mail className="h-3.5 w-3.5" aria-hidden />}
        Redact emails
      </button>
      <button
        type="button"
        disabled={redactBusy}
        onClick={() => void runRedact(['phone'])}
        title="Cover detected phone numbers (OCR)"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-dark-alt/95 px-3 py-1.5 text-xs font-medium text-text-muted backdrop-blur-sm hover:border-accent hover:text-primary disabled:opacity-50"
      >
        {redactBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Phone className="h-3.5 w-3.5" aria-hidden />}
        Redact phones
      </button>
      <button
        type="button"
        disabled={redactBusy}
        onClick={() => void runRedact(['email', 'phone'])}
        title="Cover detected emails and phone numbers (OCR)"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-dark-alt/95 px-3 py-1.5 text-xs font-medium text-text-muted backdrop-blur-sm hover:border-accent hover:text-primary disabled:opacity-50"
      >
        {redactBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Shield className="h-3.5 w-3.5" aria-hidden />}
        Redact both
      </button>
      <button
        type="button"
        onClick={() => void handleExport()}
        className="rounded-full border border-border bg-dark-alt/95 px-3 py-1.5 text-xs font-medium text-accent backdrop-blur-sm hover:border-accent"
      >
        Export PNG
      </button>
      </div>
      {hint ? (
        <p className="max-w-xl rounded-lg border border-border/60 bg-dark-alt/90 px-2.5 py-1.5 text-[0.7rem] leading-snug text-text-muted" role="status">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

async function loadImageIntoEditor(editor: Editor, file: File) {
  try {
    await editor.putExternalContent({
      type: 'files',
      files: [file],
      point: editor.getViewportPageBounds().center,
    });
    applyScreenshotCameraConstraints(editor);
  } catch (err) {
    console.error('[screenshot-annotate] Failed to load pasted image into editor', err);
  }
}

export function ImageAnnotationEditor({
  file,
  onBackToPicker,
  onExported,
}: {
  file: File;
  onBackToPicker: () => void;
  onExported: (blob: Blob) => void;
}) {
  const [textScanOpen, setTextScanOpen] = useState(false);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      {textScanOpen ? (
        <ScreenshotOcrModal
          key={`${file.size}-${file.lastModified}-${file.name}`}
          file={file}
          onClose={() => setTextScanOpen(false)}
        />
      ) : null}
      <div className="relative min-h-0 flex-1 [&_.tl-container]:absolute [&_.tl-container]:inset-0">
        <Tldraw
          components={{
            Toolbar: ScreenshotAnnotateToolbar,
            ContextMenu: ScreenshotAnnotateContextMenu,
            StylePanel: ScreenshotAnnotateStylePanel,
            InFrontOfTheCanvas: () => (
              <AnnotateChrome
                file={file}
                onBackToPicker={onBackToPicker}
                onExported={onExported}
                onOpenTextScan={() => setTextScanOpen(true)}
              />
            ),
          }}
          onMount={(editor) => {
            void loadImageIntoEditor(editor, file);
          }}
        />
      </div>
    </div>
  );
}
