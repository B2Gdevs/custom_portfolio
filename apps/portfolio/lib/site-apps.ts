import { loadSiteAppsFromPayload } from '@/lib/site-apps-load';
import type { SiteAppRecord } from '@/lib/site-app-registry';

export type { SiteAppRecord } from '@/lib/site-app-registry';

export type SiteAppsCatalogResult = {
  apps: SiteAppRecord[];
  /**
   * When set, the CMS catalog could not be read (Payload offline, misconfiguration, etc.).
   * `apps` is empty; the `/apps` hub should show this message instead of pretending the catalog loaded.
   */
  loadError: string | null;
};

/**
 * Published `site-app-records` from Payload only (in-process — no tsx subprocess).
 * Seed defaults: `SITE_APP_SEED_RECORDS` + `pnpm site:seed:apps`.
 */
export async function getSiteApps(): Promise<SiteAppsCatalogResult> {
  return loadSiteAppsFromPayload();
}
