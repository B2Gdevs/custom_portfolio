import Link from 'next/link';
import { BookOpen, Layers, LayoutGrid, MessageSquare, Terminal } from 'lucide-react';
import { getAllContent } from '@/lib/content';
import DocsLayout from '@/components/docs/DocsLayout';
import { readerAppHref } from '@/lib/reader-routes';

const apps = [
  {
    id: 'dialogue-forge',
    title: 'Dialogue Forge',
    description:
      'In-browser graph / Yarn / play-test editor for branching dialogue. Runs inside the main site shell (nav + footer) so you can hop back to docs or projects anytime.',
    href: '/apps/dialogue-forge',
    icon: MessageSquare,
    cta: 'Open Dialogue Forge',
    note: (
      <>
        Docs for the toolchain live under{' '}
        <Link href="/docs/dialogue-forge/planning-docs" className="text-accent underline">
          Docs → dialogue-forge
        </Link>
        . State is kept in this tab (localStorage); nothing is written to the server.
      </>
    ),
  },
  {
    id: 'repo-planner',
    title: 'Repo Planner',
    description:
      'Vendored planning CLI and embedded cockpit workspace: live repo bundle, uploaded packs, export JSON — same boundary as the EPUB reader.',
    href: '/docs/apps/repo-planner',
    icon: Terminal,
    cta: 'Open Repo Planner',
    note: (
      <>
        Full upstream UI:{' '}
        <a
          href="https://github.com/MagicbornStudios/RepoPlanner"
          className="text-accent underline"
          target="_blank"
          rel="noreferrer"
        >
          RepoPlanner
        </a>
        . Embedded notes:{' '}
        <Link href="/docs/repo-planner/integration#embedded-cockpit-this-next-app" className="text-accent underline">
          Integration → Embedded cockpit
        </Link>
        .
      </>
    ),
  },
  {
    id: 'planning-pack',
    title: 'Planning pack',
    description:
      'Build-time export of section planning MDX to static Markdown under `/planning-pack/site/` plus `manifest.json`. Read-only downloads for visitors.',
    href: '/docs/global/global-planning',
    icon: Layers,
    cta: 'Global planning guide & pack policy',
    note: (
      <>
        On pages that use the main site shell, use the sidebar <span className="font-medium text-text-muted">Planning pack</span>{' '}
        control to browse and download exports.
      </>
    ),
  },
  {
    id: 'reader',
    title: 'EPUB reader',
    description:
      'Canonical reading surface for built books. URL shape: query params for book and optional spine position or CFI.',
    href: readerAppHref({ book: 'mordreds_tale' }),
    icon: BookOpen,
    cta: 'Open reader (example book)',
    note: (
      <>
        Example:{' '}
        <code className="rounded bg-dark px-1.5 py-0.5 text-text-muted">
          /apps/reader?book=mordreds_tale
        </code>
        , optional{' '}
        <code className="rounded bg-dark px-1.5 py-0.5 text-text-muted">at=…</code> (EPUB href) or{' '}
        <code className="rounded bg-dark px-1.5 py-0.5 text-text-muted">cfi=…</code>. For QA without Next hot reload:{' '}
        <code className="rounded bg-dark px-1.5 py-0.5 text-text-muted">pnpm serve:reader:standalone</code>.
      </>
    ),
  },
];

export default function DocsAppsPage() {
  const docs = getAllContent('docs');

  return (
    <DocsLayout docs={docs}>
      <div className="py-12 px-4 lg:px-0">
        <header className="mb-10 border-b border-border pb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/80 bg-dark-alt px-3 py-1 text-xs font-medium uppercase tracking-wider text-text-muted">
            <LayoutGrid size={14} className="text-accent" aria-hidden />
            Apps
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">Operator apps</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-text-muted">
            In-browser utilities that are either <strong className="text-text-muted">local-only</strong> (editing,
            cockpit, standalone reader) or <strong className="text-text-muted">read-only on the site</strong>{' '}
            (planning-pack downloads). Nothing here persists visitor uploads or mutates the git repo from production.
          </p>
        </header>

        <ul className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <li key={app.id}>
                <article className="flex h-full flex-col rounded-2xl border border-border bg-dark-alt/40 p-6 shadow-sm transition-colors hover:border-accent/40">
                  <div className="mb-4 flex items-start gap-3">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border/80 bg-dark text-accent">
                      <Icon size={22} aria-hidden />
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold text-primary">{app.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-text-muted">{app.description}</p>
                    </div>
                  </div>
                  <div className="mb-4 flex-1 text-xs leading-relaxed text-text-muted/90">{app.note}</div>
                  <Link
                    href={app.href}
                    className="inline-flex w-fit items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
                  >
                    {app.cta}
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </DocsLayout>
  );
}
