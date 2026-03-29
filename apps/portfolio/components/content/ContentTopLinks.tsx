'use client';

import Link from 'next/link';
import { Download, ExternalLink, FolderOpen, Github, Rocket } from 'lucide-react';
import type { DiscoveryLink } from '@/lib/content-discovery';

function renderKindIcon(kind: string | undefined) {
  switch (kind) {
    case 'download':
      return <Download size={16} />;
    case 'github':
      return <Github size={16} />;
    case 'app':
      return <Rocket size={16} />;
    case 'demo':
      return <ExternalLink size={16} />;
    default:
      return <FolderOpen size={16} />;
  }
}

function LinkChip({ link }: { link: DiscoveryLink }) {
  const className =
    'inline-flex items-center gap-2 rounded-full border border-border/70 bg-dark-alt/70 px-3 py-2 text-sm text-primary transition hover:border-accent/60 hover:bg-dark-alt';

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer noopener" className={className}>
        {renderKindIcon(link.kind)}
        <span>{link.label}</span>
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {renderKindIcon(link.kind)}
      <span>{link.label}</span>
    </Link>
  );
}

function LinkGroup({
  label,
  links,
}: {
  label: string;
  links: DiscoveryLink[];
}) {
  if (links.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <LinkChip key={`${label}-${link.label}-${link.href}`} link={link} />
        ))}
      </div>
    </div>
  );
}

export function ContentTopLinks({
  heading,
  appLinks,
  downloads,
  links,
}: {
  heading: string;
  appLinks: DiscoveryLink[];
  downloads: DiscoveryLink[];
  links: DiscoveryLink[];
}) {
  if (appLinks.length === 0 && downloads.length === 0 && links.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-border/70 bg-dark-alt/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <h2 className="font-serif text-2xl text-primary">{heading}</h2>
      <p className="mt-2 max-w-2xl text-sm text-text-muted">
        Jump straight to the proof, related apps, repositories, demos, or downloadable assets before diving into the full write-up.
      </p>
      <div className="mt-6 space-y-5">
        <LinkGroup label="Apps" links={appLinks} />
        <LinkGroup label="Downloads" links={downloads} />
        <LinkGroup label="Resources" links={links} />
      </div>
    </section>
  );
}
