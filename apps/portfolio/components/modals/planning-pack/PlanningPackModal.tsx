'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { marked } from 'marked';
import { ChevronDown, Download, Expand, X } from 'lucide-react';
import type { ModalShellProps } from '@/lib/modal-types';
import type { PlanningPackItem, PlanningPackManifest } from '@/lib/planning-pack-manifest';

type Tab = 'demo' | 'site';

/** Strip generated HTML comment + optional YAML frontmatter for preview body. */
function stripForPreview(raw: string): string {
  let t = raw.replace(/^<!--[\s\S]*?-->\s*/m, '');
  t = t.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '');
  return t.trimStart();
}

export function PlanningPackModal({ onClose }: ModalShellProps) {
  const [manifest, setManifest] = useState<PlanningPackManifest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('demo');
  const [expanded, setExpanded] = useState<PlanningPackItem | null>(null);
  const [docHtml, setDocHtml] = useState<string>('');
  const [docLoading, setDocLoading] = useState(false);

  useEffect(() => {
    fetch('/planning-pack/manifest.json')
      .then((r) => {
        if (!r.ok) {
          throw new Error(
            'Planning manifest missing. Run `pnpm dev` or `pnpm run build` so build-planning-pack runs.',
          );
        }
        return r.json();
      })
      .then((m: PlanningPackManifest) => setManifest(m))
      .catch((e: unknown) =>
        setLoadError(e instanceof Error ? e.message : 'Failed to load planning pack.'),
      );
  }, []);

  const items = useMemo(() => {
    if (!manifest) return [];
    return tab === 'demo' ? manifest.demo : manifest.site;
  }, [manifest, tab]);

  const grouped = useMemo(() => {
    const m = new Map<string, PlanningPackItem[]>();
    for (const it of items) {
      const k = it.sectionLabel;
      m.set(k, [...(m.get(k) || []), it]);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        setExpanded(null);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [expanded]);

  const openExpand = useCallback(async (item: PlanningPackItem) => {
    setExpanded(item);
    setDocLoading(true);
    setDocHtml('');
    try {
      const r = await fetch(item.file);
      const text = await r.text();
      const html = marked.parse(text, { async: false, gfm: true }) as string;
      setDocHtml(html);
    } finally {
      setDocLoading(false);
    }
  }, []);

  const siteSections = tab === 'site';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[201] flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-dark-alt shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border/80 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Planning pack</p>
            <h2 className="font-display text-2xl text-primary">Download and preview</h2>
            <p className="mt-1 max-w-xl text-sm text-text-muted">
              Starter templates (demo) and exported planning pages from this site&apos;s documentation
              sections. Repository <code className="text-accent">.planning</code> files are not included
              in this gallery.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border p-2 text-text-muted transition hover:border-accent hover:text-primary"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex gap-2 border-b border-border/60 px-5 py-2">
          <TabBtn active={tab === 'demo'} onClick={() => setTab('demo')}>
            Starter template
          </TabBtn>
          <TabBtn active={tab === 'site'} onClick={() => setTab('site')}>
            This site
          </TabBtn>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {loadError ? (
            <p className="text-sm text-red-400">{loadError}</p>
          ) : !manifest ? (
            <p className="text-sm text-text-muted">Loading manifest…</p>
          ) : siteSections ? (
            <div className="space-y-3">
              {grouped.map(([label, group]) => (
                <PlanningSectionCollapsible
                  key={label}
                  label={label}
                  slugHint={group[0]?.section}
                  count={group.length}
                  items={group}
                  onExpand={openExpand}
                />
              ))}
            </div>
          ) : (
            grouped.map(([label, group]) => (
              <section key={label} className="mb-10 last:mb-0">
                <h3 className="mb-4 font-display text-lg text-primary">{label}</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((item) => (
                    <PlanCard key={item.id} item={item} onExpand={() => void openExpand(item)} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {expanded ? (
        <div className="fixed inset-0 z-[210] flex">
          <button
            type="button"
            className="min-h-0 min-w-0 flex-1 bg-black/55 backdrop-blur-[2px]"
            aria-label="Close preview"
            onClick={() => setExpanded(null)}
          />
          <div className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-border bg-dark shadow-2xl sm:max-w-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-primary">{expanded.title}</p>
                <p className="truncate text-xs text-text-muted">{expanded.filename}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <a
                  href={expanded.file}
                  download={expanded.filename}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-primary hover:border-accent"
                >
                  <Download size={14} />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setExpanded(null)}
                  className="rounded-full border border-border p-2 text-text-muted hover:text-primary"
                  aria-label="Back to gallery"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {docLoading ? (
                <p className="text-sm text-text-muted">Loading…</p>
              ) : (
                <article
                  className="prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-a:text-accent prose-code:text-text"
                  dangerouslySetInnerHTML={{ __html: docHtml }}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlanningSectionCollapsible({
  label,
  slugHint,
  count,
  items,
  onExpand,
}: {
  label: string;
  slugHint?: string;
  count: number;
  items: PlanningPackItem[];
  onExpand: (item: PlanningPackItem) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-dark/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04]"
        aria-expanded={open}
      >
        <ChevronDown
          size={20}
          className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg text-primary">{label}</p>
          {slugHint ? (
            <p className="truncate text-xs text-text-muted">
              Section <code className="text-accent/90">{slugHint}</code> · {count} file{count === 1 ? '' : 's'}
            </p>
          ) : (
            <p className="text-xs text-text-muted">
              {count} file{count === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </button>
      {open ? (
        <div className="border-t border-border/50 px-4 pb-5 pt-2">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <PlanCard key={item.id} item={item} onExpand={() => void onExpand(item)} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-primary text-secondary' : 'text-text-muted hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}

const PREVIEW_CHAR_CAP = 4500;

function PlanCard({
  item,
  onExpand,
}: {
  item: PlanningPackItem;
  onExpand: () => void;
}) {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(item.file)
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        const body = stripForPreview(text);
        const slice = body.slice(0, PREVIEW_CHAR_CAP);
        const html = marked.parse(slice, { async: false, gfm: true }) as string;
        setPreviewHtml(html);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [item.file]);

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border/80 bg-gradient-to-br from-[#161618] via-dark-alt to-zinc-950 shadow-inner">
        <div className="absolute left-0 top-0 h-full w-1 bg-red-700/90" aria-hidden />

        <div className="absolute inset-0 bottom-[4.5rem] overflow-hidden">
          {loading ? (
            <div className="flex h-full flex-col gap-2 p-3 pt-4">
              <div className="h-2 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-2 w-full animate-pulse rounded bg-white/10" />
              <div className="h-2 w-5/6 animate-pulse rounded bg-white/10" />
              <div className="mt-4 h-2 w-full animate-pulse rounded bg-white/10" />
              <div className="h-2 w-11/12 animate-pulse rounded bg-white/10" />
            </div>
          ) : failed || !previewHtml ? (
            <div className="flex h-full items-center justify-center p-4 text-center text-xs text-text-muted">
              Preview unavailable
            </div>
          ) : (
            <>
              <div
                className="pointer-events-none absolute left-0 top-0 origin-top-left text-[13px] leading-snug"
                style={{
                  width: 'min(420px, 135%)',
                  transform: 'scale(0.38)',
                  transformOrigin: 'top left',
                }}
              >
                <div
                  className="prose prose-invert max-w-none px-3 pt-3 prose-headings:my-1 prose-headings:text-[0.95rem] prose-headings:font-semibold prose-headings:text-primary prose-p:my-1 prose-p:text-text/90 prose-li:my-0 prose-li:text-text/90 prose-table:text-[11px] prose-th:px-1 prose-td:px-1 prose-code:text-[10px] prose-pre:text-[10px] prose-a:text-accent/90 prose-a:no-underline"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#121214] via-[#121214]/85 to-transparent"
                aria-hidden
              />
            </>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#121214]/95 px-3 py-2.5 backdrop-blur-sm">
          <p className="line-clamp-2 font-medium leading-snug text-primary">{item.title}</p>
          <p className="mt-0.5 truncate text-xs text-text-muted">{item.filename}</p>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-4 bg-black/0 opacity-0 transition group-hover:pointer-events-auto group-hover:bg-black/55 group-hover:opacity-100">
          <a
            href={item.file}
            download={item.filename}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-dark/90 text-primary shadow-lg backdrop-blur hover:border-accent hover:bg-dark"
            title="Download"
            aria-label={`Download ${item.filename}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={22} />
          </a>
          <button
            type="button"
            onClick={onExpand}
            className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-dark/90 text-primary shadow-lg backdrop-blur hover:border-accent hover:bg-dark"
            title="Read"
            aria-label={`Read ${item.title}`}
          >
            <Expand size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
