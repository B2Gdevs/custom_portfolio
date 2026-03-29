import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { getAllContent } from '@/lib/content';
import DocsLayout from '@/components/docs/DocsLayout';
import { RepoPlannerCockpitClient } from '@/components/repo-planner/RepoPlannerCockpitClient';

export default function RepoPlannerAppPage() {
  const docs = getAllContent('docs');

  return (
    <DocsLayout docs={docs}>
      <div className="py-8 px-4 lg:px-0">
        <nav className="mb-6 text-sm text-text-muted">
          <Link href="/docs/apps" className="text-accent hover:underline">
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
            The <span className="font-medium text-text-muted">cockpit client</span> is a dashboard: workspaces, file
            uploads, pack preview, and export — hosted inside a minimal shell. Switch between{' '}
            <strong className="text-text-muted">this repository</strong> (live GET APIs) and{' '}
            <strong className="text-text-muted">uploaded planning packs</strong> (.md / .xml / .toml). State persists in{' '}
            <code className="rounded bg-dark-alt px-1.5 py-0.5 text-sm">localStorage</code>. From the EPUB reader, the same
            client opens in a modal with book planning links and an optional embedded reader tab. Server remains read-only
            by default. No in-site planning LLM — use Codex or CLI when running RepoPlanner standalone.{' '}
            <Link href="/docs/repo-planner/integration" className="text-accent underline">
              Integration
            </Link>
            .
          </p>
        </header>

        <RepoPlannerCockpitClient />
      </div>
    </DocsLayout>
  );
}
