'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { BookOpen, FolderOpen, HardDrive, LayoutDashboard, Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { readerAppHref } from '@/lib/reader-routes';
import type { BookPlanningContext } from '@/lib/repo-planner/book-planning-context';
import {
  defaultWorkspaceState,
  loadWorkspaceState,
  readFilesAsPack,
  saveWorkspaceState,
  type WorkspaceStateV1,
} from '@/lib/repo-planner-workspace-storage';

type Props = {
  /** Live monorepo pane (APIs, placeholder, or future full cockpit). */
  livePane: React.ReactNode;
  /** When set (e.g. opened from reader), show book strip + optional reader tab. */
  bookContext?: BookPlanningContext;
};

export function PlanningCockpitDashboard({ livePane, bookContext }: Props) {
  const [state, setState] = useState<WorkspaceStateV1>(defaultWorkspaceState);
  const [hydrated, setHydrated] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'workspace' | 'reader'>('workspace');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(loadWorkspaceState());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: WorkspaceStateV1) => {
    setState(next);
    const r = saveWorkspaceState(next);
    if (!r.ok) setSaveError(r.error);
    else setSaveError(null);
  }, []);

  const active = state.projects.find((p) => p.id === state.activeProjectId) ?? state.projects[0];
  const activePack = active?.kind === 'pack' ? state.packs[active.packId] : undefined;

  const selectProject = (id: string) => {
    persist({ ...state, activeProjectId: id });
  };

  const addPackFromFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setSaveError(null);
    try {
      const pack = await readFilesAsPack(files);
      const projectId = `pack-${pack.id}`;
      const next: WorkspaceStateV1 = {
        ...state,
        packs: { ...state.packs, [pack.id]: pack },
        projects: [...state.projects, { id: projectId, kind: 'pack', label: pack.name, packId: pack.id }],
        activeProjectId: projectId,
      };
      persist(next);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeActivePackProject = () => {
    if (!active || active.kind !== 'pack') return;
    const packId = active.packId;
    const nextProjects = state.projects.filter((p) => p.id !== active.id);
    const { [packId]: _removed, ...restPacks } = state.packs;
    persist({
      ...state,
      projects: nextProjects.length ? nextProjects : defaultWorkspaceState().projects,
      packs: restPacks,
      activeProjectId: 'live',
    });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `repo-planner-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const readerSrc = bookContext?.embedReader
    ? readerAppHref({ book: bookContext.bookSlug })
    : null;

  const workspaceBody = !hydrated ? (
    <div className="rounded-2xl border border-border bg-dark-alt/50 p-8 text-center text-text-muted">
      Loading workspace…
    </div>
  ) : (
    <div className="flex min-h-[28rem] flex-col gap-4 lg:flex-row lg:gap-0">
      <aside className="flex w-full flex-shrink-0 flex-col border-border lg:w-64 lg:border-r lg:pr-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          <LayoutDashboard size={14} className="text-accent" />
          Dashboard
        </div>
        <p className="mb-3 text-xs leading-relaxed text-text-muted">
          <strong className="text-text">This repository</strong> uses live planning APIs. Uploaded packs live in{' '}
          <code className="rounded bg-dark-alt px-1 py-0.5 text-[11px]">localStorage</code> — export JSON to back up.
        </p>
        <ul className="space-y-1">
          {state.projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => selectProject(p.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  p.id === state.activeProjectId
                    ? 'bg-accent/15 text-primary'
                    : 'text-text-muted hover:bg-white/5 hover:text-primary'
                }`}
              >
                {p.kind === 'live' ? <HardDrive size={16} className="flex-shrink-0 opacity-70" /> : null}
                {p.kind === 'pack' ? <FolderOpen size={16} className="flex-shrink-0 opacity-70" /> : null}
                <span className="truncate">{p.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.mdx,.xml,.toml,.txt,text/markdown,text/plain,application/xml"
          className="hidden"
          onChange={(e) => addPackFromFiles(e.target.files)}
        />
        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-border"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={16} />
            Add pack from files
          </Button>
          {active?.kind === 'pack' ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-rose-300 hover:text-rose-200"
              onClick={removeActivePackProject}
            >
              <Trash2 size={16} />
              Remove pack workspace
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={exportJson}
          >
            <Download size={16} />
            Export workspace JSON
          </Button>
        </div>
        {saveError ? (
          <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-950/30 p-2 text-xs text-rose-200">{saveError}</p>
        ) : null}
      </aside>

      <div className="min-w-0 flex-1 lg:pl-4">
        {active?.kind === 'live' ? (
          <div className="min-h-[24rem] overflow-hidden rounded-2xl border border-border bg-dark-alt/40">{livePane}</div>
        ) : null}
        {active?.kind === 'pack' && activePack ? (
          <div className="space-y-4 rounded-2xl border border-border bg-dark-alt/40 p-4">
            <header>
              <h2 className="text-lg font-semibold text-primary">{activePack.name}</h2>
              <p className="mt-1 text-xs text-text-muted">
                {activePack.files.length} file(s) · read-only in browser · not written to the server
              </p>
            </header>
            <div className="max-h-[65vh] space-y-6 overflow-y-auto pr-1">
              {activePack.files.map((f) => (
                <article key={f.path} className="border-b border-border/60 pb-6 last:border-0">
                  <h3 className="mb-2 font-mono text-sm text-accent">{f.path}</h3>
                  <div className="prose prose-invert prose-sm max-w-none text-text">
                    <ReactMarkdown>{f.content || '_Empty file_'}</ReactMarkdown>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
        {active?.kind === 'pack' && !activePack ? (
          <p className="text-text-muted">Pack data missing — remove this workspace and re-upload.</p>
        ) : null}
      </div>
    </div>
  );

  const bookStrip =
    bookContext && (bookContext.planningLinks?.length || bookContext.bookTitle || bookContext.embedReader) ? (
      <div className="mb-4 rounded-xl border border-border/80 bg-dark-alt/50 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Book</span>
          <span className="text-sm text-primary">{bookContext.bookTitle ?? bookContext.bookSlug}</span>
          {bookContext.planningLinks?.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-border/60 bg-dark/40 px-2.5 py-1 text-xs text-text-muted transition hover:border-accent/40 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    ) : null;

  if (!readerSrc) {
    return (
      <div className="flex flex-col">
        {bookStrip}
        {workspaceBody}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {bookStrip}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'workspace' | 'reader')} className="w-full">
        <TabsList className="mb-3 bg-dark-alt/80">
          <TabsTrigger value="workspace" className="gap-1.5 data-[state=active]:bg-dark-elevated">
            <LayoutDashboard size={14} />
            Planning workspace
          </TabsTrigger>
          <TabsTrigger value="reader" className="gap-1.5 data-[state=active]:bg-dark-elevated">
            <BookOpen size={14} />
            EPUB reader
          </TabsTrigger>
        </TabsList>
        <TabsContent value="workspace" className="mt-0">
          {workspaceBody}
        </TabsContent>
        <TabsContent value="reader" className="mt-0">
          <div className="overflow-hidden rounded-xl border border-border bg-black/20">
            <iframe
              title={`Reader: ${bookContext?.bookSlug ?? 'book'}`}
              src={readerSrc}
              className="h-[min(72vh,800px)] w-full border-0 bg-dark"
            />
          </div>
          <p className="mt-2 text-center text-[11px] text-text-muted">
            Same reader as{' '}
            <Link href={readerSrc} className="text-accent underline" target="_blank" rel="noreferrer">
              Apps → Reader
            </Link>{' '}
            — embedded here so you can keep planning docs alongside the book.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
