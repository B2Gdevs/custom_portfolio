import {
  applyShelfCatalogFilter,
  collectDistinctGenres,
  normalizeShelfCatalogFilter,
  partitionShelfBooks,
  type ReaderBookEntry,
} from '@portfolio/repub-builder/reader';

const fantasy: ReaderBookEntry = {
  slug: 'fantasy-one',
  title: 'Fantasy One',
  genres: ['Fantasy', 'Adventure'],
  hasEpub: true,
};
const dark: ReaderBookEntry = {
  slug: 'dark-one',
  title: 'Dark One',
  genres: ['Dark fantasy'],
  hasEpub: true,
};
const noGenre: ReaderBookEntry = {
  slug: 'plain',
  title: 'Plain',
  hasEpub: true,
};
const queuedGenre: ReaderBookEntry = {
  slug: 'soon',
  title: 'Soon',
  genres: ['Fantasy'],
  hasEpub: false,
};

describe('partitionShelfBooks', () => {
  it('splits EPUB-ready rows from queued rows', () => {
    expect(partitionShelfBooks([fantasy, queuedGenre, dark])).toEqual({
      builtIn: [fantasy, dark],
      queued: [queuedGenre],
    });
  });
});

describe('collectDistinctGenres', () => {
  it('returns sorted unique genres', () => {
    expect(collectDistinctGenres([fantasy, dark, queuedGenre])).toEqual([
      'Adventure',
      'Dark fantasy',
      'Fantasy',
    ]);
  });
});

describe('normalizeShelfCatalogFilter', () => {
  it('maps legacy progress filters to all', () => {
    expect(normalizeShelfCatalogFilter('new', ['Fantasy'])).toBe('all');
    expect(normalizeShelfCatalogFilter('ready', ['Fantasy'])).toBe('all');
  });

  it('keeps known genres', () => {
    expect(normalizeShelfCatalogFilter('Fantasy', ['Fantasy', 'Dark fantasy'])).toBe('Fantasy');
  });

  it('drops unknown genres', () => {
    expect(normalizeShelfCatalogFilter('Horror', ['Fantasy'])).toBe('all');
  });
});

describe('applyShelfCatalogFilter', () => {
  const builtIn = [fantasy, dark, noGenre];
  const queued = [queuedGenre];

  it('returns both sections for all', () => {
    expect(applyShelfCatalogFilter(builtIn, queued, 'all')).toEqual({
      builtIn,
      queued,
    });
  });

  it('filters built-in and queued by genre', () => {
    expect(applyShelfCatalogFilter(builtIn, queued, 'Fantasy')).toEqual({
      builtIn: [fantasy],
      queued: [queuedGenre],
    });
    expect(applyShelfCatalogFilter(builtIn, queued, 'Dark fantasy')).toEqual({
      builtIn: [dark],
      queued: [],
    });
  });

  it('excludes books without the genre', () => {
    expect(applyShelfCatalogFilter(builtIn, queued, 'Adventure')).toEqual({
      builtIn: [fantasy],
      queued: [],
    });
    expect(applyShelfCatalogFilter(builtIn, queued, 'Dark fantasy').builtIn.map((b) => b.slug)).toEqual([
      'dark-one',
    ]);
  });
});
