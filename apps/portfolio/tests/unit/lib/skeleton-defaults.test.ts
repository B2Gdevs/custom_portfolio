import { describe, expect, it } from 'vitest';
import { getAllContentEntries } from '@/lib/content';
import { getListenCatalog } from '@/lib/listen-catalog';
import { FALLBACK_SITE_APPS } from '@/lib/site-app-registry';
import {
  CONTENT_BLOG_MDX_COUNT,
  CONTENT_PROJECT_MDX_COUNT,
  SKELETON_APPS_HUB_CARD_COUNT,
  SKELETON_DISCOVERY_CARD_COUNT,
  SKELETON_LISTEN_ROW_COUNT,
  SKELETON_RESUME_GALLERY_CARD_COUNT,
  SkeletonDiscoveryKind,
} from '@/lib/ui/skeleton-defaults';
import { FALLBACK_RESUME_COUNT } from '@/lib/resume-fallback';

describe('skeleton defaults', () => {
  it('keeps derived counts aligned with canonical registries', () => {
    expect(SKELETON_APPS_HUB_CARD_COUNT).toBe(FALLBACK_SITE_APPS.length);
    expect(SKELETON_LISTEN_ROW_COUNT).toBe(getListenCatalog().length);
    expect(SKELETON_RESUME_GALLERY_CARD_COUNT).toBe(FALLBACK_RESUME_COUNT);
  });

  it('keeps MDX constants aligned with content trees', () => {
    expect(CONTENT_PROJECT_MDX_COUNT).toBe(getAllContentEntries('projects').length);
    expect(CONTENT_BLOG_MDX_COUNT).toBe(getAllContentEntries('blog').length);
  });

  it('wires discovery skeleton map to the same constants', () => {
    expect(SKELETON_DISCOVERY_CARD_COUNT[SkeletonDiscoveryKind.Blog]).toBe(CONTENT_BLOG_MDX_COUNT);
    expect(SKELETON_DISCOVERY_CARD_COUNT[SkeletonDiscoveryKind.Projects]).toBe(CONTENT_PROJECT_MDX_COUNT);
    expect(SKELETON_DISCOVERY_CARD_COUNT[SkeletonDiscoveryKind.Listen]).toBe(SKELETON_LISTEN_ROW_COUNT);
  });
});
