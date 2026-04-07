import {
  coerceUnknownToString as asString,
  normalizeOptionalTrimmedString,
} from '@/lib/coerce-unknown-to-string';
import { getPayloadClient } from '@/lib/payload';
import { FALLBACK_SITE_APPS } from '@/lib/site-app-registry';
import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

function normalizeAppSeedData(app: {
  id: string;
  title: string;
  href: string;
  description: string;
  iconName: string;
  cta: string;
  supportHref?: string;
  supportLabel?: string;
  supportText?: string;
  exampleCode?: string;
  featuredOrder: number;
}) {
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

function normalizeExistingAppDoc(doc: unknown) {
  if (!doc || typeof doc !== 'object') {
    return null;
  }

  const record = doc as Record<string, unknown>;
  const slug = normalizeOptionalTrimmedString(record.slug);
  const title = normalizeOptionalTrimmedString(record.title);
  const routeHref = normalizeOptionalTrimmedString(record.routeHref);
  const description = normalizeOptionalTrimmedString(record.description);
  const iconName = normalizeOptionalTrimmedString(record.iconName);
  const ctaLabel = normalizeOptionalTrimmedString(record.ctaLabel);

  if (!slug || !title || !routeHref || !description || !iconName || !ctaLabel) {
    return null;
  }

  return {
    title,
    slug,
    routeHref,
    description,
    iconName,
    ctaLabel,
    supportHref: normalizeOptionalTrimmedString(record.supportHref),
    supportLabel: normalizeOptionalTrimmedString(record.supportLabel),
    supportText: normalizeOptionalTrimmedString(record.supportText),
    exampleCode: normalizeOptionalTrimmedString(record.exampleCode),
    featuredOrder: typeof record.featuredOrder === 'number' ? record.featuredOrder : 0,
    published: typeof record.published === 'boolean' ? record.published : true,
  };
}

async function main() {
  const payload = await getPayloadClient();
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const existingRecords = await payload.find({
    collection: 'site-app-records',
    depth: 0,
    limit: 100,
    pagination: false,
  });

  const existingBySlug = new Map(
    existingRecords.docs
      .map((doc) => {
        const normalized = normalizeExistingAppDoc(doc);
        if (!normalized || !doc || typeof doc !== 'object') {
          return null;
        }

        const id = asString((doc as Record<string, unknown>).id);
        return id ? [normalized.slug, { id, record: normalized }] : null;
      })
      .filter((entry): entry is [string, { id: string; record: NonNullable<ReturnType<typeof normalizeExistingAppDoc>> }] => entry !== null),
  );

  for (const app of FALLBACK_SITE_APPS) {
    const fields = normalizeAppSeedData(app);
    const existing = existingBySlug.get(app.id);

    if (existing && JSON.stringify(existing.record) === JSON.stringify(fields)) {
      skipped += 1;
      continue;
    }

    if (existing?.id) {
      await payload.update({
        collection: 'site-app-records',
        id: existing.id,
        data: fields,
      });
      updated += 1;
      continue;
    }

    await payload.create({
      collection: 'site-app-records',
      data: fields,
    });
    created += 1;
  }

  console.log(`[site-apps:seed] ${created} created, ${updated} updated, ${skipped} skipped`);
  process.exit(0);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[site-apps:seed] failed: ${message}`);
  process.exit(1);
});
