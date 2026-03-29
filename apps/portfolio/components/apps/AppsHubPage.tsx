import Link from 'next/link';
import { BookOpen, Layers, LayoutGrid, MessageSquare, Terminal } from 'lucide-react';
import { readerAppHref } from '@/lib/reader-routes';

const apps = [
  {
    id: 'dialogue-forge',
    title: 'Dialogue Forge',
    description:
      'In-browser graph / Yarn / play-test editor for branching dialogue. Runs inside the main site shell so you can jump back to docs, projects, or the reader without leaving the app namespace.',
    href: '/apps/dialogue-forge',
    icon: MessageSquare,
    cta: 'Open Dialogue Forge',
    note: (
      <>
        Docs for the toolchain live under{' '}
        <Link href="/docs/dialogue-forge/planning-docs" className="text-accent underline">
          Docs - dialogue-forge
        </Link>
        . State stays local to this browser tab.
      </>
    ),
  },
  {
    id: 'repo-planner',
    title: 'Repo Planner',
    description:
      'Vendored planning CLI and embedded cockpit: live repo read APIs plus workspace UI, with package-owned shell work still in flight.',
    href: '/apps/repo-planner',
    icon: Terminal,
    cta: 'Open Repo Planner',
    note: (
      <>
        Planning and embed notes live in{' '}
        <Link href="/docs/repo-planner/planning-docs" className="text-accent underline">
          Repo Planner docs
        </Link>
        . The browser workspace remains read-only against the repo by default.
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
    cta: 'Open planning guide',
    note: (
      <>
        Use the site sidebar{' '}
        <span className="font-medium text-text-muted">Planning pack</span> control to browse and download exports while
        staying inside the main shell.
      </>
    ),
  },
  {
    id: 'reader',
    title: 'EPUB reader',
    description:
      'Canonical reading surface for built books. Library-first shell, deep links by query, and local EPUB import as a secondary utility path.',
    href: readerAppHref({ book: 'mordreds_tale' }),
    icon: BookOpen,
    cta: 'Open reader',
    note: (
      <>
        Example:{' '}
        <code className="rounded bg-dark px-1.5 py-0.5 text-text-muted">/apps/reader?book=mordreds_tale</code>
      </>
    ),
  },
];

export function AppsHubPage() {
  return (
    <div className="section-shell pb-16">
      <header className="story-card max-w-5xl p-8 md:p-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/80 bg-dark-alt px-3 py-1 text-xs font-medium uppercase tracking-wider text-text-muted">
          <LayoutGrid size={14} className="text-accent" aria-hidden />
          Apps
        </div>
        <h1 className="mt-2 font-display text-5xl text-primary md:text-6xl">Operator apps and reading tools</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-text-muted">
          Interactive surfaces live at <code>/apps</code>. Docs remain under <code>/docs</code>; apps are not treated
          as a docs subsection anymore.
        </p>
      </header>

      <ul className="mt-10 grid gap-6 lg:grid-cols-2">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <li key={app.id}>
              <article className="story-card flex h-full flex-col p-6 md:p-8">
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
  );
}
