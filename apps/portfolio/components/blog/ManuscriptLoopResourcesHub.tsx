'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Download,
  ExternalLink,
  FileStack,
  FileText,
  Library,
  Sparkles,
} from 'lucide-react';
import { PlanningPackLaunchButton } from '@/components/planning/PlanningPackLaunchButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type DocRow = { href: string; label: string; hint: string; external?: boolean };

const DOC_LINKS: DocRow[] = [
  {
    href: '/docs/books/planning/planning-docs',
    label: 'Books — Planning index',
    hint: 'Section playbook and every stream folder.',
  },
  {
    href: '/docs/books/magicborn-rune-path/planning/state',
    label: 'Magicborn: The Rune Path — Planning',
    hint: 'State, roadmap, task registry, decisions, AGENTS.',
  },
  {
    href: '/docs/books/mordreds-tale/planning/roadmap',
    label: "Mordred's Tale — Roadmap",
    hint: 'Phase view (mt-*) for Book 1.',
  },
  {
    href: '/docs/books/mordreds-tale/planning/state',
    label: "Mordred's Tale — State",
    hint: 'Beats, fronts, manuscript pointer.',
  },
  {
    href: '/docs/documentation/requirements',
    label: 'Documentation — Requirements',
    hint: 'Monorepo planning model (root XML + docs).',
  },
  {
    href: '/docs/global/global-planning',
    label: 'Global planning guide',
    hint: 'Task ids, namespaces, .planning linkage.',
  },
  {
    href: '/blog/using-coding-agents-effectively-with-roadmaps-and-planning-docs',
    label: 'Coding agents + planning docs (blog)',
    hint: 'Engineering-side sibling to this fiction loop.',
  },
];

const EPUB_FILES = [
  {
    href: '/books/magicborn_rune_path/checkpoints/cp01/book.epub',
    filename: 'magicborn_rune_path-cp01.epub',
    title: 'Checkpoint 1 (frozen)',
    path: '…/checkpoints/cp01/book.epub',
    hint: 'Immutable snapshot when Checkpoint 1 shipped. Not overwritten by later builds.',
  },
  {
    href: '/books/magicborn_rune_path/book.epub',
    filename: 'magicborn_rune_path.epub',
    title: 'Latest (canonical)',
    path: '…/magicborn_rune_path/book.epub',
    hint: 'Current manuscript after the most recent site build.',
  },
];

function AppTile({
  href,
  label,
  hint,
  icon,
  external,
}: {
  href: string;
  label: string;
  hint: string;
  icon: ReactNode;
  external?: boolean;
}) {
  const inner = cn(
    'flex w-full items-center gap-4 rounded-2xl border border-border/70 bg-dark-alt/80 px-4 py-4 text-left transition',
    'hover:border-accent/45 hover:bg-dark-alt',
  );

  const body = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-primary">{label}</span>
        <span className="mt-0.5 block text-xs text-text-muted">{hint}</span>
      </span>
      {external ? <ExternalLink className="h-4 w-4 shrink-0 text-text-muted" aria-hidden /> : null}
    </>
  );

  const node = external ? (
    <a href={href} target="_blank" rel="noreferrer noopener" className={inner}>
      {body}
    </a>
  ) : (
    <Link href={href} className={inner}>
      {body}
    </Link>
  );

  return (
    <Tooltip>
      <TooltipTrigger render={node} />
      <TooltipContent side="top" className="max-w-xs">
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

function DownloadRow({
  href,
  filename,
  title,
  pathHint,
  hint,
}: {
  href: string;
  filename: string;
  title: string;
  pathHint: string;
  hint: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-border/50 py-3 last:border-b-0 sm:flex-nowrap">
      <FileText className="h-5 w-5 shrink-0 text-teal-400/80" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-primary">{title}</p>
        <p className="mt-0.5 font-mono text-[0.7rem] text-text-muted">{pathHint}</p>
      </div>
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href={href}
              download={filename}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-xl border border-teal-500/40 bg-teal-950/30 px-3 py-2 text-sm font-medium text-teal-100',
                'transition hover:border-amber-500/50 hover:bg-teal-900/40 hover:text-amber-50',
              )}
            >
              <Download className="h-4 w-4" aria-hidden />
              Download
            </a>
          }
        />
        <TooltipContent className="max-w-xs">{hint}</TooltipContent>
      </Tooltip>
    </li>
  );
}

function DocRowLink({ row }: { row: DocRow }) {
  const inner = cn(
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-dark-alt/80',
  );
  const content = (
    <>
      <Library className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-primary">{row.label}</span>
        <span className="block text-xs text-text-muted">{row.hint}</span>
      </span>
      {row.external ? (
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
      ) : null}
    </>
  );

  const node = row.external ? (
    <a href={row.href} target="_blank" rel="noreferrer noopener" className={inner}>
      {content}
    </a>
  ) : (
    <Link href={row.href} className={inner}>
      {content}
    </Link>
  );

  return (
    <Tooltip>
      <TooltipTrigger render={node} />
      <TooltipContent side="right" className="max-w-xs">
        {row.hint}
      </TooltipContent>
    </Tooltip>
  );
}

export function ManuscriptLoopResourcesHub() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="font-serif text-2xl text-primary sm:text-3xl">Downloads & Resources</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
          This URL is the <strong className="text-primary">canonical tutorial</strong> we ask agents and humans to
          re-read between phases; per-book <code className="rounded bg-dark-alt px-1 py-0.5 text-xs">AGENTS.md</code>{' '}
          files point here on purpose and stay short on purpose. Use the tiles below, then switch to{' '}
          <strong className="text-primary">Guide</strong> or <strong className="text-primary">Walkthrough</strong> for
          depth.
        </p>
      </header>

      <section className="rounded-[1.75rem] border border-border/70 bg-dark-alt/50 p-5 shadow-inner sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
          <BookOpen className="h-4 w-4 text-primary" aria-hidden />
          Apps
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AppTile
            href="/apps/reader"
            label="Open the reader"
            hint="EPUB workspace for library titles and uploads."
            icon={<BookOpen className="h-6 w-6" aria-hidden />}
          />
          <AppTile
            href="https://cursor.com/"
            label="Cursor"
            hint="These Magicborn books were planned and drafted with Cursor (Anysphere), Auto mode for agent-style passes."
            icon={<Sparkles className="h-6 w-6" aria-hidden />}
            external
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
          <FileStack className="h-4 w-4 text-teal-400/90" aria-hidden />
          Planning export
        </div>
        <PlanningPackLaunchButton
          variant="featured"
          label="Open the planning pack"
          subtitle="Exports planning MDX from the site into static Markdown under /planning-pack/site/ — filter for magicborn-rune-path or books/planning to mirror what this article cites."
        />
        <div className="rounded-2xl border border-border/60 bg-dark-alt/40 px-4 py-3 text-sm text-text-muted">
          <p className="font-medium text-primary">What you get</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs sm:text-sm">
            <li>
              <code className="rounded bg-dark-alt px-1">books/&lt;stream&gt;/planning/*</code> — e.g.{' '}
              <code className="rounded bg-dark-alt px-1">magicborn-rune-path/planning/AGENTS.md</code>
            </li>
            <li>Open the modal → pick Site → search or filter to match the Walkthrough checkpoints.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-500/25 bg-amber-950/15 px-4 py-3 text-sm text-text-muted">
          <p className="font-medium text-amber-100/95">Per-book AGENTS.md</p>
          <p className="mt-1 text-xs leading-relaxed sm:text-sm">
            Each novel stream includes <code className="rounded bg-dark-alt/80 px-1">planning/AGENTS.md</code> with
            non-negotiables and read order; it expects readers to return here for granularity. Repo root{' '}
            <code className="rounded bg-dark-alt/80 px-1">AGENTS.md</code> still wins for code.
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border/70 bg-dark-alt/45 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
            <Download className="h-4 w-4 text-amber-400/90" aria-hidden />
            EPUB files — The Rune Path
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="cursor-help text-[0.65rem] text-text-muted underline decoration-dotted">
                  Frozen vs latest?
                </span>
              }
            />
            <TooltipContent className="max-w-sm">
              Checkpoints are copied once into <code className="text-[0.65rem]">checkpoints/cpNN/</code> and committed.
              Rebuilding the book only replaces the canonical <code className="text-[0.65rem]">book.epub</code> at the
              title root.
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="mt-2 text-sm text-text-muted">
          Immutable checkpoint builds vs the moving canonical manuscript.
        </p>
        <ul className="mt-3 divide-y divide-border/40 rounded-xl border border-border/50 bg-dark-alt/30 px-3">
          {EPUB_FILES.map((f) => (
            <DownloadRow
              key={f.href}
              href={f.href}
              filename={f.filename}
              title={f.title}
              pathHint={f.path}
              hint={f.hint}
            />
          ))}
        </ul>
      </section>

      <section className="rounded-[1.75rem] border border-border/70 bg-dark-alt/40 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
          <Library className="h-4 w-4 text-primary" aria-hidden />
          Documentation links
        </div>
        <ul className="mt-3 divide-y divide-border/40 rounded-xl border border-border/50">
          {DOC_LINKS.map((row) => (
            <li key={row.href} className="px-1">
              <DocRowLink row={row} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
