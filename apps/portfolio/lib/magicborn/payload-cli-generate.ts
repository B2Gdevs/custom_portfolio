import type { Payload } from 'payload';
import { unknownErrorMessage } from '@/lib/unknown-error';
import { SITE_APP_RECORD_COLLECTION_SLUG } from '@/lib/payload/collections/siteAppRecords';
import { FALLBACK_SITE_APPS, type SiteAppRecord } from '@/lib/site-app-registry';

/** CLI alias → Payload collection (global-tooling-03-05). */
export const PAYLOAD_CLI_GENERATE_ALIASES = {
  app: {
    collection: SITE_APP_RECORD_COLLECTION_SLUG,
    label: 'Site app catalog rows',
  },
} as const;

export type PayloadCliGenerateAlias = keyof typeof PAYLOAD_CLI_GENERATE_ALIASES;

export function siteAppRecordFromFallback(slug: string): Record<string, unknown> | null {
  const app = FALLBACK_SITE_APPS.find((a) => a.id === slug);
  if (!app) {
    return null;
  }
  return siteAppRecordBodyFromRegistryRow(app);
}

export function siteAppRecordBodyFromRegistryRow(app: SiteAppRecord): Record<string, unknown> {
  return {
    title: app.title,
    slug: app.id,
    routeHref: app.href,
    description: app.description,
    iconName: app.iconName,
    ctaLabel: app.cta,
    supportHref: app.supportHref ?? null,
    supportLabel: app.supportLabel ?? null,
    supportText: app.supportText ?? null,
    exampleCode: app.exampleCode ?? null,
    featuredOrder: app.featuredOrder,
    published: true,
  };
}

/**
 * Upsert via the same in-process Payload client as seed scripts (`getPayloadClient()`).
 * Uses **PAYLOAD_SECRET** + **DATABASE_URL** (or sqlite file) from repo `.env` — no HTTP, no admin API keys.
 */
export async function upsertSiteAppRecordViaLocalPayload(
  payload: Payload,
  params: { body: Record<string, unknown>; slug: string },
): Promise<
  { ok: true; id: string | number; mode: 'created' | 'updated' } | { ok: false; message: string }
> {
  const col = SITE_APP_RECORD_COLLECTION_SLUG;
  try {
    const found = await payload.find({
      collection: col,
      where: { slug: { equals: params.slug } },
      limit: 1,
      depth: 0,
    });
    const doc = found.docs[0];
    if (doc && typeof doc === 'object' && doc.id != null && doc.id !== '') {
      await payload.update({
        collection: col,
        id: String(doc.id),
        data: params.body,
      });
      return { ok: true, id: doc.id, mode: 'updated' };
    }
    const created = await payload.create({
      collection: col,
      data: params.body,
    });
    return { ok: true, id: created.id, mode: 'created' };
  } catch (e) {
    return { ok: false, message: unknownErrorMessage(e) };
  }
}
