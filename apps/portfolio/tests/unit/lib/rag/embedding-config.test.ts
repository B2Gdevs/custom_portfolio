import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('RAG embedding config', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to local MiniLM provider with 384 dimensions', async () => {
    const { getEmbeddingProvider, getEmbeddingDimensions } = await import('@/lib/rag/config');
    expect(getEmbeddingProvider()).toBe('local');
    expect(getEmbeddingDimensions()).toBe(384);
  });

  it('uses OpenAI provider when RAG_EMBEDDING_PROVIDER=openai', async () => {
    vi.stubEnv('RAG_EMBEDDING_PROVIDER', 'openai');
    const { getEmbeddingProvider, getEmbeddingDimensions } = await import('@/lib/rag/config');
    expect(getEmbeddingProvider()).toBe('openai');
    expect(getEmbeddingDimensions()).toBe(1536);
  });

  it('uses local MiniLM defaults when RAG_EMBEDDING_PROVIDER=local', async () => {
    vi.stubEnv('RAG_EMBEDDING_PROVIDER', 'local');
    const { getEmbeddingProvider, getEmbeddingDimensions, getEmbeddingModel } = await import('@/lib/rag/config');
    expect(getEmbeddingProvider()).toBe('local');
    expect(getEmbeddingDimensions()).toBe(384);
    expect(getEmbeddingModel()).toContain('MiniLM');
  });
});
