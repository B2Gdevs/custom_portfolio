import { getPayloadClient } from '@/lib/payload';
import { createLogger } from '@/lib/logging';
import type { Payload } from 'payload';
import { chunkRagSource } from './chunking';
import { createChunkWriteSpinner, createRagIngestCli, createVectorIndexSpinner } from './ingest-cli';
import { embedTexts } from './embeddings';
import {
  getEmbeddingDimensions,
  getEmbeddingModel,
  getPayloadDatabaseFilePath,
  getRagDatabaseFilePath,
  getRagIngestReuseSourceConcurrency,
  getRagIngestSourceUpsertConcurrency,
  getRagVectorStore,
  isRagIngestBulkChunkCloneEnabled,
} from './config';
import { bulkCloneRagChunksForFullReuse } from './payload-rag-chunk-clone';
import { clearRun, pruneInactiveRuns, replaceRunChunks, setActiveRunId } from './search-db';
import { getRagSourceDocuments } from './source-documents';
import type { RagIngestSummary, RagSourceKind, RagSourceDocument } from './types';

type PayloadDoc = {
  id: number;
  [key: string]: unknown;
};

const INGEST_LOGGER = createLogger('rag.ingest');

/** Parallel Payload `rag-chunks` creates per batch (reuse path + new embeds). */
const PAYLOAD_CHUNK_WRITE_CONCURRENCY = 16;

function chunkArray<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

interface IngestOptions {
  notes?: string;
  triggeredBy?: string;
  /** When true (CLI entry), print npm-style progress to stdout. */
  verboseCli?: boolean;
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

async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
  onProgress?: (completed: number, total: number) => void,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }
  const results: R[] = new Array(items.length);
  let next = 0;
  let finished = 0;
  const cap = Math.max(1, Math.min(concurrency, items.length));

  async function runWorker(): Promise<void> {
    for (;;) {
      const i = next;
      next += 1;
      if (i >= items.length) {
        break;
      }
      results[i] = await worker(items[i]!, i);
      finished += 1;
      onProgress?.(finished, items.length);
    }
  }

  await Promise.all(Array.from({ length: cap }, () => runWorker()));
  return results;
}

function sortPriorChunks(docs: PayloadDoc[]): PayloadDoc[] {
  return [...docs].sort(
    (a, b) => normalizeNumber(a.chunkIndex) - normalizeNumber(b.chunkIndex),
  );
}

type PreparedIngestSource = {
  source: RagSourceDocument;
  sourceDoc: PayloadDoc;
  /** 1-based index in the corpus snapshot (for CLI ordering). */
  ordinal: number;
};

async function upsertRagSourceDoc(
  payload: Payload,
  source: RagSourceDocument,
  existingSource: PayloadDoc | undefined,
  runPartitionKey: string,
): Promise<PayloadDoc> {
  if (existingSource) {
    return (await payload.update({
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
    })) as PayloadDoc;
  }

  return (await payload.create({
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
  })) as PayloadDoc;
}

async function buildSearchRowsFromReusedChunks(
  payload: Payload,
  args: {
    source: RagSourceDocument;
    sourceDoc: PayloadDoc;
    priorChunks: PayloadDoc[];
    runDocumentId: number;
    runPartitionKey: string;
  },
): Promise<SearchRow[]> {
  const { source, sourceDoc, priorChunks, runDocumentId, runPartitionKey } = args;
  const rows: SearchRow[] = [];
  const batches = chunkArray(priorChunks, PAYLOAD_CHUNK_WRITE_CONCURRENCY);

  for (const batch of batches) {
    const created = await Promise.all(
      batch.map((priorChunk) =>
        payload.create({
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
        }),
      ),
    );

    for (let bi = 0; bi < created.length; bi += 1) {
      const createdChunk = created[bi]!;
      const priorChunk = batch[bi]!;
      rows.push({
        chunkId: normalizeNumber(createdChunk.id),
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
    }
  }

  return rows;
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
  const ui = createRagIngestCli(options.verboseCli === true);
  const wallStartedAt = Date.now();
  const ingestStartedAt = Date.now();

  ui.banner();
  ui.configSnapshot();

  logIngestStep('starting ingest run', {
    triggeredBy: options.triggeredBy ?? 'script',
    payloadDb: getPayloadDatabaseFilePath(),
  });

  const tCleanup = Date.now();
  ui.step('Cleanup legacy RAG tables in Payload DB (if any)');
  cleanupLegacyPayloadRagArtifacts();
  logIngestStep('payload db cleanup complete');
  ui.stepDone('cleanup', Date.now() - tCleanup);

  const tPayload = Date.now();
  ui.step('Connect Payload CMS');
  const payload = await getPayloadClient();
  logIngestStep('payload client ready');
  ui.stepDone('payload', Date.now() - tPayload);
  const now = new Date().toISOString();
  const tRunRecord = Date.now();
  ui.step('Create ingest run record');
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
  ui.stepDone(`run ${runPartitionKey}`, Date.now() - tRunRecord);

  try {
    const tCorpus = Date.now();
    ui.step('Resolve corpus, stale sources, prior-run chunks');
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

    ui.stepDone(
      `${sourceSnapshot.length} sources · ${deletedSources} stale · ${previousChunks.docs.length} prior chunks`,
      Date.now() - tCorpus,
    );
    ui.memory('after corpus load');

    const searchRows: SearchRow[] = [];
    let indexedChunks = 0;
    let reusedChunks = 0;
    let newlyEmbeddedSources = 0;
    const upsertConc = getRagIngestSourceUpsertConcurrency();
    const reusePipelineConc = getRagIngestReuseSourceConcurrency();

    ui.step('Embed or reuse chunks per source');
    const reuseEligibleCount = sourceSnapshot.filter((source) => {
      const existingSource = existingSourceById.get(source.sourceId);
      const priorChunks = previousChunksBySourceId.get(source.sourceId) ?? [];
      return !!(
        existingSource &&
        String(existingSource.checksum) === source.checksum &&
        priorChunks.length > 0
      );
    }).length;
    ui.ingestParallelPlan(reuseEligibleCount, sourceSnapshot.length);

    const spin = createChunkWriteSpinner(options.verboseCli === true);
    try {
      spin.update(`Upserting rag-sources 0/${sourceSnapshot.length} · ${upsertConc} parallel…`);

      const preparedList = await mapPool(
        sourceSnapshot,
        upsertConc,
        async (source, snapshotIndex) => {
          const existingSource = existingSourceById.get(source.sourceId);
          const sourceDoc = await upsertRagSourceDoc(
            payload,
            source,
            existingSource,
            runPartitionKey,
          );
          return {
            source,
            sourceDoc,
            ordinal: snapshotIndex + 1,
          } satisfies PreparedIngestSource;
        },
        (done, total) => {
          spin.update(`Upserting rag-sources ${done}/${total} · ${upsertConc} parallel…`);
        },
      );

      spin.update('Classifying checksum reuse vs embed…');

      type ReuseTask = PreparedIngestSource & { priorChunks: PayloadDoc[] };
      const reuseTasks: ReuseTask[] = [];
      const embedTasks: PreparedIngestSource[] = [];

      for (const p of preparedList) {
        const existingSource = existingSourceById.get(p.source.sourceId);
        const priorChunks = sortPriorChunks(
          previousChunksBySourceId.get(p.source.sourceId) ?? [],
        );
        const canReuse =
          existingSource &&
          String(existingSource.checksum) === p.source.checksum &&
          priorChunks.length > 0;

        if (canReuse) {
          reuseTasks.push({ ...p, priorChunks });
        } else {
          embedTasks.push(p);
        }
      }

      const totalReuseChunks = reuseTasks.reduce((s, t) => s + t.priorChunks.length, 0);
      let completedReuseSources = 0;
      let completedReuseChunks = 0;

      const fullCorpusChecksumReuse =
        embedTasks.length === 0 &&
        reuseTasks.length === sourceSnapshot.length &&
        sourceSnapshot.length > 0 &&
        activeRunDocumentId != null &&
        previousChunks.docs.length > 0;

      let didBulkSqlClone = false;
      if (fullCorpusChecksumReuse && isRagIngestBulkChunkCloneEnabled()) {
        try {
          spin.update('Bulk-cloning rag_chunks (SQL, full checksum reuse)…');
          const cloned = await bulkCloneRagChunksForFullReuse({
            oldRunId: Number(activeRunDocumentId),
            newRunId: Number(runDocumentId),
            newRunPartitionKey: runPartitionKey,
            expectedRowCount: previousChunks.docs.length,
          });
          searchRows.push(...cloned);
          reusedChunks = cloned.length;
          indexedChunks = cloned.length;
          didBulkSqlClone = true;
          logIngestStep('bulk sql rag-chunks clone complete', { rows: cloned.length });
          spin.pause();
          ui.sourceProgress(sourceSnapshot.length, sourceSnapshot.length, reusedChunks);
          spin.resume('Processing sources…');
        } catch (e) {
          logIngestStep('bulk sql rag-chunks clone failed; falling back to Payload API', {
            error: serializeError(e),
          });
          ui.warn(
            `Bulk SQL clone failed (${e instanceof Error ? e.message : String(e)}); using Payload API for reuse.`,
          );
        }
      }

      spin.update(
        didBulkSqlClone
          ? `SQL bulk clone done · ${reusedChunks} chunks`
          : reuseTasks.length > 0
            ? `Checksum reuse · ${reuseTasks.length} sources · ${reusePipelineConc} parallel pipelines`
            : 'No checksum reuse; embedding sources sequentially…',
      );

      const reuseRowBatches =
        didBulkSqlClone || reuseTasks.length === 0
          ? []
          : await mapPool(
              reuseTasks,
              reusePipelineConc,
              async (task) => {
                const rows = await buildSearchRowsFromReusedChunks(payload, {
                  source: task.source,
                  sourceDoc: task.sourceDoc,
                  priorChunks: task.priorChunks,
                  runDocumentId,
                  runPartitionKey,
                });
                completedReuseSources += 1;
                completedReuseChunks += rows.length;
                spin.updateChunks(
                  completedReuseChunks,
                  Math.max(totalReuseChunks, 1),
                  `parallel reuse ${completedReuseSources}/${reuseTasks.length} src`,
                );
                return rows;
              },
              (pipelinesDone, pipelinesTotal) => {
                spin.update(
                  `Parallel reuse pipelines ${pipelinesDone}/${pipelinesTotal} sources done · ${completedReuseChunks}/${Math.max(totalReuseChunks, 1)} chunks · ×${reusePipelineConc} workers`,
                );
              },
            );

      if (!didBulkSqlClone) {
        for (const rows of reuseRowBatches) {
          searchRows.push(...rows);
        }
        reusedChunks = reuseRowBatches.reduce((sum, rows) => sum + rows.length, 0);
        indexedChunks = reusedChunks;
      }

      if (!didBulkSqlClone && reuseTasks.length > 0) {
        logIngestStep('parallel reuse phase complete', {
          reuseSources: reuseTasks.length,
          reusedChunks,
        });
        spin.pause();
        ui.sourceProgress(reuseTasks.length, sourceSnapshot.length, reusedChunks);
        spin.resume('Processing sources…');
      }

      newlyEmbeddedSources = embedTasks.length;

      for (let ei = 0; ei < embedTasks.length; ei += 1) {
        const { source, sourceDoc, ordinal } = embedTasks[ei]!;
        const shortSourceId =
          source.sourceId.length > 48 ? `${source.sourceId.slice(0, 45)}…` : source.sourceId;
        spin.update(`[${ordinal}/${sourceSnapshot.length}] ${shortSourceId}`);

        const chunkDrafts = chunkRagSource(source);
        logIngestStep('embedding source chunks', {
          sourceId: source.sourceId,
          chunkCount: chunkDrafts.length,
        });
        spin.update(
          `[${ordinal}/${sourceSnapshot.length}] ${shortSourceId} · computing embeddings…`,
        );
        const tEmbed = Date.now();
        const embeddings = await embedTexts(chunkDrafts.map((chunk) => chunk.content));
        spin.pause();
        ui.embeddingSource(
          ordinal,
          sourceSnapshot.length,
          source.sourceId,
          chunkDrafts.length,
          Date.now() - tEmbed,
        );
        spin.resume('Writing Payload chunk rows…');

        const draftEmbeddingPairs = chunkDrafts.map((draft, index) => ({
          draft,
          embedding: embeddings[index]!,
        }));
        const embedBatches = chunkArray(draftEmbeddingPairs, PAYLOAD_CHUNK_WRITE_CONCURRENCY);
        let writtenInSource = 0;
        for (const batch of embedBatches) {
          spin.updateChunks(
            writtenInSource + batch.length,
            chunkDrafts.length,
            `new src ${ordinal}/${sourceSnapshot.length}`,
          );
          const created = await Promise.all(
            batch.map(({ draft, embedding }) =>
              payload.create({
                collection: 'rag-chunks',
                data: {
                  vectorKey: `${runPartitionKey}:${source.sourceId}:${draft.chunkIndex}`,
                  source: sourceDoc.id,
                  run: runDocumentId,
                  sourceExternalId: source.sourceId,
                  sourceTitle: source.title,
                  sourceKind: source.kind,
                  sourceScope: source.scope,
                  sourceSlug: source.slug,
                  sourcePath: source.sourcePath,
                  publicUrl: source.publicUrl,
                  chunkIndex: draft.chunkIndex,
                  heading: draft.heading,
                  anchor: draft.anchor,
                  content: draft.content,
                  tokenCount: draft.tokenCount,
                  contentChecksum: draft.contentChecksum,
                  embeddingModel: getEmbeddingModel(),
                  embeddingDimensions: getEmbeddingDimensions(),
                  embedding,
                  isActive: false,
                },
              }),
            ),
          );

          for (let bi = 0; bi < created.length; bi += 1) {
            const createdChunk = created[bi]!;
            const chunkDraft = batch[bi]!.draft;
            const embedding = batch[bi]!.embedding;
            searchRows.push({
              chunkId: normalizeNumber(createdChunk.id),
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
          writtenInSource += batch.length;
        }

        const processedSourcesTotal = reuseTasks.length + ei + 1;
        if (
          processedSourcesTotal % 10 === 0 ||
          ei === embedTasks.length - 1
        ) {
          logIngestStep('source progress', {
            processedSources: processedSourcesTotal,
            totalSources: sourceSnapshot.length,
            indexedChunks,
            reusedChunks,
            newlyEmbeddedSources: ei + 1,
          });
          spin.pause();
          ui.sourceProgress(processedSourcesTotal, sourceSnapshot.length, reusedChunks);
          spin.resume('Processing sources…');
        }
      }
    } finally {
      spin.stop();
    }

    logIngestStep('writing sidecar search rows', {
      rowCount: searchRows.length,
      runId: runPartitionKey,
    });
    const tVec = Date.now();
    const vectorStore = getRagVectorStore();
    ui.step(
      'Write vector index + lexical rows',
      vectorStore === 'postgres'
        ? 'Postgres rag_chunk_search + pgvector (same DATABASE_URL as Payload, e.g. Supabase)'
        : `SQLite sidecar · ${getRagDatabaseFilePath()}`,
    );
    const vecSpin = createVectorIndexSpinner(options.verboseCli === true, vectorStore);
    vecSpin.start(searchRows.length);
    try {
      await replaceRunChunks(runPartitionKey, searchRows, {
        onProgress: (written, total) => vecSpin.update(written, total),
      });
    } finally {
      vecSpin.stop();
    }
    logIngestStep('sidecar search rows written');
    ui.vectorIndex(searchRows.length, Date.now() - tVec);

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
        indexedSourceCount: sourceSnapshot.length,
        indexedChunkCount: indexedChunks,
        reusedChunkCount: reusedChunks,
        deletedSourceCount: deletedSources,
      },
    });

    const tCommit = Date.now();
    ui.step('Activate run & prune old vector rows');
    await setActiveRunId(runPartitionKey);
    await pruneInactiveRuns(runPartitionKey);
    ui.commit(runPartitionKey, Date.now() - tCommit);
    ui.memory('after commit');
    const indexedSources = sourceSnapshot.length;
    logIngestStep('ingest run committed', {
      runId: runPartitionKey,
      indexedSources,
      indexedChunks,
      reusedChunks,
      deletedSources,
    });

    const summary: RagIngestSummary = {
      runId: runPartitionKey,
      indexedSources,
      indexedChunks,
      reusedChunks,
      deletedSources,
    };
    ui.success(summary, Date.now() - ingestStartedAt, wallStartedAt);
    return summary;
  } catch (error) {
    ui.failure(error);
    logIngestStep('ingest run failed', serializeError(error));
    await clearRun(runPartitionKey);
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
