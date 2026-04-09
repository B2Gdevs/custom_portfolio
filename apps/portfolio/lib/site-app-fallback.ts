/**
 * Static apps-hub rows when Payload-backed records are unavailable.
 * No server-only imports — safe for client bundles (loading skeleton counts, etc.).
 */
import type { AppsHubAppCardIconName } from '@/components/apps/AppsHubAppCard';
import type { ContentLink } from '@/lib/content';
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
  downloads?: ContentLink[];
  featuredOrder: number;
};

export const FALLBACK_SITE_APPS: SiteAppRecord[] = [
  {
    id: 'screenshot-annotate',
    title: 'Screenshot annotate',
    description:
      'Paste, drop, or import a screenshot; add rectangles and labels; export a PNG — client-side only, no uploads.',
    href: '/apps/screenshot-annotate',
    iconName: 'image-plus',
    cta: 'Open Screenshot annotate',
    supportHref: '/docs/screenshot-annotate/planning/planning-docs',
    supportLabel: 'Docs — screenshot-annotate',
    supportText: 'Images and edits stay in this browser; the catalog row is metadata only.',
    featuredOrder: 8,
  },
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
    id: 'grime-time',
    title: 'Grime Time',
    description:
      'Field CRM and marketing surface for an exterior cleaning company: estimates, scheduling, crew ops, and follow-up in one branded workspace.',
    href: 'https://grimetime.app',
    iconName: 'layers',
    cta: 'Visit Grime Time',
    supportHref: 'https://grimetime.app',
    supportLabel: 'grimetime.app',
    supportText:
      'Built as the next commercial product line using the same management patterns, auth model, and shell language from this portfolio stack.',
    featuredOrder: 15,
  },
  {
    id: 'get-anything-done',
    title: 'get-anything-done (GAD)',
    description:
      'Planning methodology and `gad` CLI: snapshot, phases, tasks, and compiled docs for this monorepo. No separate planning GUI — the loop is skills + CLI + planning files.',
    href: '/docs/get-anything-done/planning/state',
    iconName: 'terminal',
    cta: 'Open GAD planning state',
    supportHref: '/docs/get-anything-done/planning/roadmap',
    supportLabel: 'GAD roadmap',
    supportText: 'Session start: `gad snapshot --projectid <id>` per AGENTS.md.',
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
