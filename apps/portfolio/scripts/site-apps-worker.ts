import { getPayloadClient } from '@/lib/payload';
import {
  FALLBACK_SITE_APPS,
  toSiteAppRecord,
  type SiteAppRecord,
  type SiteAppRecordDoc,
} from '@/lib/site-app-registry';

async function loadSiteApps(): Promise<SiteAppRecord[]> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: 'site-app-records',
      depth: 0,
      limit: 100,
      sort: 'featuredOrder',
      where: {
        published: {
          equals: true,
        },
      },
    });

    const docs = (result.docs as SiteAppRecordDoc[])
      .map(toSiteAppRecord)
      .filter((entry): entry is SiteAppRecord => entry !== null);

    if (docs.length > 0) {
      return docs.sort((a, b) => a.featuredOrder - b.featuredOrder);
    }
  } catch {
    // Fall back to the file-authored registry when Payload is unavailable.
  }

  return [...FALLBACK_SITE_APPS].sort((a, b) => a.featuredOrder - b.featuredOrder);
}

async function main() {
  const apps = await loadSiteApps();

  process.stdout.write(
    JSON.stringify({
      status: 200,
      body: {
        ok: true,
        apps,
      },
    }),
  );
}

void main().catch((error) => {
  process.stderr.write(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
