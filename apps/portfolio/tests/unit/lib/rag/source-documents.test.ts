import { getRagSourceDocuments } from '@/lib/rag/source-documents';

describe('getRagSourceDocuments', () => {
  it('includes magicborn dossiers as retrieval sources', () => {
    const documents = getRagSourceDocuments();
    const morgana = documents.find(
      (document) => document.sourceId === 'docs:magicborn/in-world/mordreds-tale/morgana-the-sleeping-root',
    );

    expect(morgana).toBeDefined();
    expect(morgana).toMatchObject({
      kind: 'magicborn',
      scope: 'magicborn',
      publicUrl: '/docs/magicborn/in-world/mordreds-tale/morgana-the-sleeping-root',
    });
  });

  it('excludes planning-doc leaf pages from the retrieval corpus', () => {
    const sourceIds = new Set(getRagSourceDocuments().map((document) => document.sourceId));

    expect(sourceIds.has('docs:books/planning-docs')).toBe(false);
    expect(sourceIds.has('docs:books/state')).toBe(false);
    expect(sourceIds.has('docs:books/task-registry')).toBe(false);
    expect(sourceIds.has('docs:books/errors-and-attempts')).toBe(false);
    expect(sourceIds.has('docs:books/decisions')).toBe(false);
  });
});
