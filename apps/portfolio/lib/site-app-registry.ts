import type { AppsHubAppCardIconName } from '@/components/apps/AppsHubAppCard';
import { readerAppHref } from '@/lib/reader-routes';

export type SiteAppRecord = {
  id: string;
  title: string;
  description: string;
  href: string;
  iconName: AppsHubAppCardIconName;
  cta: string;
  supportHref?: string;
  supportLabel?: string;
  supportText?: string;
  exampleCode?: string;
  featuredOrder: number;
};

export type SiteAppRecordDoc = {
  slug?: string | null;
  title?: string | null;
  routeHref?: string | null;
  description?: string | null;
  iconName?: AppsHubAppCardIconName | null;
  ctaLabel?: string | null;
  supportHref?: string | null;
  supportLabel?: string | null;
  supportText?: string | null;
  exampleCode?: string | null;
  featuredOrder?: number | null;
  published?: boolean | null;
};

export const FALLBACK_SITE_APPS: SiteAppRecord[] = [
  {
    id: 'dialogue-forge',
    title: 'Dialogue Forge',
    description:
      'In-browser graph / Yarn / play-test editor for branching dialogue. Runs inside the main site shell so you can jump back to docs, projects, or the reader without leaving the app namespace.',
    href: '/apps/dialogue-forge',
    iconName: 'message-square',
    cta: 'Open Dialogue Forge',
    supportHref: '/docs/dialogue-forge/planning/planning-docs',
    supportLabel: 'Docs - dialogue-forge',
    supportText: 'State stays local to this browser tab.',
    featuredOrder: 10,
  },
  {
    id: 'repo-planner',
    title: 'Repo Planner',
    description:
      'Vendored planning CLI and embedded cockpit: live repo read APIs plus workspace UI, with package-owned shell work still in flight.',
    href: '/apps/repo-planner',
    iconName: 'terminal',
    cta: 'Open Repo Planner',
    supportHref: '/docs/repo-planner/planning/planning-docs',
    supportLabel: 'Repo Planner docs',
    supportText: 'The browser workspace remains read-only against the repo by default.',
    featuredOrder: 20,
  },
  {
    id: 'planning-pack',
    title: 'Planning pack',
    description:
      'Build-time export of section planning MDX to static Markdown under `/planning-pack/site/` plus `manifest.json`. Read-only downloads for visitors.',
    href: '/docs/global/global-planning',
    iconName: 'layers',
    cta: 'Open planning guide',
    supportText:
      'Use the site sidebar Planning pack control to browse and download exports while staying inside the main shell.',
    featuredOrder: 30,
  },
  {
    id: 'reader',
    title: 'EPUB reader',
    description:
      'Canonical reading surface for built books. Library-first shell, deep links by query, and local EPUB import as a secondary utility path.',
    href: readerAppHref({ book: 'mordreds_tale' }),
    iconName: 'book-open',
    cta: 'Open reader',
    exampleCode: '/apps/reader?book=mordreds_tale',
    featuredOrder: 40,
  },
];

export function isIconName(value: unknown): value is AppsHubAppCardIconName {
  return (
    value === 'message-square' ||
    value === 'terminal' ||
    value === 'layers' ||
    value === 'book-open'
  );
}

export function toSiteAppRecord(doc: SiteAppRecordDoc): SiteAppRecord | null {
  if (
    !doc.slug ||
    !doc.title ||
    !doc.routeHref ||
    !doc.description ||
    !isIconName(doc.iconName) ||
    !doc.ctaLabel
  ) {
    return null;
  }

  return {
    id: doc.slug,
    title: doc.title,
    description: doc.description,
    href: doc.routeHref,
    iconName: doc.iconName,
    cta: doc.ctaLabel,
    supportHref: doc.supportHref ?? undefined,
    supportLabel: doc.supportLabel ?? undefined,
    supportText: doc.supportText ?? undefined,
    exampleCode: doc.exampleCode ?? undefined,
    featuredOrder: doc.featuredOrder ?? 0,
  };
}
