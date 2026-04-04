'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { Tldraw, useEditor, type Editor } from '@tldraw/tldraw';
import 'tldraw/tldraw.css';
import { ScreenshotAnnotateContextMenu } from './ScreenshotAnnotateContextMenu';
import { ScreenshotAnnotateStylePanel } from './ScreenshotAnnotateStylePanel';
import { ScreenshotAnnotateToolbar } from './ScreenshotAnnotateToolbar';

function AnnotateChrome({
  onBackToPicker,
  onExported,
}: {
  onBackToPicker: () => void;
  onExported: (blob: Blob) => void;
}) {
  const editor = useEditor();

  const handleExport = useCallback(async () => {
    const ids = Array.from(editor.getCurrentPageShapeIds());
    if (ids.length === 0) return;
    const result = await editor.toImage(ids, { format: 'png' });
    onExported(result.blob);
  }, [editor, onExported]);

  return (
    <div className="pointer-events-auto absolute top-3 left-3 z-[300] flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2">
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
        onClick={() => void handleExport()}
        className="rounded-full border border-border bg-dark-alt/95 px-3 py-1.5 text-xs font-medium text-accent backdrop-blur-sm hover:border-accent"
      >
        Export PNG
      </button>
    </div>
  );
}

async function loadImageIntoEditor(editor: Editor, file: File) {
  await editor.putExternalContent({
    type: 'files',
    files: [file],
    point: editor.getViewportPageBounds().center,
  });
  editor.zoomToFit({ animation: { duration: 220 } });
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
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="relative min-h-0 flex-1 [&_.tl-container]:absolute [&_.tl-container]:inset-0">
        <Tldraw
          components={{
            Toolbar: ScreenshotAnnotateToolbar,
            ContextMenu: ScreenshotAnnotateContextMenu,
            StylePanel: ScreenshotAnnotateStylePanel,
            InFrontOfTheCanvas: () => (
              <AnnotateChrome onBackToPicker={onBackToPicker} onExported={onExported} />
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
