export type RagSourceKind = 'doc' | 'project' | 'blog' | 'magicborn';

export interface RagSourceDocument {
  sourceId: string;
  title: string;
  description: string;
  kind: RagSourceKind;
  scope: string;
  slug: string;
  sourcePath: string;
  publicUrl: string;
  updatedAt: string;
  checksum: string;
  body: string;
  meta: Record<string, unknown>;
}

export interface RagChunkDraft {
  chunkIndex: number;
  heading: string;
  anchor: string;
  content: string;
  tokenCount: number;
  contentChecksum: string;
}

export interface RagIngestSummary {
  runId: string;
  indexedSources: number;
  indexedChunks: number;
  reusedChunks: number;
  deletedSources: number;
}

export interface RagSearchHit {
  chunkId: number;
  sourceId: string;
  sourceKind: RagSourceKind;
  sourceScope: string;
  title: string;
  heading: string;
  anchor: string;
  publicUrl: string;
  sourcePath: string;
  content: string;
  snippet: string;
  distance: number;
  score: number;
}
