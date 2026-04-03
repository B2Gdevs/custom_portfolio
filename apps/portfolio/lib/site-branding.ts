import { getPayloadClient } from '@/lib/payload';
import {
  getSiteMediaAssetFileURL,
  SITE_MEDIA_ASSET_COLLECTION_SLUG,
} from '@/lib/payload/collections/siteMediaAssets';
import { SITE_LOGO_CONTENT_SLUG } from '@/lib/magicborn/site-logo-cli';

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

/**
 * Public URL for the active site logo (sidebar + mobile header), from Payload
 * `site-media-assets`: brand scope, `site-logo` slug, `isCurrent`.
 * Returns `null` if unset or on error — UI should fall back to `/logo.svg`.
 */
export async function getActiveSiteLogoPublicUrl(): Promise<string | null> {
  try {
    const payload = await getPayloadClient();
    const found = await payload.find({
      collection: SITE_MEDIA_ASSET_COLLECTION_SLUG,
      where: {
        and: [
          { contentScope: { equals: 'brand' } },
          { contentSlug: { equals: SITE_LOGO_CONTENT_SLUG } },
          { isCurrent: { equals: true } },
        ],
      },
      limit: 1,
      depth: 0,
    });
    const doc = found.docs[0] as Record<string, unknown> | undefined;
    if (!doc) return null;
    const filename = asString(doc.filename);
    if (filename) return getSiteMediaAssetFileURL(filename);
    return asString(doc.url);
  } catch {
    return null;
  }
}
