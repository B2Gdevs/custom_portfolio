import { ensureOwnerSeed } from '@/lib/auth/seed';
import { getListenCatalog, type ListenCatalogEntry } from '@/lib/listen-catalog';
import { getPayloadClient } from '@/lib/payload';
import { LISTEN_CATALOG_RECORDS_COLLECTION_SLUG } from '@/lib/payload/collections/listenCatalogRecords';

type SeedListenCatalogResult = {
  created: number;
  updated: number;
  skipped: number;
  tenantId: string;
  total: number;
};

function normalizeId(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function normalizeOptionalString(value: unknown) {
  const normalized = typeof value === 'string' ? value.trim() : value == null ? null : String(value);
  return normalized && normalized.length > 0 ? normalized : null;
}

function toRecordData(
  entry: ListenCatalogEntry,
  tenantId: string,
  tenantValue: number | string,
) {
  return {
    title: entry.title,
    slug: entry.slug,
    catalogKind: entry.catalogKind,
    visibility: entry.visibility,
    genre: entry.genre,
    mood: entry.mood,
    era: entry.era,
    duration: entry.duration,
    description: entry.description,
    bandlabUrl: entry.bandlabUrl,
    embedUrl: entry.embedUrl,
    artworkUrl: entry.artworkUrl,
    date: entry.date,
    extraTags: (entry.extraTags ?? []).map((tag) => ({ tag })),
    tenant: tenantValue,
    published: true,
  };
}

function normalizeDate(value: unknown) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function hasChanged(
  existing: Record<string, unknown>,
  next: ReturnType<typeof toRecordData>,
) {
  const existingTags = Array.isArray(existing.extraTags)
    ? existing.extraTags
        .map((entry) =>
          entry && typeof entry === 'object' && typeof (entry as { tag?: unknown }).tag === 'string'
            ? (entry as { tag: string }).tag
            : null,
        )
        .filter((value): value is string => Boolean(value))
    : [];
  const existingTenant =
    normalizeId(existing.tenant) ??
    (existing.tenant && typeof existing.tenant === 'object'
      ? normalizeId((existing.tenant as { id?: unknown }).id)
      : null);

  return (
    existing.title !== next.title ||
    existing.catalogKind !== next.catalogKind ||
    existing.visibility !== next.visibility ||
    existing.genre !== next.genre ||
    existing.mood !== next.mood ||
    existing.era !== next.era ||
    normalizeOptionalString(existing.duration) !== normalizeOptionalString(next.duration) ||
    existing.description !== next.description ||
    existing.bandlabUrl !== next.bandlabUrl ||
    existing.embedUrl !== next.embedUrl ||
    normalizeOptionalString(existing.artworkUrl) !== normalizeOptionalString(next.artworkUrl) ||
    normalizeDate(existing.date) !== normalizeDate(next.date) ||
    existing.published !== next.published ||
    existingTenant !== normalizeId(next.tenant) ||
    existingTags.join('||') !== next.extraTags.map((entry) => entry.tag).join('||')
  );
}

export async function seedListenCatalog(
  entries: ListenCatalogEntry[] = getListenCatalog(),
): Promise<SeedListenCatalogResult> {
  const payload = await getPayloadClient();
  const owner = await ensureOwnerSeed();

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const existing = await payload.find({
    collection: LISTEN_CATALOG_RECORDS_COLLECTION_SLUG,
    limit: 200,
    overrideAccess: true,
    pagination: false,
  });
  const existingBySlug = new Map(
    existing.docs
      .map((doc) => {
        const record = doc as Record<string, unknown> | undefined;
        const slug = typeof record?.slug === 'string' ? record.slug : null;
        return slug ? [slug, record] : null;
      })
      .filter((entry): entry is [string, Record<string, unknown>] => entry !== null),
  );

  for (const entry of entries) {
    const next = toRecordData(entry, owner.tenantId, owner.tenantValue);
    const doc = existingBySlug.get(entry.slug);

    if (!doc) {
      await payload.create({
        collection: LISTEN_CATALOG_RECORDS_COLLECTION_SLUG,
        overrideAccess: true,
        data: next,
      });
      created += 1;
      continue;
    }

    if (!hasChanged(doc, next)) {
      skipped += 1;
      continue;
    }

    await payload.update({
      collection: LISTEN_CATALOG_RECORDS_COLLECTION_SLUG,
      id: String(doc.id),
      overrideAccess: true,
      data: next,
    });
    updated += 1;
  }

  return {
    created,
    updated,
    skipped,
    tenantId: owner.tenantId,
    total: entries.length,
  };
}
