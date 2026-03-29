'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command, FileText, FolderKanban, Search, X } from 'lucide-react';
import type { ModalShellProps } from '@/lib/modal-types';
import type { DiscoverySearchHit } from '@/lib/content-discovery';
import { HighlightedText } from '@/components/content/HighlightedText';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SearchResponse = {
  query: string;
  hits: DiscoverySearchHit[];
};

const GROUP_LABELS = {
  blog: 'Blog',
  projects: 'Projects',
} as const;

function groupHits(hits: DiscoverySearchHit[]) {
  const groups = new Map<string, DiscoverySearchHit[]>();
  for (const hit of hits) {
    const key = hit.item.kind;
    groups.set(key, [...(groups.get(key) ?? []), hit]);
  }
  return Array.from(groups.entries());
}

export function ContentCommandPaletteModal({ onClose, payload }: ModalShellProps) {
  const router = useRouter();
  const [query, setQuery] = useState(typeof payload?.initialQuery === 'string' ? payload.initialQuery : '');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadResults() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('q', query);

      try {
        const response = await fetch(`/api/content/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Search request failed.');
        }
        const data = (await response.json()) as SearchResponse;
        setResults(data);
      } catch (cause: unknown) {
        if (cause instanceof DOMException && cause.name === 'AbortError') {
          return;
        }
        setError(cause instanceof Error ? cause.message : 'Search request failed.');
      } finally {
        setLoading(false);
      }
    }

    void loadResults();

    return () => controller.abort();
  }, [query]);

  const grouped = groupHits(results?.hits ?? []);

  return (
    <div className="fixed inset-0 z-[210] flex items-start justify-center p-4 sm:p-8">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search blog and projects"
        className="relative z-[211] mt-[10vh] flex max-h-[78vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-border/80 bg-[#171412]/95 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-dark-alt/80 text-primary">
            <Search size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Search</p>
                <h2 className="font-serif text-2xl text-primary">Blog + Projects</h2>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-dark-alt/70 px-3 py-1 text-xs text-text-muted sm:inline-flex">
                <Command size={14} />
                <span>⌘K / Ctrl+K</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close search">
            <X size={18} />
          </Button>
        </div>

        <div className="border-b border-border/60 px-5 py-4">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search posts, projects, sections, and keywords..."
            className="h-12 rounded-2xl border-border/80 bg-dark-alt/80 px-4 text-base"
            aria-label="Search blog and projects"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-sm text-text-muted">Searching…</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : grouped.length === 0 ? (
            <p className="text-sm text-text-muted">No matching blog posts or projects yet.</p>
          ) : (
            <div className="space-y-6">
              {grouped.map(([kind, hits]) => (
                <section key={kind} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-text-muted">
                    {kind === 'projects' ? <FolderKanban size={14} /> : <FileText size={14} />}
                    <span>{GROUP_LABELS[kind as keyof typeof GROUP_LABELS]}</span>
                  </div>
                  <div className="space-y-2">
                    {hits.map((hit) => (
                      <button
                        key={`${kind}-${hit.item.slug}`}
                        type="button"
                        onClick={() => {
                          router.push(hit.item.href);
                          onClose();
                        }}
                        className="w-full rounded-2xl border border-border/70 bg-dark-alt/60 px-4 py-3 text-left transition hover:border-accent/60 hover:bg-dark-alt"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-serif text-lg text-primary">
                              <HighlightedText text={hit.item.title} query={results?.query ?? ''} />
                            </p>
                            <p className="mt-1 text-sm text-text-muted">
                              <HighlightedText text={hit.snippet || hit.item.description} query={results?.query ?? ''} />
                            </p>
                          </div>
                          <span className="rounded-full border border-border/70 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-text-muted">
                            {GROUP_LABELS[kind as keyof typeof GROUP_LABELS]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
