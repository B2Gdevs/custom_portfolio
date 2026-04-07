'use client';

import { useMemo, useState } from 'react';
import { AppsToolPageHeader } from '@/components/apps/AppsToolPageHeader';
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
      <AppsToolPageHeader title="Screenshot annotate" />

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
