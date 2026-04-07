'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { errorMessageOrFallback } from '@/lib/unknown-error';

function stripHtmlComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, '').trim();
}

export function Mermaid({ chart }: { chart: string }) {
  const reactId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cleaned = stripHtmlComments(chart);

    async function run() {
      setError(null);
      if (!cleaned) return;

      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        });
        if (cancelled || !containerRef.current) return;
        const { svg } = await mermaid.render(`mermaid-${reactId}`, cleaned);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled) {
          setError(errorMessageOrFallback(e, 'Failed to render diagram'));
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (!stripHtmlComments(chart)) {
    return null;
  }

  return (
    <figure className="my-8 rounded-lg border border-border bg-dark-alt p-4 overflow-x-auto">
      <div
        ref={containerRef}
        className="mermaid flex justify-center min-h-[120px] [&_svg]:max-w-full"
        aria-label="Mermaid diagram"
      />
      {error && (
        <figcaption className="mt-3 text-sm text-red-300 font-mono px-1">{error}</figcaption>
      )}
    </figure>
  );
}
