export type DiscoveryKind = 'blog' | 'projects' | 'listen';

export interface DiscoveryHeading {
  id: string;
  text: string;
  level: number;
}

export interface DiscoveryLink {
  label: string;
  href: string;
  description?: string;
  kind?: string;
  external?: boolean;
}

export interface DiscoveryItem {
  kind: DiscoveryKind;
  slug: string;
  href: string;
  title: string;
  description: string;
  date?: string;
  updated?: string;
  year?: string;
  tags: string[];
  status?: string;
  featured?: boolean;
  featuredOrder?: number;
  /** Listen surface: BandLab track vs preset row */
  listenCatalogKind?: 'track' | 'preset';
  genre?: string;
  mood?: string;
  era?: string;
  duration?: string;
  searchKeywords: string[];
  plainText: string;
  headings: DiscoveryHeading[];
  links: DiscoveryLink[];
  downloads: DiscoveryLink[];
  appLinks: DiscoveryLink[];
}

export interface DiscoveryFilters {
  query?: string;
  tags?: string[];
  year?: string | null;
  status?: string | null;
  sort?: string | null;
  /** Listen: facet filters */
  genre?: string | null;
  mood?: string | null;
  era?: string | null;
  listenCatalogKind?: 'track' | 'preset' | null;
}

export interface DiscoverySearchHit {
  item: DiscoveryItem;
  score: number;
  snippet: string;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function includesAllTokens(text: string, tokens: string[]): boolean {
  return tokens.every((token) => text.includes(token));
}

function includesAnyToken(text: string, tokens: string[]): boolean {
  return tokens.some((token) => text.includes(token));
}

function getDateTimestamp(dateString: string | undefined): number {
  if (!dateString) return 0;
  const timestamp = new Date(dateString).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function buildSearchBlob(item: DiscoveryItem): string {
  return [
    item.title,
    item.description,
    item.tags.join(' '),
    item.status ?? '',
    item.genre ?? '',
    item.mood ?? '',
    item.era ?? '',
    item.listenCatalogKind ?? '',
    item.searchKeywords.join(' '),
    item.headings.map((heading) => heading.text).join(' '),
    item.plainText,
  ]
    .join(' ')
    .toLowerCase();
}

function getSnippetSource(item: DiscoveryItem): string {
  return [item.description, item.headings.map((heading) => heading.text).join(' '), item.plainText]
    .filter(Boolean)
    .join(' ');
}

export function getDiscoveryFilterOptions(items: DiscoveryItem[]) {
  const tags = new Set<string>();
  const years = new Set<string>();
  const statuses = new Set<string>();
  const genres = new Set<string>();
  const moods = new Set<string>();
  const eras = new Set<string>();
  const listenKinds = new Set<'track' | 'preset'>();

  for (const item of items) {
    for (const tag of item.tags) tags.add(tag);
    if (item.year) years.add(item.year);
    if (item.status) statuses.add(item.status);
    if (item.kind === 'listen') {
      if (item.genre) genres.add(item.genre);
      if (item.mood) moods.add(item.mood);
      if (item.era) eras.add(item.era);
      if (item.listenCatalogKind) listenKinds.add(item.listenCatalogKind);
    }
  }

  return {
    tags: Array.from(tags).sort((a, b) => a.localeCompare(b)),
    years: Array.from(years).sort((a, b) => b.localeCompare(a)),
    statuses: Array.from(statuses).sort((a, b) => a.localeCompare(b)),
    genres: Array.from(genres).sort((a, b) => a.localeCompare(b)),
    moods: Array.from(moods).sort((a, b) => a.localeCompare(b)),
    eras: Array.from(eras).sort((a, b) => a.localeCompare(b)),
    listenKinds: Array.from(listenKinds).sort((a, b) => a.localeCompare(b)),
  };
}

export function getDefaultSort(kind: DiscoveryKind): string {
  return kind === 'projects' ? 'featured' : 'newest';
}

export function filterDiscoveryItems(items: DiscoveryItem[], filters: DiscoveryFilters): DiscoveryItem[] {
  const query = filters.query?.trim() ?? '';
  const tokens = tokenize(query);
  const activeTags = new Set((filters.tags ?? []).map(normalize));
  const activeYear = filters.year ? normalize(filters.year) : null;
  const activeStatus = filters.status ? normalize(filters.status) : null;
  const activeGenre = filters.genre ? normalize(filters.genre) : null;
  const activeMood = filters.mood ? normalize(filters.mood) : null;
  const activeEra = filters.era ? normalize(filters.era) : null;
  const activeListenKind = filters.listenCatalogKind ?? null;
  const sort = filters.sort ?? null;

  const filtered = items.filter((item) => {
    if (activeTags.size > 0 && !item.tags.some((tag) => activeTags.has(normalize(tag)))) {
      return false;
    }

    if (activeYear && normalize(item.year ?? '') !== activeYear) {
      return false;
    }

    if (activeStatus && normalize(item.status ?? '') !== activeStatus) {
      return false;
    }

    if (item.kind === 'listen') {
      if (activeGenre && normalize(item.genre ?? '') !== activeGenre) {
        return false;
      }
      if (activeMood && normalize(item.mood ?? '') !== activeMood) {
        return false;
      }
      if (activeEra && normalize(item.era ?? '') !== activeEra) {
        return false;
      }
      if (activeListenKind && item.listenCatalogKind !== activeListenKind) {
        return false;
      }
    }

    if (tokens.length === 0) return true;
    return includesAllTokens(buildSearchBlob(item), tokens);
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    const appliedSort = sort ?? getDefaultSort(a.kind);

    if (appliedSort === 'title') {
      return a.title.localeCompare(b.title);
    }

    if (appliedSort === 'oldest') {
      return getDateTimestamp(a.updated ?? a.date) - getDateTimestamp(b.updated ?? b.date);
    }

    if (appliedSort === 'featured') {
      const orderA = typeof a.featuredOrder === 'number' ? a.featuredOrder : Number.MAX_SAFE_INTEGER;
      const orderB = typeof b.featuredOrder === 'number' ? b.featuredOrder : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;

      const featuredA = a.featured ? 1 : 0;
      const featuredB = b.featured ? 1 : 0;
      if (featuredA !== featuredB) return featuredB - featuredA;
    }

    return getDateTimestamp(b.updated ?? b.date) - getDateTimestamp(a.updated ?? a.date);
  });

  return sorted;
}

export function scoreDiscoveryItem(item: DiscoveryItem, query: string): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;

  const title = item.title.toLowerCase();
  const description = item.description.toLowerCase();
  const tags = item.tags.join(' ').toLowerCase();
  const headings = item.headings.map((heading) => heading.text).join(' ').toLowerCase();
  const keywords = item.searchKeywords.join(' ').toLowerCase();
  const body = item.plainText.toLowerCase();
  const status = (item.status ?? '').toLowerCase();
  const genre = (item.genre ?? '').toLowerCase();
  const mood = (item.mood ?? '').toLowerCase();
  const era = (item.era ?? '').toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (title.includes(token)) score += 9;
    if (headings.includes(token)) score += 6;
    if (tags.includes(token) || status.includes(token)) score += 4;
    if (genre.includes(token) || mood.includes(token) || era.includes(token)) score += 4;
    if (keywords.includes(token)) score += 4;
    if (description.includes(token)) score += 3;
    if (body.includes(token)) score += 1;
  }

  return score;
}

export function buildDiscoverySnippet(item: DiscoveryItem, query: string): string {
  const source = getSnippetSource(item);
  const compact = source.replace(/\s+/g, ' ').trim();
  if (!compact) return '';

  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return compact.slice(0, 180).trim();
  }

  const lower = compact.toLowerCase();
  const firstIndex = tokens.reduce((closest, token) => {
    const index = lower.indexOf(token);
    if (index === -1) return closest;
    if (closest === -1 || index < closest) return index;
    return closest;
  }, -1);

  if (firstIndex === -1) {
    return compact.slice(0, 180).trim();
  }

  const start = Math.max(0, firstIndex - 60);
  const end = Math.min(compact.length, firstIndex + 140);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < compact.length ? '…' : '';
  return `${prefix}${compact.slice(start, end).trim()}${suffix}`;
}

export function searchDiscoveryItems(items: DiscoveryItem[], query: string, limit = 12): DiscoverySearchHit[] {
  const trimmed = query.trim();
  const tokens = tokenize(trimmed);
  const pool = tokens.length === 0 ? items : items.filter((item) => includesAllTokens(buildSearchBlob(item), tokens));

  return pool
    .map((item) => ({
      item,
      score: scoreDiscoveryItem(item, trimmed),
      snippet: buildDiscoverySnippet(item, trimmed),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return getDateTimestamp(b.item.updated ?? b.item.date) - getDateTimestamp(a.item.updated ?? a.item.date);
    })
    .slice(0, limit);
}

export function highlightTextSegments(text: string, query: string): Array<{ text: string; highlighted: boolean }> {
  const tokens = Array.from(new Set(tokenize(query))).sort((a, b) => b.length - a.length);
  if (tokens.length === 0 || !text) {
    return [{ text, highlighted: false }];
  }

  const escaped = tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const matcher = new RegExp(`(${escaped.join('|')})`, 'ig');
  const parts = text.split(matcher).filter(Boolean);
  return parts.map((part) => ({
    text: part,
    highlighted: includesAnyToken(part.toLowerCase(), tokens),
  }));
}
