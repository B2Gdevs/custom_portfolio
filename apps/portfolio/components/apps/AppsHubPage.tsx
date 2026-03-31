import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { AppsHubAppCard } from '@/components/apps/AppsHubAppCard';
import { readerAppHref } from '@/lib/reader-routes';

const apps = [
  {
    id: 'dialogue-forge',
    title: 'Dialogue Forge',
    description:
      'In-browser graph / Yarn / play-test editor for branching dialogue. Runs inside the main site shell so you can jump back to docs, projects, or the reader without leaving the app namespace.',
    href: '/apps/dialogue-forge',
    iconName: 'message-square' as const,
    cta: 'Open Dialogue Forge',
    note: (
      <>
        Docs for the toolchain live under{' '}
        <Link href="/docs/dialogue-forge/planning/planning-docs" className="text-accent underline">
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
    iconName: 'terminal' as const,
    cta: 'Open Repo Planner',
    note: (
      <>
        Planning and embed notes live in{' '}
        <Link href="/docs/repo-planner/planning/planning-docs" className="text-accent underline">
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
    iconName: 'layers' as const,
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
    iconName: 'book-open' as const,
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
        {apps.map((app) => (
          <li key={app.id}>
            <AppsHubAppCard {...app} />
          </li>
        ))}
      </ul>
    </div>
  );
}
