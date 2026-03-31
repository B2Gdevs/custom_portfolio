import { getPayloadClient } from '@/lib/payload';
import { createLogger } from '@/lib/logging';
import { chunkRagSource } from './chunking';
import { embedTexts } from './embeddings';
import {
  getEmbeddingDimensions,
  getEmbeddingModel,
  getPayloadDatabaseFilePath,
} from './config';
import { clearRun, pruneInactiveRuns, replaceRunChunks, setActiveRunId } from './search-db';
import { getRagSourceDocuments } from './source-documents';
import type { RagIngestSummary, RagSourceKind } from './types';

type PayloadDoc = {
  id: number;
  [key: string]: unknown;
};

const INGEST_LOGGER = createLogger('rag.ingest');

interface IngestOptions {
  notes?: string;
  triggeredBy?: string;
}

interface SearchRow {
  chunkId: number;
  runId: string;
  sourceId: string;
  sourceKind: RagSourceKind;
  sourceScope: string;
  title: string;
  heading: string;
  anchor: string;
  publicUrl: string;
  sourcePath: string;
  content: string;
  embedding: number[];
}

function logIngestStep(message: string, details?: Record<string, unknown>) {
  if (details && Object.keys(details).length > 0) {
    INGEST_LOGGER.info(message, details);
    return;
  }

  INGEST_LOGGER.info(message);
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeNumber(value: unknown): number {
  return typeof value === 'number' ? value : 0;
}

function cleanupLegacyPayloadRagArtifacts() {
  // `vec0` tables in the Payload DB break Drizzle schema introspection unless the extension
  // is also loaded on the Payload/libsql connection. Keep vectors in the sidecar RAG DB instead.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('libsql');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqliteVec = require('sqlite-vec');
  const db = new Database(getPayloadDatabaseFilePath());
  try {
    sqliteVec.load(db);
    db.exec(`
      DROP TABLE IF EXISTS rag_chunk_vectors;
      DROP TABLE IF EXISTS rag_chunk_fts;
      DROP TABLE IF EXISTS rag_search_state;
    `);
  } finally {
    db.close();
  }
}

async function setChunkActiveState(
  runId: number,
  isActive: boolean,
) {
  // Relationship fields on Payload's SQLite adapter currently round-trip as decimal-like text
  // (`30.0`), which makes bulk `payload.update()` calls revalidate existing rows incorrectly.
  // Toggle activation with a direct SQL update against the internal table instead.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('libsql');
  const db = new Database(getPayloadDatabaseFilePath());
  try {
    db.prepare(`
      UPDATE rag_chunks
      SET is_active = ?
      WHERE run_id = ?
    `).run(isActive ? 1 : 0, runId);
  } finally {
    db.close();
  }
}

export async function ingestRagCorpus(options: IngestOptions = {}): Promise<RagIngestSummary> {
  logIngestStep('starting ingest run', {
    triggeredBy: options.triggeredBy ?? 'script',
    payloadDb: getPayloadDatabaseFilePath(),
  });
  cleanupLegacyPayloadRagArtifacts();
  logIngestStep('payload db cleanup complete');
  const payload = await getPayloadClient();
  logIngestStep('payload client ready');
  const now = new Date().toISOString();
  const run = (await payload.create({
    collection: 'rag-ingest-runs',
    data: {
      status: 'running',
      startedAt: now,
      triggeredBy: options.triggeredBy ?? 'script',
      notes: options.notes ?? '',
      config: {
        embeddingModel: getEmbeddingModel(),
        embeddingDimensions: getEmbeddingDimensions(),
      },
    },
  })) as PayloadDoc;

  const runDocumentId = run.id;
  const runPartitionKey = String(run.id);
  logIngestStep('ingest run created', {
    runId: runPartitionKey,
  });

  try {
    const sourceSnapshot = getRagSourceDocuments();
    logIngestStep('source snapshot loaded', {
      sourceCount: sourceSnapshot.length,
    });
    const existingSources = await payload.find({
      collection: 'rag-sources',
      limit: 500,
      pagination: false,
      depth: 0,
    });
    const activeRuns = await payload.find({
      collection: 'rag-ingest-runs',
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
      sort: '-startedAt',
      depth: 0,
    });

    const activeRun = activeRuns.docs[0] as PayloadDoc | undefined;
    const activeRunDocumentId = activeRun?.id;
    logIngestStep('loaded existing payload state', {
      existingSourceCount: existingSources.docs.length,
      activeRunId: activeRunDocumentId ?? null,
    });
    const existingSourceById = new Map(
      (existingSources.docs as PayloadDoc[]).map((source) => [String(source.sourceId), source]),
    );

    const currentSourceIds = new Set(sourceSnapshot.map((source) => source.sourceId));
    let deletedSources = 0;

    for (const staleSource of existingSources.docs as PayloadDoc[]) {
      const sourceId = String(staleSource.sourceId);
      if (currentSourceIds.has(sourceId) || staleSource.isDeleted) {
        continue;
      }

      await payload.update({
        collection: 'rag-sources',
        id: staleSource.id,
        data: {
          isDeleted: true,
          currentRunId: runPartitionKey,
          lastIndexedAt: new Date().toISOString(),
        },
      });
      deletedSources += 1;
    }
    logIngestStep('stale source scan complete', {
      deletedSources,
    });

    const previousChunks = activeRunDocumentId
      ? await payload.find({
          collection: 'rag-chunks',
          where: {
            run: {
              equals: activeRunDocumentId,
            },
          },
          limit: 5000,
          pagination: false,
          depth: 0,
        })
      : { docs: [] };
    const previousChunksBySourceId = new Map<string, PayloadDoc[]>();

    for (const chunk of previousChunks.docs as PayloadDoc[]) {
      const sourceId = String(chunk.sourceExternalId);
      const current = previousChunksBySourceId.get(sourceId) ?? [];
      current.push(chunk);
      previousChunksBySourceId.set(sourceId, current);
    }

    const searchRows: SearchRow[] = [];
    let indexedSources = 0;
    let indexedChunks = 0;
    let reusedChunks = 0;
    let newlyEmbeddedSources = 0;

    for (const source of sourceSnapshot) {
      indexedSources += 1;
      const existingSource = existingSourceById.get(source.sourceId);
      const sourceDoc = existingSource
        ? ((await payload.update({
            collection: 'rag-sources',
            id: existingSource.id,
            data: {
              sourceId: source.sourceId,
              title: source.title,
              description: source.description,
              kind: source.kind,
              scope: source.scope,
              slug: source.slug,
              sourcePath: source.sourcePath,
              publicUrl: source.publicUrl,
              checksum: source.checksum,
              lastContentUpdatedAt: source.updatedAt,
              lastIndexedAt: new Date().toISOString(),
              currentRunId: runPartitionKey,
              isDeleted: false,
              meta: source.meta,
            },
          })) as PayloadDoc)
        : ((await payload.create({
            collection: 'rag-sources',
            data: {
              sourceId: source.sourceId,
              title: source.title,
              description: source.description,
              kind: source.kind,
              scope: source.scope,
              slug: source.slug,
              sourcePath: source.sourcePath,
              publicUrl: source.publicUrl,
              checksum: source.checksum,
              lastContentUpdatedAt: source.updatedAt,
              lastIndexedAt: new Date().toISOString(),
              currentRunId: runPartitionKey,
              isDeleted: false,
              meta: source.meta,
            },
          })) as PayloadDoc);

      const priorChunks = previousChunksBySourceId.get(source.sourceId) ?? [];
      const canReuse =
        existingSource &&
        String(existingSource.checksum) === source.checksum &&
        priorChunks.length > 0;

      if (canReuse) {
        for (const priorChunk of priorChunks) {
          const createdChunk = (await payload.create({
            collection: 'rag-chunks',
            data: {
              vectorKey: `${runPartitionKey}:${source.sourceId}:${normalizeNumber(priorChunk.chunkIndex)}`,
              source: sourceDoc.id,
              run: runDocumentId,
              sourceExternalId: source.sourceId,
              sourceTitle: source.title,
              sourceKind: source.kind,
              sourceScope: source.scope,
              sourceSlug: source.slug,
              sourcePath: source.sourcePath,
              publicUrl: source.publicUrl,
              chunkIndex: normalizeNumber(priorChunk.chunkIndex),
              heading: normalizeText(priorChunk.heading),
              anchor: normalizeText(priorChunk.anchor),
              content: normalizeText(priorChunk.content),
              tokenCount: normalizeNumber(priorChunk.tokenCount),
              contentChecksum: normalizeText(priorChunk.contentChecksum),
              embeddingModel: normalizeText(priorChunk.embeddingModel) || getEmbeddingModel(),
              embeddingDimensions:
                normalizeNumber(priorChunk.embeddingDimensions) || getEmbeddingDimensions(),
              embedding: (priorChunk.embedding as number[]) ?? [],
              isActive: false,
            },
          })) as PayloadDoc;

          searchRows.push({
            chunkId: createdChunk.id,
            runId: runPartitionKey,
            sourceId: source.sourceId,
            sourceKind: source.kind,
            sourceScope: source.scope,
            title: source.title,
            heading: normalizeText(priorChunk.heading),
            anchor: normalizeText(priorChunk.anchor),
            publicUrl: source.publicUrl,
            sourcePath: source.sourcePath,
            content: normalizeText(priorChunk.content),
            embedding: ((priorChunk.embedding as number[]) ?? []).map(Number),
          });
          reusedChunks += 1;
          indexedChunks += 1;
        }
        if (indexedSources % 10 === 0 || indexedSources === sourceSnapshot.length) {
          logIngestStep('source progress', {
            processedSources: indexedSources,
            totalSources: sourceSnapshot.length,
            indexedChunks,
            reusedChunks,
            newlyEmbeddedSources,
          });
        }
        continue;
      }

      const chunkDrafts = chunkRagSource(source);
      newlyEmbeddedSources += 1;
      logIngestStep('embedding source chunks', {
        sourceId: source.sourceId,
        chunkCount: chunkDrafts.length,
      });
      const embeddings = await embedTexts(chunkDrafts.map((chunk) => chunk.content));

      for (const [index, chunkDraft] of chunkDrafts.entries()) {
        const embedding = embeddings[index];
        const createdChunk = (await payload.create({
          collection: 'rag-chunks',
          data: {
            vectorKey: `${runPartitionKey}:${source.sourceId}:${chunkDraft.chunkIndex}`,
            source: sourceDoc.id,
            run: runDocumentId,
            sourceExternalId: source.sourceId,
            sourceTitle: source.title,
            sourceKind: source.kind,
            sourceScope: source.scope,
            sourceSlug: source.slug,
            sourcePath: source.sourcePath,
            publicUrl: source.publicUrl,
            chunkIndex: chunkDraft.chunkIndex,
            heading: chunkDraft.heading,
            anchor: chunkDraft.anchor,
            content: chunkDraft.content,
            tokenCount: chunkDraft.tokenCount,
            contentChecksum: chunkDraft.contentChecksum,
            embeddingModel: getEmbeddingModel(),
            embeddingDimensions: getEmbeddingDimensions(),
            embedding,
            isActive: false,
          },
        })) as PayloadDoc;

        searchRows.push({
          chunkId: createdChunk.id,
          runId: runPartitionKey,
          sourceId: source.sourceId,
          sourceKind: source.kind,
          sourceScope: source.scope,
          title: source.title,
          heading: chunkDraft.heading,
          anchor: chunkDraft.anchor,
          publicUrl: source.publicUrl,
          sourcePath: source.sourcePath,
          content: chunkDraft.content,
          embedding,
        });
        indexedChunks += 1;
      }

      if (indexedSources % 10 === 0 || indexedSources === sourceSnapshot.length) {
        logIngestStep('source progress', {
          processedSources: indexedSources,
          totalSources: sourceSnapshot.length,
          indexedChunks,
          reusedChunks,
          newlyEmbeddedSources,
        });
      }
    }

    logIngestStep('writing sidecar search rows', {
      rowCount: searchRows.length,
      runId: runPartitionKey,
    });
    replaceRunChunks(runPartitionKey, searchRows);
    logIngestStep('sidecar search rows written');

    if (activeRunDocumentId) {
      await payload.update({
        collection: 'rag-ingest-runs',
        id: activeRunDocumentId,
        data: {
          isActive: false,
        },
      });
      await setChunkActiveState(activeRunDocumentId, false);
      logIngestStep('previous active run deactivated', {
        activeRunId: activeRunDocumentId,
      });
    }

    await setChunkActiveState(runDocumentId, true);
    logIngestStep('new run chunks activated', {
      runId: runPartitionKey,
    });

    await payload.update({
      collection: 'rag-ingest-runs',
      id: runDocumentId,
      data: {
        status: 'completed',
        finishedAt: new Date().toISOString(),
        committedAt: new Date().toISOString(),
        isActive: true,
        indexedSourceCount: indexedSources,
        indexedChunkCount: indexedChunks,
        reusedChunkCount: reusedChunks,
        deletedSourceCount: deletedSources,
      },
    });

    setActiveRunId(runPartitionKey);
    pruneInactiveRuns(runPartitionKey);
    logIngestStep('ingest run committed', {
      runId: runPartitionKey,
      indexedSources,
      indexedChunks,
      reusedChunks,
      deletedSources,
    });

    return {
      runId: runPartitionKey,
      indexedSources,
      indexedChunks,
      reusedChunks,
      deletedSources,
    };
  } catch (error) {
    logIngestStep('ingest run failed', serializeError(error));
    clearRun(runPartitionKey);
    await payload.update({
      collection: 'rag-ingest-runs',
      id: runDocumentId,
      data: {
        status: 'failed',
        finishedAt: new Date().toISOString(),
        error: serializeError(error),
      },
    });
    throw error;
  }
}
