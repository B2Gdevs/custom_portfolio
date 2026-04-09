'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { PlanningPackFileTree } from '@/components/planning/PlanningPackFileTree';
import type {
  BuiltinEmbedPacksPayload,
  PlanningPackGalleryTab,
  PlanningPackManifest,
} from '@/lib/planning-pack-types';
import type { ModalShellProps } from '@/lib/modal-types';
import { errorMessageOrFallback } from '@/lib/unknown-error';
import { buildPlanningPackGalleryTabs } from '@/lib/planning-pack-modal-data';

const DEFAULT_TAB_ID = 'starter-template';

export function PlanningPackModal({ onClose }: ModalShellProps) {
  const [tabs, setTabs] = useState<PlanningPackGalleryTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>(DEFAULT_TAB_ID);

  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];
    const createObjectUrl = (input: { content: string; filename: string }) => {
      const blob = new Blob([input.content], { type: 'text/markdown;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      objectUrls.push(objectUrl);
      return objectUrl;
    };

    Promise.all([
      fetch('/api/planning-pack/manifest')
        .then((r) => (r.ok ? (r.json() as Promise<PlanningPackManifest>) : null))
        .catch(() => null),
      fetch('/planning-embed/builtin-packs.json')
        .then((r) => (r.ok ? (r.json() as Promise<BuiltinEmbedPacksPayload>) : null))
        .catch(() => null),
    ])
      .then(([siteManifest, builtinPayload]) => {
        if (cancelled) {
          return;
        }

        const nextTabs = buildPlanningPackGalleryTabs({
          manifest: siteManifest,
          builtinPayload,
          createObjectUrl,
        });

        if (nextTabs.length === 0) {
          throw new Error(
            'Planning pack data missing. Run `pnpm dev` or `pnpm run build` so planning-pack and planning-embed builders run.',
          );
        }

        setTabs(nextTabs);
        setTab(nextTabs[0]?.id ?? DEFAULT_TAB_ID);
        setLoadError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) {
          return;
        }

        setLoadError(errorMessageOrFallback(e, 'Failed to load planning pack.'));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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
        className="relative z-[201] flex h-[min(88vh,52rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-dark-alt shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border/80 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Planning pack</p>
            <h2 className="font-display text-2xl text-primary">GAD exports & starter template</h2>
            <p className="mt-1 max-w-lg text-sm text-text-muted">
              Browse and download a GAD-shaped starter scaffold plus this site&apos;s Markdown exports. Live planning
              state lives under{' '}
              <Link href="/docs/get-anything-done/planning/state" className="text-accent hover:underline">
                get-anything-done — planning state
              </Link>
              . Upstream methodology:{' '}
              <a
                href="https://github.com/MagicbornStudios/get-anything-done"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                get-anything-done on GitHub
              </a>
              .
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

        <div className="min-h-0 flex-1 overflow-hidden">
          <PlanningPackFileTree
            tabs={tabs}
            loading={loading}
            loadError={loadError}
            tab={tab}
            onTab={setTab}
          />
        </div>
      </div>
    </div>
  );
}
