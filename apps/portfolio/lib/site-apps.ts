import {
  FALLBACK_SITE_APPS,
  type SiteAppRecord,
} from '@/lib/site-app-registry';
import { runSiteAppsWorker } from '@/lib/site-apps-worker-runner';

export { FALLBACK_SITE_APPS };
export type { SiteAppRecord };

export async function getSiteApps(): Promise<SiteAppRecord[]> {
  try {
    const result = await runSiteAppsWorker();
    const body = result.body as
      | {
          ok?: boolean;
          apps?: SiteAppRecord[];
        }
      | undefined;

    if (body?.ok && Array.isArray(body.apps) && body.apps.length > 0) {
      return body.apps.sort((a, b) => a.featuredOrder - b.featuredOrder);
    }
  } catch {
    // Fall back to the file-authored app registry when Payload is unavailable.
  }

  return [...FALLBACK_SITE_APPS].sort((a, b) => a.featuredOrder - b.featuredOrder);
}
