import type { ListenCatalogEntry } from '@/lib/listen-catalog';
import type { DiscoveryItem } from '@/lib/content-discovery';

export function toListenDiscoveryItem(
  entry: ListenCatalogEntry,
  options: { mediaPublic: boolean }
): DiscoveryItem {
  const { mediaPublic } = options;
  const tags = [...(entry.extraTags ?? [])];

  const mediaBlob = mediaPublic ? `${entry.bandlabUrl} ${entry.embedUrl}` : '';

  return {
    kind: 'listen',
    slug: entry.slug,
    href: `/listen#${entry.slug}`,
    title: entry.title,
    description: entry.description,
    date: entry.date,
    updated: entry.date,
    year: entry.date ? String(new Date(entry.date).getFullYear()) : undefined,
    tags,
    listenCatalogKind: entry.catalogKind,
    genre: entry.genre,
    mood: entry.mood,
    era: entry.era,
    duration: entry.duration,
    searchKeywords: [...(entry.extraTags ?? []), entry.catalogKind],
    // Exclude description: getSnippetSource() already prepends item.description; duplicating it
    // caused doubled paragraphs on /listen. Search still indexes description via buildSearchBlob().
    plainText: [entry.genre, entry.mood, entry.era, mediaBlob].filter(Boolean).join(' '),
    headings: [],
    links: [],
    downloads: [],
    appLinks: [],
  };
}

export type ListenPageRow = {
  item: DiscoveryItem;
  locked: boolean;
  lockGroup: string | null;
  embedUrl: string;
  bandlabUrl: string;
};
