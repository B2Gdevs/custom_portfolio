'use client';

import { highlightTextSegments } from '@/lib/content-discovery';

export function HighlightedText({
  text,
  query,
  highlightClassName = 'rounded bg-amber-300/20 px-0.5 text-amber-100',
}: {
  text: string;
  query: string;
  highlightClassName?: string;
}) {
  const segments = highlightTextSegments(text, query);

  return (
    <>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <mark key={`${segment.text}-${index}`} className={highlightClassName}>
            {segment.text}
          </mark>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        )
      )}
    </>
  );
}
