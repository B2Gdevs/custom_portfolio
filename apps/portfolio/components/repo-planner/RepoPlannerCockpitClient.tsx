'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ExternalLink, FileCog } from 'lucide-react';
import {
  builtinEmbedPackToPlanningPack,
  PlanningCockpitDashboard,
  RepoPlannerWorkspaceShell,
} from 'repo-planner/host';
import type { BookPlanningContext } from '@/lib/repo-planner/book-planning-context';
import type { BuiltinEmbedPacksPayload } from 'repo-planner/planning-pack';
import type { PlanningPack } from '@/lib/repo-planner-workspace-storage';
import { readerAppHref } from '@/lib/reader-routes';

function EmbeddedCockpitPlaceholder() {
  return (
    <div className="flex min-h-[24rem] flex-col justify-between gap-6 bg-[radial-gradient(circle_at_top,#1f2227_0%,#121418_62%,#0b0c0f_100%)] p-6 text-slate-100">
      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.32em] text-slate-400">Repo Planner</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Live repository pane</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Planning APIs for this monorepo (<code className="rounded bg-black/30 px-1">/api/planning-state</code>, etc.)
          power the dashboard when <strong className="text-slate-200">This repository</strong> is selected. Use the
          sidebar to open <strong className="text-slate-200">built-in packs</strong> (init + docs) or add files from
          disk.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 text-amber-300">
            <FileCog className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Modular packs</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Built-in packs are generated at dev/build time; uploaded packs stay in the browser until you export JSON.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 text-amber-300">
            <ExternalLink className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">Full local editor</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            For write-capable cockpit work, run Repo Planner locally or use Codex against the repo directly.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/docs/repo-planner/planning/decisions"
          className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:border-amber-300 hover:text-amber-200"
        >
          Read embed decisions
        </Link>
        <Link
          href="/apps/repo-planner"
          className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          Open full Apps page
        </Link>
        <a
          href="https://github.com/MagicbornStudios/RepoPlanner"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          Repo Planner upstream
        </a>
      </div>
    </div>
  );
}

export function RepoPlannerCockpitClient({ bookContext }: { bookContext?: BookPlanningContext }) {
  const [builtinPacks, setBuiltinPacks] = useState<PlanningPack[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/planning-embed/builtin-packs.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload: BuiltinEmbedPacksPayload | null) => {
        if (cancelled || !payload?.packs?.length) return;
        setBuiltinPacks(payload.packs.map((p) => builtinEmbedPackToPlanningPack(p)));
      })
      .catch(() => {
        /* optional asset — cockpit still works */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RepoPlannerWorkspaceShell className="p-3 sm:p-4">
      <PlanningCockpitDashboard
        livePane={<EmbeddedCockpitPlaceholder />}
        bookContext={bookContext}
        readerAppHref={({ book }) => readerAppHref({ book })}
        builtinPacks={builtinPacks}
      />
    </RepoPlannerWorkspaceShell>
  );
}
