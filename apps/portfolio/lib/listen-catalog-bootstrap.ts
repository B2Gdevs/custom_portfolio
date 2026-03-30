import 'server-only';

import type { Where } from 'payload';
import { getViewerFeatureAccess } from '@/lib/auth/permissions';
import { getSessionViewer } from '@/lib/auth/session';
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
  date?: string | null;
  extraTags?: Array<{ tag?: string | null }> | null;
};

export type ListenCatalogBootstrap = {
  access: {
    canViewPrivate: boolean;
  };
  entries: ListenCatalogEntry[];
};

function shouldIncludeEntry(
  entry: ListenCatalogEntry,
  access: ListenCatalogBootstrap['access'],
) {
  return (
    entry.visibility === 'public' ||
    access.canViewPrivate ||
    Boolean(entry.lockGroup)
  );
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
    date: doc.date ?? undefined,
    extraTags: normalizeTags(doc.extraTags),
  };
}

export async function getListenCatalogBootstrap(
  request?: Request,
): Promise<ListenCatalogBootstrap> {
  const fallbackEntries = getListenCatalog();
  const fallback: ListenCatalogBootstrap = {
    access: {
      canViewPrivate: false,
    },
    entries: fallbackEntries,
  };

  try {
    const viewer = request ? await getSessionViewer(request) : null;
    const access = getViewerFeatureAccess(viewer);
    const payload = await getPayloadClient();
    const where: Where = {
      and: [
        {
          published: {
            equals: true,
          },
        },
        ...(access.features.listen.privateAccess
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

    return {
      access: {
        canViewPrivate: access.features.listen.privateAccess,
      },
      entries: Array.from(merged.values()).filter((entry) =>
        shouldIncludeEntry(entry, {
          canViewPrivate: access.features.listen.privateAccess,
        }),
      ),
    };
  } catch {
    return fallback;
  }
}
