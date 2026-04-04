'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';

export function ImageExport({
  blob,
  onStartAgain,
}: {
  blob: Blob;
  onStartAgain: () => void;
}) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <h2 className="font-display text-xl text-primary">Exported</h2>
        <p className="mt-2 text-sm text-text-muted">Your annotated image is ready. Nothing was uploaded to a server.</p>
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-dark-alt/50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
          <img src={url} alt="Exported annotation preview" className="mx-auto max-h-[60vh] w-auto object-contain" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={url}
            download={`screenshot-annotate-${new Date().toISOString().slice(0, 10)}.png`}
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium text-primary hover:border-accent"
          >
            Download PNG
          </a>
          <button
            type="button"
            onClick={onStartAgain}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-muted hover:border-accent hover:text-primary"
          >
            Annotate another
          </button>
          <Link
            href="/apps"
            className="inline-flex rounded-full border border-transparent px-4 py-2 text-sm text-text-muted hover:text-primary"
          >
            Back to Apps
          </Link>
        </div>
      </div>
    </div>
  );
}
