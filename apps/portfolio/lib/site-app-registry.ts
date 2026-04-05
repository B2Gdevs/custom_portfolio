import type { AppsHubAppCardIconName } from '@/components/apps/AppsHubAppCard';

export type { SiteAppRecord } from './site-app-fallback';
export { FALLBACK_SITE_APPS } from './site-app-fallback';

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
  downloads?: unknown;
  featuredOrder?: number | null;
  published?: boolean | null;
};

export function isIconName(value: unknown): value is AppsHubAppCardIconName {
  return (
    value === 'message-square' ||
    value === 'terminal' ||
    value === 'layers' ||
    value === 'book-open' ||
    value === 'image-plus'
  );
}
