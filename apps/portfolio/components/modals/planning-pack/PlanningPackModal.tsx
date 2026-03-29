'use client';

import { useCallback, useEffect, useState } from 'react';
import { marked } from 'marked';
import { X } from 'lucide-react';
import {
  PlanningPackGallery,
  stripPlanningPackPreviewPreamble,
} from 'repo-planner/planning-pack';
import type { ModalShellProps } from '@/lib/modal-types';
import type { PlanningPackItem, PlanningPackManifest } from '@/lib/planning-pack-manifest';

type Tab = 'demo' | 'site';

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

  const renderMarkdown = useCallback((md: string) => marked.parse(md, { async: false, gfm: true }) as string, []);

  const openExpand = useCallback(
    async (item: PlanningPackItem) => {
      setExpanded(item);
      setDocLoading(true);
      setDocHtml('');
      try {
        const r = await fetch(item.file);
        const text = await r.text();
        const html = renderMarkdown(text);
        setDocHtml(html);
      } finally {
        setDocLoading(false);
      }
    },
    [renderMarkdown],
  );

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

        <PlanningPackGallery
          manifest={manifest}
          loadError={loadError}
          tab={tab}
          onTab={setTab}
          expanded={expanded}
          docHtml={docHtml}
          docLoading={docLoading}
          onCloseExpand={() => setExpanded(null)}
          onExpand={(item) => void openExpand(item)}
          renderMarkdown={renderMarkdown}
          stripForPreview={stripPlanningPackPreviewPreamble}
        />
      </div>
    </div>
  );
}
