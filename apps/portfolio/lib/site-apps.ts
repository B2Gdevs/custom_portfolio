import { errorMessageOrFallback } from '@/lib/unknown-error';
import { type SiteAppRecord } from '@/lib/site-app-registry';
import { runSiteAppsWorker } from '@/lib/site-apps-worker-runner';

export type { SiteAppRecord };

export type SiteAppsCatalogResult = {
  apps: SiteAppRecord[];
  /**
   * When set, the CMS catalog could not be read (Payload offline, misconfiguration, etc.).
   * `apps` is empty; the `/apps` hub should show this message instead of pretending the catalog loaded.
   */
  loadError: string | null;
};

/**
 * Published `site-app-records` from Payload only. No file-based catalog fallback.
 * Seed defaults: `SITE_APP_SEED_RECORDS` + `pnpm site:seed:apps`.
 */
export async function getSiteApps(): Promise<SiteAppsCatalogResult> {
  try {
    const result = await runSiteAppsWorker();
    const body = result.body as
      | {
          ok?: boolean;
          apps?: SiteAppRecord[];
          loadError?: string | null;
        }
      | undefined;

    if (body?.ok === true && Array.isArray(body.apps)) {
      return {
        apps: [...body.apps].sort((a, b) => a.featuredOrder - b.featuredOrder),
        loadError: null,
      };
    }

    const err =
      typeof body?.loadError === 'string' && body.loadError.trim()
        ? body.loadError.trim()
        : 'Site apps worker returned an unexpected response.';
    return { apps: [], loadError: err };
  } catch (error) {
    return {
      apps: [],
      loadError: errorMessageOrFallback(error, 'Site apps worker failed to run.'),
    };
  }
}
