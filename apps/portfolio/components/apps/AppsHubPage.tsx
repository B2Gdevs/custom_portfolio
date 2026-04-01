import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppsHubAppCard } from '@/components/apps/AppsHubAppCard';
import type { SiteAppRecord } from '@/lib/site-app-registry';

type AppsHubPageProps = {
  apps: SiteAppRecord[];
};

function renderAppNote(app: SiteAppRecord) {
  const fragments: ReactNode[] = [];

  if (app.supportHref && app.supportLabel) {
    fragments.push(
      <span key="support">
        Notes live in{' '}
        <Link href={app.supportHref} className="text-accent underline">
          {app.supportLabel}
        </Link>
        .
      </span>,
    );
  }

  if (app.supportText) {
    fragments.push(<span key="support-text">{app.supportText}</span>);
  }

  if (app.exampleCode) {
    fragments.push(
      <span key="example">
        Example:{' '}
        <code className="rounded bg-dark px-1.5 py-0.5 text-text-muted">{app.exampleCode}</code>
      </span>,
    );
  }

  if (app.downloads && app.downloads.length > 0) {
    fragments.push(
      <span key="downloads">
        Downloads:{' '}
        {app.downloads.map((download, index) => (
          <span key={download.href}>
            {index > 0 ? ', ' : null}
            <a href={download.href} className="text-accent underline" download>
              {download.label}
            </a>
          </span>
        ))}
      </span>,
    );
  }

  return fragments.reduce<ReactNode[]>((acc, fragment, index) => {
    if (index > 0) {
      acc.push(' ');
    }
    acc.push(fragment);
    return acc;
  }, []);
}

export function AppsHubPage({ apps }: AppsHubPageProps) {
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
            <AppsHubAppCard {...app} note={renderAppNote(app)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
