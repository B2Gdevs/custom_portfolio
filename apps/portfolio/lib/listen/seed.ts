import { ensureOwnerSeed } from '@/lib/auth/seed';
import { getListenCatalog, type ListenCatalogEntry } from '@/lib/listen-catalog';
import { getPayloadClient } from '@/lib/payload';
import { LISTEN_CATALOG_RECORDS_COLLECTION_SLUG } from '@/lib/payload/collections/listenCatalogRecords';

type SeedListenCatalogResult = {
  created: number;
  updated: number;
  tenantId: string;
  total: number;
};

function normalizeId(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
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
    existing.duration !== next.duration ||
    existing.description !== next.description ||
    existing.bandlabUrl !== next.bandlabUrl ||
    existing.embedUrl !== next.embedUrl ||
    existing.artworkUrl !== next.artworkUrl ||
    existing.date !== next.date ||
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

  for (const entry of entries) {
    const existing = await payload.find({
      collection: LISTEN_CATALOG_RECORDS_COLLECTION_SLUG,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        slug: {
          equals: entry.slug,
        },
      },
    });

    const next = toRecordData(entry, owner.tenantId, owner.tenantValue);
    const doc = existing.docs[0] as Record<string, unknown> | undefined;

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
    tenantId: owner.tenantId,
    total: entries.length,
  };
}
