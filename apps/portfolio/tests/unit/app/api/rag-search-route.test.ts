import { GET, POST } from '@/app/api/rag/search/route';
import { retrieveRagContext } from '@/lib/rag/retrieve';

vi.mock('@/lib/rag/retrieve', () => ({
  retrieveRagContext: vi.fn(),
}));

describe('/api/rag/search', () => {
  it('returns 400 for a missing GET query', async () => {
    const response = await GET(new Request('http://localhost/api/rag/search'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'missing_query' });
  });

  it('returns hits for a GET query', async () => {
    vi.mocked(retrieveRagContext).mockResolvedValue([
      {
        chunkId: 1,
        sourceId: 'docs:magicborn/in-world/mordreds-tale/morgana-the-sleeping-root',
        sourceKind: 'magicborn',
        sourceScope: 'magicborn',
        title: 'Morgana, the Sleeping Root',
        heading: 'Known Facts',
        anchor: 'known-facts',
        publicUrl: '/docs/magicborn/in-world/mordreds-tale/morgana-the-sleeping-root',
        sourcePath: 'apps/portfolio/content/docs/magicborn/in-world/mordreds-tale/morgana-the-sleeping-root.mdx',
        content: 'Morgana powers relics.',
        snippet: 'Morgana powers relics.',
        distance: 0.2,
        score: 0.9,
      },
    ]);

    const response = await GET(new Request('http://localhost/api/rag/search?q=Morgana'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      query: 'Morgana',
      hits: [
        expect.objectContaining({
          sourceId: 'docs:magicborn/in-world/mordreds-tale/morgana-the-sleeping-root',
        }),
      ],
    });
    expect(retrieveRagContext).toHaveBeenCalledWith('Morgana');
  });

  it('returns hits for a POST query', async () => {
    vi.mocked(retrieveRagContext).mockResolvedValue([]);

    const response = await POST(
      new Request('http://localhost/api/rag/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'Jack of Taro' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      query: 'Jack of Taro',
      hits: [],
    });
    expect(retrieveRagContext).toHaveBeenCalledWith('Jack of Taro');
  });
});
