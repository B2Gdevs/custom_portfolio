import {
  buildDiscoverySnippet,
  filterDiscoveryItems,
  highlightTextSegments,
  scoreDiscoveryItem,
  searchDiscoveryItems,
} from '@/lib/content-discovery';
import type { DiscoveryItem } from '@/lib/content-discovery';
import { getStaticListenSearchDiscoveryItems } from '@/lib/listen-search';

const items: DiscoveryItem[] = [
  {
    kind: 'blog',
    slug: 'making-the-site-more-personal-reader-and-repo-structure',
    href: '/blog/making-the-site-more-personal-reader-and-repo-structure',
    title: 'Making the Site More Personal',
    description: 'Why the site shifted toward the book and archive.',
    date: '2026-03-16',
    updated: '2026-03-16',
    year: '2026',
    tags: ['Portfolio', 'Reader'],
    plainText: 'The site now leads with the book, the reader, and the archive.',
    headings: [{ id: 'introduction', text: 'Introduction', level: 2 }],
    featured: false,
    featuredOrder: undefined,
    status: undefined,
    searchKeywords: ['books', 'reader'],
    links: [],
    downloads: [],
    appLinks: [],
  },
  {
    kind: 'projects',
    slug: 'dialogue-forge-interactive-narrative-builder',
    href: '/projects/dialogue-forge-interactive-narrative-builder',
    title: 'Dialogue Forge',
    description: 'Interactive narrative builder with branching dialogue.',
    date: '2024-12-18',
    updated: '2024-12-18',
    year: '2024',
    tags: ['Interactive Fiction', 'React'],
    plainText: 'Dialogue Forge is a branching dialogue tool with persistent memory.',
    headings: [{ id: 'overview', text: 'Overview', level: 2 }],
    featured: true,
    featuredOrder: 1,
    status: 'active',
    searchKeywords: ['narrative', 'branching'],
    links: [],
    downloads: [],
          appLinks: [{ label: 'Open Dialogue Forge', href: '/apps/dialogue-forge', kind: 'app', external: false }],
  },
];

describe('content discovery utilities', () => {
  it('filters blog items by tag and year while keeping newest-first sorting', () => {
    const filtered = filterDiscoveryItems(items.filter((item) => item.kind === 'blog'), {
      tags: ['Reader'],
      year: '2026',
      sort: 'newest',
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.slug).toBe('making-the-site-more-personal-reader-and-repo-structure');
  });

  it('prefers featured order for projects by default', () => {
    const filtered = filterDiscoveryItems(items.filter((item) => item.kind === 'projects'), {
      sort: 'featured',
    });

    expect(filtered[0]?.slug).toBe('dialogue-forge-interactive-narrative-builder');
  });

  it('builds snippets and search hits from body content', () => {
    const hits = searchDiscoveryItems(items, 'reader archive', 5);

    expect(hits).toHaveLength(1);
    expect(hits[0]?.item.kind).toBe('blog');
    expect(buildDiscoverySnippet(items[0], 'reader')).toContain('reader');
  });

  it('returns highlighted segments for matched query terms', () => {
    const segments = highlightTextSegments('Interactive narrative builder', 'narrative');

    expect(segments.some((segment) => segment.highlighted)).toBe(true);
    expect(segments.map((segment) => segment.text).join('')).toBe('Interactive narrative builder');
  });

  it('filters listen items by genre and catalog kind', () => {
    const listenItems: DiscoveryItem[] = [
      {
        kind: 'listen',
        slug: 'a',
        href: '/listen#a',
        title: 'Track A',
        description: 'One',
        date: '2026-01-02',
        updated: '2026-01-02',
        year: '2026',
        tags: [],
        listenCatalogKind: 'track',
        genre: 'Rock',
        mood: 'Calm',
        era: '2026',
        searchKeywords: [],
        plainText: 'one',
        headings: [],
        links: [],
        downloads: [],
        appLinks: [],
      },
      {
        kind: 'listen',
        slug: 'b',
        href: '/listen#b',
        title: 'Preset B',
        description: 'Two',
        date: '2026-01-01',
        updated: '2026-01-01',
        year: '2026',
        tags: [],
        listenCatalogKind: 'preset',
        genre: 'Preset',
        mood: 'Bright',
        era: '2026',
        searchKeywords: [],
        plainText: 'two',
        headings: [],
        links: [],
        downloads: [],
        appLinks: [],
      },
    ];

    const byGenre = filterDiscoveryItems(listenItems, { genre: 'Rock', sort: 'newest' });
    expect(byGenre).toHaveLength(1);
    expect(byGenre[0]?.slug).toBe('a');

    const presetsOnly = filterDiscoveryItems(listenItems, { listenCatalogKind: 'preset', sort: 'newest' });
    expect(presetsOnly).toHaveLength(1);
    expect(presetsOnly[0]?.slug).toBe('b');
  });

  it('matches listen catalog rows when the query looks like the /listen path', () => {
    const listen = getStaticListenSearchDiscoveryItems();
    const hits = searchDiscoveryItems(listen, '/listen', 20);

    expect(hits.length).toBeGreaterThan(0);
    for (const hit of hits) {
      expect(() => highlightTextSegments(hit.item.title, '/listen')).not.toThrow();
      expect(() =>
        highlightTextSegments(hit.snippet || hit.item.description, '/listen')
      ).not.toThrow();
    }
  });

  it('does not throw when scoring items with missing optional text fields', () => {
    const partial = {
      ...items[0],
      plainText: undefined,
      description: undefined,
      tags: undefined,
      searchKeywords: undefined,
    } as unknown as DiscoveryItem;

    expect(() => scoreDiscoveryItem(partial, '/')).not.toThrow();
  });
});
