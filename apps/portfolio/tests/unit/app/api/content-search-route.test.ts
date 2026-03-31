import { GET } from '@/app/api/content/search/route';
import { getAllContentEntries } from '@/lib/content';
import { getListenSearchDiscoveryItems } from '@/lib/listen-runtime';

vi.mock('@/lib/content', () => ({
  getAllContentEntries: vi.fn(),
}));

vi.mock('@/lib/listen-runtime', () => ({
  getListenSearchDiscoveryItems: vi.fn(),
}));

describe('/api/content/search', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getListenSearchDiscoveryItems).mockResolvedValue([]);
  });

  it('returns grouped blog and project hits for the command palette', async () => {
    vi.mocked(getAllContentEntries).mockImplementation((type) => {
      if (type === 'blog') {
        return [
          {
            meta: {
              title: 'Making the Site More Personal',
              slug: 'making-the-site-more-personal-reader-and-repo-structure',
              description: 'Why the site shifted.',
              date: '2026-03-16',
              updated: '2026-03-16',
              tags: ['Portfolio'],
            },
            slug: 'making-the-site-more-personal-reader-and-repo-structure',
            href: '/blog/making-the-site-more-personal-reader-and-repo-structure',
            content: '',
            plainText: 'This post explains the reader and archive direction.',
            headings: [{ id: 'introduction', text: 'Introduction', level: 2 }],
            missingRequiredSections: [],
          },
        ];
      }

      return [
        {
          meta: {
            title: 'Dialogue Forge',
            slug: 'dialogue-forge-interactive-narrative-builder',
            description: 'Interactive narrative builder.',
            date: '2024-12-18',
            updated: '2024-12-18',
            tags: ['Interactive Fiction'],
            status: 'active',
            featured: true,
            featuredOrder: 1,
            appUrl: '/apps/dialogue-forge',
            appLabel: 'Open Dialogue Forge',
          },
          slug: 'dialogue-forge-interactive-narrative-builder',
          href: '/projects/dialogue-forge-interactive-narrative-builder',
          content: '',
          plainText: 'Dialogue Forge is a branching dialogue tool.',
          headings: [{ id: 'overview', text: 'Overview', level: 2 }],
          missingRequiredSections: [],
        },
      ];
    });

    const response = await GET(new Request('http://localhost/api/content/search?q=dialogue') as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      query: 'dialogue',
      hits: [
        expect.objectContaining({
          item: expect.objectContaining({
            kind: 'projects',
            href: '/projects/dialogue-forge-interactive-narrative-builder',
          }),
        }),
      ],
    });
  });
});
