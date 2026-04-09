import { coerceUnknownToString as asString } from '@/lib/coerce-unknown-to-string';
import { unknownErrorMessage, unknownErrorMessageWithStack } from '@/lib/unknown-error';
import { getPayloadClient } from '@/lib/payload';
import { type SiteAppRecord, type SiteAppRecordDoc } from '@/lib/site-app-registry';
import { toSiteAppRecord } from '@/lib/site-app-mapper';

async function loadSiteApps(): Promise<{ apps: SiteAppRecord[]; loadError: string | null }> {
  try {
    const payload = await getPayloadClient();
    const [result, assetResult] = await Promise.all([
      payload.find({
        collection: 'site-app-records',
        depth: 1,
        limit: 100,
        sort: 'featuredOrder',
        where: {
          published: {
            equals: true,
          },
        },
      }),
      payload.find({
        collection: 'site-download-assets',
        depth: 0,
        limit: 200,
        sort: '-publishedAt',
        where: {
          and: [
            {
              contentScope: {
                equals: 'app',
              },
            },
            {
              isCurrent: {
                equals: true,
              },
            },
          ],
        },
      }),
    ]);

    const assetMap = new Map<string, unknown[]>();
    for (const doc of assetResult.docs) {
      if (!doc || typeof doc !== 'object') {
        continue;
      }

      const contentSlug = asString((doc as Record<string, unknown>).contentSlug);
      if (!contentSlug) {
        continue;
      }

      const existing = assetMap.get(contentSlug) ?? [];
      existing.push(doc);
      assetMap.set(contentSlug, existing);
    }

    const docs = (result.docs as SiteAppRecordDoc[])
      .map((doc) =>
        toSiteAppRecord({
          ...doc,
          downloads:
            Array.isArray(doc.downloads) && doc.downloads.length > 0
              ? doc.downloads
              : assetMap.get(doc.slug ?? '') ?? [],
        }),
      )
      .filter((entry): entry is SiteAppRecord => entry !== null);

    return {
      apps: docs.sort((a, b) => a.featuredOrder - b.featuredOrder),
      loadError: null,
    };
  } catch (error) {
    return { apps: [], loadError: unknownErrorMessage(error) };
  }
}

async function main() {
  const { apps, loadError } = await loadSiteApps();

  process.stdout.write(
    JSON.stringify({
      status: 200,
      body: {
        ok: loadError === null,
        apps,
        loadError,
      },
    }),
  );
}

void main().catch((error) => {
  process.stderr.write(unknownErrorMessageWithStack(error));
  process.exit(1);
});
