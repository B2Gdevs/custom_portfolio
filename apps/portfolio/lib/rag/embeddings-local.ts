import path from 'node:path';
import { env, pipeline } from '@xenova/transformers';
import { getEmbeddingModel, getPortfolioAppRoot } from './config';

function ensureCacheDir() {
  const root = getPortfolioAppRoot();
  env.cacheDir = path.join(root, 'models', '.transformers-cache');
  env.allowLocalModels = false;
}

let pipePromise: Promise<unknown> | null = null;

async function getExtractor() {
  ensureCacheDir();
  if (!pipePromise) {
    pipePromise = pipeline('feature-extraction', getEmbeddingModel());
  }
  return pipePromise;
}

function tensorToVector(raw: unknown): number[] {
  if (
    raw &&
    typeof raw === 'object' &&
    'data' in raw &&
    (raw as { data: unknown }).data instanceof Float32Array
  ) {
    return Array.from((raw as { data: Float32Array }).data);
  }

  throw new Error('Local embedding pipeline returned an unexpected tensor shape.');
}

export async function embedTextsLocal(texts: string[]): Promise<number[][]> {
  const extractor = (await getExtractor()) as (
    input: string,
    options: { pooling: string; normalize: boolean },
  ) => Promise<unknown>;

  const vectors: number[][] = [];
  for (const text of texts) {
    const raw = await extractor(text, { pooling: 'mean', normalize: true });
    vectors.push(tensorToVector(raw));
  }
  return vectors;
}
