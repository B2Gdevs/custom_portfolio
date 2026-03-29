import { getEmbeddingDimensions, getEmbeddingModel } from './config';

interface OpenAIEmbeddingsResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length) {
    return [];
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for RAG embeddings.');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: texts,
      model: getEmbeddingModel(),
      dimensions: getEmbeddingDimensions(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embeddings request failed: ${response.status} ${errorText}`);
  }

  const body = (await response.json()) as OpenAIEmbeddingsResponse;
  return body.data
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.embedding);
}
