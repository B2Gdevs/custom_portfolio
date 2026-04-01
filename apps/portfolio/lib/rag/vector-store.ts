import { getRagVectorStore } from './config';
import * as searchPg from './search-pg';
import * as sqlite from './search-sqlite';
import type { InsertableSearchChunk } from './search-sqlite';
import type { RagSearchHit } from './types';

export type { InsertableSearchChunk } from './search-sqlite';

export type ReplaceRunChunksOptions = {
  onProgress?: (written: number, total: number) => void;
};

export async function setActiveRunId(runId: string): Promise<void> {
  if (getRagVectorStore() === 'postgres') {
    await searchPg.setActiveRunId(runId);
    return;
  }
  sqlite.setActiveRunId(runId);
}

export async function replaceRunChunks(
  runId: string,
  chunks: InsertableSearchChunk[],
  options?: ReplaceRunChunksOptions,
): Promise<void> {
  if (getRagVectorStore() === 'postgres') {
    await searchPg.replaceRunChunks(runId, chunks, options);
    return;
  }
  options?.onProgress?.(0, chunks.length);
  sqlite.replaceRunChunks(runId, chunks);
  options?.onProgress?.(chunks.length, chunks.length);
}

export async function clearRun(runId: string): Promise<void> {
  if (getRagVectorStore() === 'postgres') {
    await searchPg.clearRun(runId);
    return;
  }
  sqlite.clearRun(runId);
}

export async function pruneInactiveRuns(activeRunId: string): Promise<void> {
  if (getRagVectorStore() === 'postgres') {
    await searchPg.pruneInactiveRuns(activeRunId);
    return;
  }
  sqlite.pruneInactiveRuns(activeRunId);
}

export async function searchSemanticRagHits(
  queryEmbedding: number[],
  query: string,
  options?: { candidateLimit?: number },
): Promise<RagSearchHit[]> {
  if (getRagVectorStore() === 'postgres') {
    return searchPg.searchSemanticRagHits(queryEmbedding, query, options);
  }
  return sqlite.searchSemanticRagHits(queryEmbedding, query, options);
}

export async function rerankRagHits(
  query: string,
  hits: RagSearchHit[],
  options?: { resultLimit?: number },
): Promise<RagSearchHit[]> {
  if (getRagVectorStore() === 'postgres') {
    return searchPg.rerankRagHits(query, hits, options);
  }
  return sqlite.rerankRagHits(query, hits, options);
}
