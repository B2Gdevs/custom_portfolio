import { retrieveRagContext } from '@/lib/rag/retrieve';
import { embedTexts } from '@/lib/rag/embeddings';
import { rerankRagHits, searchSemanticRagHits } from '@/lib/rag/search-db';

vi.mock('@/lib/rag/embeddings', () => ({
  embedTexts: vi.fn(),
}));

vi.mock('@/lib/rag/search-db', () => ({
  searchSemanticRagHits: vi.fn(),
  rerankRagHits: vi.fn(),
}));

describe('retrieveRagContext', () => {
  it('returns an empty array for blank queries', async () => {
    await expect(retrieveRagContext('   ')).resolves.toEqual([]);
    expect(embedTexts).not.toHaveBeenCalled();
    expect(searchSemanticRagHits).not.toHaveBeenCalled();
    expect(rerankRagHits).not.toHaveBeenCalled();
  });

  it('embeds, searches, and reranks the trimmed query', async () => {
    const semanticHits = [
      {
        chunkId: 1,
        sourceId: 'docs:magicborn/in-world/mordreds-tale/morgana-the-sleeping-root',
        sourceKind: 'magicborn' as const,
        sourceScope: 'magicborn',
        title: 'Morgana, the Sleeping Root',
        heading: 'Known Facts',
        anchor: 'known-facts',
        publicUrl: '/docs/magicborn/in-world/mordreds-tale/morgana-the-sleeping-root',
        sourcePath: 'apps/portfolio/content/docs/magicborn/in-world/mordreds-tale/morgana-the-sleeping-root.mdx',
        content: 'Morgana powers relics.',
        snippet: 'Morgana powers relics.',
        distance: 0.2,
        score: 0.8,
      },
    ];
    const rerankedHits = [{ ...semanticHits[0], score: 0.95 }];

    vi.mocked(embedTexts).mockResolvedValue([[0.1, 0.2, 0.3]]);
    vi.mocked(searchSemanticRagHits).mockResolvedValue(semanticHits);
    vi.mocked(rerankRagHits).mockResolvedValue(rerankedHits);

    await expect(retrieveRagContext('  morgana powers relics  ')).resolves.toEqual(rerankedHits);
    expect(embedTexts).toHaveBeenCalledWith(['morgana powers relics']);
    expect(searchSemanticRagHits).toHaveBeenCalledWith([0.1, 0.2, 0.3], 'morgana powers relics', {
      candidateLimit: 12,
    });
    expect(rerankRagHits).toHaveBeenCalledWith('morgana powers relics', semanticHits, {
      resultLimit: 6,
    });
  });
});
