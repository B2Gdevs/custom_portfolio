'use client';

import type { RagSearchHit } from '@/lib/rag/types';
import { buildRagSourceHref } from '@/lib/rag/chat-context';

export interface SiteCopilotSourceBundle {
  query: string;
  hits: RagSearchHit[];
}

interface SiteCopilotSourcesProps {
  bundle?: SiteCopilotSourceBundle;
  isLoading?: boolean;
}

export function SiteCopilotSources({
  bundle,
  isLoading = false,
}: SiteCopilotSourcesProps) {
  if (isLoading) {
    return (
      <div className="mt-3 rounded-[1.4rem] border border-[#ddd3c5] bg-[#f6f1e9] px-4 py-3 text-xs text-[#73685f] dark:border-[#3b362f] dark:bg-[#23201c] dark:text-[#c2b8ac]">
        Looking up sources...
      </div>
    );
  }

  if (!bundle?.hits.length) {
    return null;
  }

  return (
    <details className="mt-3 overflow-hidden rounded-[1.4rem] border border-[#ddd3c5] bg-[#f6f1e9] text-sm text-[#201b18] dark:border-[#3b362f] dark:bg-[#23201c] dark:text-[#f1ebe2]">
      <summary className="cursor-pointer list-none px-4 py-3 font-medium text-[#8c4b2c] dark:text-[#d7a978]">
        Sources ({bundle.hits.length})
      </summary>
      <div className="border-t border-[#ddd3c5] px-4 py-3 dark:border-[#3b362f]">
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#7d7065] dark:text-[#b7aea3]">
          Query: {bundle.query}
        </p>
        <div className="space-y-3">
          {bundle.hits.map((hit) => (
            <article
              key={`${hit.chunkId}-${hit.sourceId}`}
              className="rounded-[1.2rem] border border-[#ddd3c5] bg-white/85 px-3 py-3 dark:border-[#3b362f] dark:bg-[#1b1815]"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#7d7065] dark:text-[#b7aea3]">
                <span>{hit.sourceScope}</span>
                {hit.heading ? <span>{hit.heading}</span> : null}
              </div>
              <p className="mt-2 text-sm font-medium text-[#2a2119] dark:text-[#f2ecdf]">{hit.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#5c524a] dark:text-[#c8bfb4]">{hit.snippet}</p>
              <a
                href={buildRagSourceHref(hit)}
                className="mt-3 inline-flex items-center text-xs font-medium text-[#8c4b2c] transition-colors hover:text-[#6b351d] dark:text-[#d7a978] dark:hover:text-[#efd0a5]"
              >
                Open source
              </a>
            </article>
          ))}
        </div>
      </div>
    </details>
  );
}
