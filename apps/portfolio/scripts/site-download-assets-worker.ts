import { getPayloadClient } from '@/lib/payload';
import type { Where } from 'payload';
import {
  normalizeSiteDownloadAssetDocs,
  type FindSiteDownloadAssetsInput,
} from '@/lib/site-download-assets';

function buildWhere(filters: FindSiteDownloadAssetsInput) {
  const clauses: Where[] = [
    {
      isCurrent: {
        equals: true,
      },
    },
  ];

  if (filters.downloadKind) {
    clauses.push({
      downloadKind: {
        equals: filters.downloadKind,
      },
    });
  }

  if (filters.contentScope) {
    clauses.push({
      contentScope: {
        equals: filters.contentScope,
      },
    });
  }

  if (filters.contentSlug) {
    clauses.push({
      contentSlug: {
        equals: filters.contentSlug,
      },
    });
  }

  if (filters.downloadSlug) {
    clauses.push({
      downloadSlug: {
        equals: filters.downloadSlug,
      },
    });
  }

  return clauses.length === 1 ? clauses[0] : ({ and: clauses } satisfies Where);
}

async function main() {
  const filters = process.argv[2] ? (JSON.parse(process.argv[2]) as FindSiteDownloadAssetsInput) : {};
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: 'site-download-assets',
    depth: 0,
    limit: 500,
    overrideAccess: true,
    pagination: false,
    where: buildWhere(filters),
  });

  process.stdout.write(
    JSON.stringify({
      status: 200,
      body: {
        ok: true,
        assets: normalizeSiteDownloadAssetDocs(result.docs),
      },
    }),
  );
}

void main().catch((error) => {
  process.stderr.write(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
