import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { RepoPlannerCockpitClient } from '@/components/repo-planner/RepoPlannerCockpitClient';

export function RepoPlannerAppPage() {
  return (
    <div className="section-shell pb-16">
      <div className="py-8">
        <nav className="mb-6 text-sm text-text-muted">
          <Link href="/apps" className="text-accent hover:underline">
            Apps
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-text-muted">Repo Planner</span>
        </nav>

        <header className="mb-6 border-b border-border pb-6">
          <div className="mb-2 inline-flex items-center gap-2 text-accent">
            <Terminal size={20} aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider">App</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">Repo Planner cockpit</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-text-muted">
            Embedded <span className="font-medium text-text-muted">PlanningCockpit</span> from the vendored package,
            with explicit <strong className="text-text-muted">Live</strong> and{' '}
            <strong className="text-text-muted">Pack</strong> modes. Live reads this repository through the
            configured planning APIs; Pack stays local to built-in or uploaded planning files while keeping the same
            file-tree workspace shell on the canonical <code>/apps</code> route family.
          </p>
        </header>

        <RepoPlannerCockpitClient />
      </div>
    </div>
  );
}
