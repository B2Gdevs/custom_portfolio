import { getAllContentEntries } from '@/lib/content';

describe('content template contracts', () => {
  it('keeps every blog post on the strict article section contract', () => {
    const missing = getAllContentEntries('blog')
      .filter((entry) => entry.missingRequiredSections.length > 0)
      .map((entry) => ({
        slug: entry.slug,
        missing: entry.missingRequiredSections,
      }));

    expect(missing).toEqual([]);
  });

  it('keeps every project page on the strict project section contract', () => {
    const missing = getAllContentEntries('projects')
      .filter((entry) => entry.missingRequiredSections.length > 0)
      .map((entry) => ({
        slug: entry.slug,
        missing: entry.missingRequiredSections,
      }));

    expect(missing).toEqual([]);
  });
});
