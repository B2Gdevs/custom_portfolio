import { unknownErrorMessageWithStack } from '@/lib/unknown-error';
import { getPayloadClient } from '@/lib/payload';

function asString(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
}

async function main() {
  const payload = await getPayloadClient();
  const [result, assetResult] = await Promise.all([
    payload.find({
      collection: 'project-records',
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
      limit: 500,
      sort: '-publishedAt',
      where: {
        and: [
          {
            contentScope: {
              equals: 'project',
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

  const assetsBySlug = new Map<string, unknown[]>();
  for (const doc of assetResult.docs) {
    if (!doc || typeof doc !== 'object') {
      continue;
    }

    const contentSlug = asString((doc as Record<string, unknown>).contentSlug);
    if (!contentSlug) {
      continue;
    }

    const existing = assetsBySlug.get(contentSlug) ?? [];
    existing.push(doc);
    assetsBySlug.set(contentSlug, existing);
  }

  const projects = result.docs.map((doc) => {
    if (!doc || typeof doc !== 'object') {
      return doc;
    }

    const record = doc as Record<string, unknown>;
    const slug = asString(record.slug);
    const scopedAssets = slug ? assetsBySlug.get(slug) ?? [] : [];

    if (Array.isArray(record.downloadAssets) && record.downloadAssets.length > 0) {
      return record;
    }

    return {
      ...record,
      downloadAssets: scopedAssets,
    };
  });

  process.stdout.write(
    JSON.stringify({
      status: 200,
      body: {
        ok: true,
        projects,
      },
    }),
  );
}

void main().catch((error) => {
  process.stderr.write(unknownErrorMessageWithStack(error));
  process.exit(1);
});
