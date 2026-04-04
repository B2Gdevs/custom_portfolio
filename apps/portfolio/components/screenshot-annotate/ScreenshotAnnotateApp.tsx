'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ImageAnnotationEditor } from './ImageAnnotationEditor';
import { ImageExport } from './ImageExport';
import { ImagePicker } from './ImagePicker';

type Phase =
  | { phase: 'pick' }
  | { phase: 'annotate'; id: string; file: File }
  | { phase: 'export'; result: Blob };

export default function ScreenshotAnnotateApp() {
  const [state, setState] = useState<Phase>({ phase: 'pick' });

  const annotateKey = useMemo(
    () => (state.phase === 'annotate' ? state.id : ''),
    [state],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/80 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Apps</p>
          <h1 className="truncate font-display text-lg text-primary md:text-xl">Screenshot annotate</h1>
        </div>
        <Link
          href="/apps"
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-primary md:text-sm"
        >
          All apps
        </Link>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {state.phase === 'pick' ? (
          <ImagePicker
            onChooseImage={(file) =>
              setState({ phase: 'annotate', file, id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` })
            }
          />
        ) : null}

        {state.phase === 'annotate' ? (
          <ImageAnnotationEditor
            key={annotateKey}
            file={state.file}
            onBackToPicker={() => setState({ phase: 'pick' })}
            onExported={(result) => setState({ phase: 'export', result })}
          />
        ) : null}

        {state.phase === 'export' ? (
          <ImageExport blob={state.result} onStartAgain={() => setState({ phase: 'pick' })} />
        ) : null}
      </div>
    </div>
  );
}
