/**
 * Canonical **TypeScript-only** defaults for loading skeletons (placeholders, not live data).
 * No JSON artifacts — counts are either derived from registries or maintained as named constants
 * and checked in `tests/unit/lib/skeleton-defaults.test.ts`.
 *
 * | Surface | Source of truth |
 * | --- | --- |
 * | Apps hub | `SITE_APP_SEED_RECORDS.length` in `lib/site-app-seed.ts` (loading placeholders only) |
 * | Projects / blog index | `CONTENT_PROJECT_MDX_COUNT` / `CONTENT_BLOG_MDX_COUNT` ↔ `content/{projects,blog}/*.mdx` |
 * | Listen | `getListenCatalog().length` in `lib/listen-catalog.ts` |
 * | Resumes | `FALLBACK_RESUME_COUNT` in `lib/resume-fallback.ts` |
 */
import { SITE_APP_SEED_RECORDS } from '@/lib/site-app-registry';
import { getListenCatalog } from '@/lib/listen-catalog';
import { FALLBACK_RESUME_COUNT } from '@/lib/resume-fallback';

/** Bump when MDX inventory changes — test asserts equality with `getAllContentEntries('blog')`. */
export const CONTENT_BLOG_MDX_COUNT = 10;

/** Bump when MDX inventory changes — test asserts equality with `getAllContentEntries('projects')`. */
export const CONTENT_PROJECT_MDX_COUNT = 6;

/** Docs file-tree placeholder rows (visual only). */
export const SKELETON_DOCS_NAV_LINE_COUNT = 18;

/** Optional: when defaults were last reconciled with content/registry (planning metadata only). */
export const SKELETON_DEFAULTS_LAST_REVIEWED = '2026-04-08';

/** Derived — apps hub grid matches public app registry cardinality. */
export const SKELETON_APPS_HUB_CARD_COUNT = SITE_APP_SEED_RECORDS.length;

/** Derived — listen index rows match static catalog length. */
export const SKELETON_LISTEN_ROW_COUNT = getListenCatalog().length;

/** Derived — resume gallery matches repo-authored resume list. */
export const SKELETON_RESUME_GALLERY_CARD_COUNT = FALLBACK_RESUME_COUNT;

export const SkeletonDiscoveryKind = {
  Blog: 'blog',
  Projects: 'projects',
  Listen: 'listen',
} as const;

export type SkeletonDiscoveryKind =
  (typeof SkeletonDiscoveryKind)[keyof typeof SkeletonDiscoveryKind];

/** Card stacks for discovery-style layouts (`ContentIndexClient` / `ListenIndexClient`). */
export const SKELETON_DISCOVERY_CARD_COUNT: Record<SkeletonDiscoveryKind, number> = {
  [SkeletonDiscoveryKind.Blog]: CONTENT_BLOG_MDX_COUNT,
  [SkeletonDiscoveryKind.Projects]: CONTENT_PROJECT_MDX_COUNT,
  [SkeletonDiscoveryKind.Listen]: SKELETON_LISTEN_ROW_COUNT,
};
