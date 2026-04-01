import 'server-only';

import type { Where } from 'payload';
import { getListenCatalog, type ListenCatalogEntry } from '@/lib/listen-catalog';
import { getPayloadClient } from '@/lib/payload';

type ListenCatalogRecordDoc = {
  slug?: string | null;
  catalogKind?: ListenCatalogEntry['catalogKind'] | null;
  visibility?: ListenCatalogEntry['visibility'] | null;
  title?: string | null;
  genre?: string | null;
  mood?: string | null;
  era?: string | null;
  duration?: string | null;
  description?: string | null;
  bandlabUrl?: string | null;
  embedUrl?: string | null;
  artworkUrl?: string | null;
  date?: string | null;
  extraTags?: Array<{ tag?: string | null }> | null;
};

export type ListenCatalogRepositoryInput = {
  canViewPrivate: boolean;
};

export interface ListenCatalogRepository {
  listCatalog(input: ListenCatalogRepositoryInput): Promise<ListenCatalogEntry[]>;
}

function shouldIncludeEntry(entry: ListenCatalogEntry, canViewPrivate: boolean) {
  return entry.visibility === 'public' || canViewPrivate;
}

function normalizeTags(value: ListenCatalogRecordDoc['extraTags']) {
  return (value ?? [])
    .map((entry) => (typeof entry?.tag === 'string' ? entry.tag.trim() : ''))
    .filter(Boolean);
}

function toListenCatalogEntry(doc: ListenCatalogRecordDoc): ListenCatalogEntry | null {
  if (
    !doc.slug ||
    !doc.catalogKind ||
    !doc.visibility ||
    !doc.title ||
    !doc.genre ||
    !doc.mood ||
    !doc.era ||
    !doc.description ||
    !doc.bandlabUrl
  ) {
    return null;
  }

  return {
    slug: doc.slug,
    catalogKind: doc.catalogKind,
    visibility: doc.visibility,
    title: doc.title,
    genre: doc.genre,
    mood: doc.mood,
    era: doc.era,
    duration: doc.duration ?? undefined,
    description: doc.description,
    bandlabUrl: doc.bandlabUrl,
    embedUrl: doc.embedUrl ?? '',
    artworkUrl: doc.artworkUrl ?? undefined,
    date: doc.date ?? undefined,
    extraTags: normalizeTags(doc.extraTags),
  };
}

class PayloadListenCatalogRepository implements ListenCatalogRepository {
  async listCatalog(input: ListenCatalogRepositoryInput): Promise<ListenCatalogEntry[]> {
    const fallbackEntries = getListenCatalog();
    const payload = await getPayloadClient();
    const where: Where = {
      and: [
        {
          published: {
            equals: true,
          },
        },
        ...(input.canViewPrivate
          ? []
          : [
              {
                visibility: {
                  equals: 'public',
                },
              },
            ]),
      ],
    };

    const result = await payload.find({
      collection: 'listen-catalog-records',
      depth: 0,
      limit: 200,
      sort: '-date',
      where,
    });

    const merged = new Map<string, ListenCatalogEntry>(
      fallbackEntries.map((entry) => [entry.slug, entry]),
    );

    for (const doc of result.docs as ListenCatalogRecordDoc[]) {
      const next = toListenCatalogEntry(doc);
      if (next) {
        merged.set(next.slug, next);
      }
    }

    return Array.from(merged.values()).filter((entry) =>
      shouldIncludeEntry(entry, input.canViewPrivate),
    );
  }
}

export function getListenCatalogRepository(): ListenCatalogRepository {
  return new PayloadListenCatalogRepository();
}
