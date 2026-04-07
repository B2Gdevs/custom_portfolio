import type { Payload } from 'payload';
import { unknownErrorMessage } from '@/lib/unknown-error';
import { SITE_MEDIA_ASSET_COLLECTION_SLUG } from '@/lib/payload/collections/siteMediaAssets';

/** Active site logo group: brand scope + stable slug (global-tooling-01-04). */
export const SITE_LOGO_CONTENT_SLUG = 'site-logo';

export async function listSiteLogoCandidates(payload: Payload): Promise<
  Array<{
    id: string | number;
    title: string;
    isCurrent: boolean;
    sourcePath: string;
    contentSlug: string | null;
    updatedAt: string | null;
  }>
> {
  const found = await payload.find({
    collection: SITE_MEDIA_ASSET_COLLECTION_SLUG,
    where: {
      and: [
        { contentScope: { equals: 'brand' } },
        { contentSlug: { equals: SITE_LOGO_CONTENT_SLUG } },
      ],
    },
    limit: 200,
    sort: '-updatedAt',
    depth: 0,
  });

  return found.docs.map((doc) => {
    const d = doc as Record<string, unknown>;
    return {
      id: d.id as string | number,
      title: String(d.title ?? ''),
      isCurrent: Boolean(d.isCurrent),
      sourcePath: String(d.sourcePath ?? ''),
      contentSlug: (d.contentSlug as string | null) ?? null,
      updatedAt:
        typeof d.updatedAt === 'string'
          ? d.updatedAt
          : d.updatedAt instanceof Date
            ? d.updatedAt.toISOString()
            : null,
    };
  });
}

export async function setActiveSiteLogo(
  payload: Payload,
  id: string | number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const sid = String(id);
  try {
    const current = await payload.findByID({
      collection: SITE_MEDIA_ASSET_COLLECTION_SLUG,
      id: sid,
      depth: 0,
    });
    const c = current as Record<string, unknown>;
    if (c.contentScope !== 'brand' || c.contentSlug !== SITE_LOGO_CONTENT_SLUG) {
      return {
        ok: false,
        message: `Document ${sid} is not a brand / ${SITE_LOGO_CONTENT_SLUG} logo candidate`,
      };
    }

    const all = await payload.find({
      collection: SITE_MEDIA_ASSET_COLLECTION_SLUG,
      where: {
        and: [
          { contentScope: { equals: 'brand' } },
          { contentSlug: { equals: SITE_LOGO_CONTENT_SLUG } },
        ],
      },
      limit: 500,
      depth: 0,
    });

    for (const doc of all.docs) {
      const d = doc as { id?: string | number };
      if (d.id == null) continue;
      const did = String(d.id);
      await payload.update({
        collection: SITE_MEDIA_ASSET_COLLECTION_SLUG,
        id: did,
        data: { isCurrent: did === sid },
      });
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, message: unknownErrorMessage(e) };
  }
}
