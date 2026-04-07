/**
 * npm-style terminal output for `pnpm rag:ingest` (script entry only).
 */
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import {
  getEmbeddingDimensions,
  getEmbeddingModel,
  getEmbeddingProvider,
  getPayloadDatabaseFilePath,
  getPortfolioAppRoot,
  getRagDatabaseFilePath,
  getRagIngestReuseSourceConcurrency,
  getRagIngestSourceUpsertConcurrency,
  getRagVectorStore,
  isRagIngestBulkChunkCloneEnabled,
  type RagVectorStore,
} from './config';
import ora from 'ora';
import type { RagIngestSummary } from './types';
import { unknownErrorMessage } from '@/lib/unknown-error';

export interface RagIngestCli {
  banner(): void;
  configSnapshot(): void;
  step(label: string, detail?: string): void;
  stepDone(label: string, ms?: number): void;
  warn(message: string): void;
  sourceProgress(processed: number, total: number, reusedSoFar: number): void;
  embeddingSource(
    index: number,
    total: number,
    sourceId: string,
    chunkCount: number,
    embedMs: number,
  ): void;
  /** Preflight: how many sources can skip embedding; parallel ingest knobs. */
  ingestParallelPlan(reuseEligible: number, totalSources: number): void;
  vectorIndex(rows: number, ms: number): void;
  commit(runId: string, ms: number): void;
  success(summary: RagIngestSummary, totalMs: number, startedAt: number): void;
  failure(error: unknown): void;
  memory(note: string): void;
}

function shouldUseColor(): boolean {
  return Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
}

function c(enabled: boolean, fn: (s: string) => string, s: string): string {
  return enabled ? fn(s) : s;
}

function redactDatabaseUrl(raw: string | undefined): string {
  if (!raw?.trim()) {
    return '(not set)';
  }
  try {
    const u = new URL(raw);
    if (u.password) {
      u.password = '***';
    }
    return u.toString();
  } catch {
    return '(unparseable URL)';
  }
}

function formatBytes(n: number): string {
  if (n < 1024) {
    return `${n} B`;
  }
  if (n < 1024 * 1024) {
    return `${(n / 1024).toFixed(1)} KiB`;
  }
  return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
}

function formatMs(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function rssLine(): string {
  const { rss, heapUsed, heapTotal } = process.memoryUsage();
  return `rss ${formatBytes(rss)} · heap ${formatBytes(heapUsed)} / ${formatBytes(heapTotal)}`;
}

export function reportLocalModelLoading(): void {
  if (process.env.RAG_INGEST_CLI !== '1') {
    return;
  }
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const yel = (s: string) => c(color, pc.yellow, s);
  console.log(`  ${dim('›')} ${yel('transformers')} loading feature-extraction pipeline…`);
  console.log(`  ${dim('  cache')} ${getPortfolioAppRoot()}${path.sep}models${path.sep}.transformers-cache`);
}

export function reportLocalModelReady(elapsedMs: number, modelId: string): void {
  if (process.env.RAG_INGEST_CLI !== '1') {
    return;
  }
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const grn = (s: string) => c(color, pc.green, s);
  console.log(`  ${dim('›')} ${grn('✓')} model ready ${dim(`(${modelId})`)} · ${formatMs(elapsedMs)}`);
  console.log(`  ${dim('  memory')} ${rssLine()}`);
}

export function reportLocalModelError(error: unknown): void {
  if (process.env.RAG_INGEST_CLI !== '1') {
    return;
  }
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const red = (s: string) => c(color, pc.red, s);
  console.log(`  ${dim('›')} ${red('✖')} ${unknownErrorMessage(error)}`);
}

function readAppVersion(): string {
  try {
    const pkgPath = path.join(getPortfolioAppRoot(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function createRagIngestCli(enabled: boolean): RagIngestCli {
  if (!enabled) {
    const noop = (): void => {};
    return {
      banner: noop,
      configSnapshot: noop,
      step: noop,
      stepDone: noop,
      warn: noop,
      sourceProgress: noop,
      embeddingSource: noop,
      ingestParallelPlan: noop,
      vectorIndex: noop,
      commit: noop,
      success: noop,
      failure: noop,
      memory: noop,
    };
  }

  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const bold = (s: string) => c(color, pc.bold, s);
  const grn = (s: string) => c(color, pc.green, s);
  const red = (s: string) => c(color, pc.red, s);
  const cyn = (s: string) => c(color, pc.cyan, s);
  const yel = (s: string) => c(color, pc.yellow, s);

  let stepIndex = 0;

  return {
    banner() {
      const ver = readAppVersion();
      const root = getPortfolioAppRoot();
      console.log('');
      console.log(bold(`@portfolio/app@${ver}`) + dim('  rag:ingest'));
      console.log(dim(`  ${root}`));
      console.log(dim(`  ${rssLine()}`));
      console.log('');
    },

    configSnapshot() {
      const provider = getEmbeddingProvider();
      const model = getEmbeddingModel();
      const dims = getEmbeddingDimensions();
      const store = getRagVectorStore();
      const sidecar = getRagDatabaseFilePath();
      const dbUrl = process.env.DATABASE_URL;

      console.log(dim('── configuration ' + '─'.repeat(44)));
      console.log(`  ${dim('embedding')} ${cyn(provider)} · ${model} · ${String(dims)}-dim`);
      if (store === 'postgres') {
        console.log(`  ${dim('vectors')}   ${grn('PostgreSQL')} ${dim('pgvector')} · ${dim(redactDatabaseUrl(dbUrl))}`);
      } else {
        console.log(`  ${dim('vectors')}   ${grn('SQLite')} ${dim('sqlite-vec + FTS')} · ${sidecar}`);
      }
      console.log(`  ${dim('payload')}   ${dim(getPayloadDbLabel())}`);
      console.log(
        dim(
          isRagIngestBulkChunkCloneEnabled()
            ? '  note     full checksum reuse uses one SQL INSERT…SELECT into rag_chunks (Payload SQLite + Postgres); partial reuse still uses Payload API + parallel pipelines.'
            : '  note     RAG_INGEST_BULK_CHUNK_CLONE=0 — checksum reuse uses only Payload rag-chunks creates (parallel).',
        ),
      );
      console.log(
        dim(
          `  ingest   upsert rag-sources ×${getRagIngestSourceUpsertConcurrency()} · reuse pipelines ×${getRagIngestReuseSourceConcurrency()} (set RAG_INGEST_*_CONCURRENCY to tune)`,
        ),
      );
      console.log(dim('──'.repeat(32)));
      console.log('');
    },

    step(label, detail) {
      stepIndex += 1;
      const tail = detail ? dim(` ${detail}`) : '';
      console.log(`${dim(`[${stepIndex}]`)} ${label}${tail}`);
    },

    stepDone(label, ms) {
      const timing = ms !== undefined ? dim(` · ${formatMs(ms)}`) : '';
      console.log(`  ${grn('✓')} ${label}${timing}`);
    },

    warn(message) {
      console.log(`  ${yel('!')} ${message}`);
    },

    sourceProgress(processed, total, reusedSoFar) {
      console.log(
        dim(`  sources ${processed}/${total}`) + dim(` · reused checksums ${reusedSoFar}`),
      );
    },

    embeddingSource(index, total, sourceId, chunkCount, embedMs) {
      const short = sourceId.length > 56 ? `${sourceId.slice(0, 53)}…` : sourceId;
      console.log(
        `  ${cyn('embed')} [${index}/${total}] ${dim(String(chunkCount) + ' chunks')} ${formatMs(embedMs)}`,
      );
      console.log(dim(`        ${short}`));
    },

    ingestParallelPlan(reuseEligible, totalSources) {
      const embed = totalSources - reuseEligible;
      console.log(
        dim(
          `  plan · checksum reuse ${reuseEligible}/${totalSources} sources · ${embed} will embed (sequential)`,
        ),
      );
    },

    vectorIndex(rows, ms) {
      const approxBytes = rows * getEmbeddingDimensions() * 4;
      console.log(
        `  ${grn('✓')} vector index · ${String(rows)} rows · ~${formatBytes(approxBytes)} floats ${dim(`· ${formatMs(ms)}`)}`,
      );
    },

    commit(runId, ms) {
      console.log(`  ${grn('✓')} active run ${dim(runId)} ${dim(`· ${formatMs(ms)}`)}`);
    },

    memory(note) {
      console.log(dim(`  memory (${note}) ${rssLine()}`));
    },

    success(summary, totalMs, startedAt) {
      const wall = Date.now() - startedAt;
      console.log('');
      console.log(bold(grn('added')) + dim(` ${summary.indexedChunks} chunks, ${summary.indexedSources} sources`));
      if (summary.reusedChunks > 0) {
        console.log(dim(`  reused ${summary.reusedChunks} chunks (checksum match)`));
      }
      console.log(
        dim(
          `  run ${summary.runId} · ingest ${formatMs(totalMs)} · wall ${formatMs(wall)} · ${rssLine()}`,
        ),
      );
      console.log('');
    },

    failure(error) {
      console.log('');
      const msg = unknownErrorMessage(error);
      console.log(`  ${red('✖')} ${msg}`);
      if (error instanceof Error && error.stack) {
        console.log(dim(error.stack.split('\n').slice(1, 8).join('\n')));
      }
      console.log('');
    },
  };
}

function getPayloadDbLabel(): string {
  const provider = process.env.PAYLOAD_DB_PROVIDER?.trim().toLowerCase() ?? 'sqlite';
  if (provider === 'postgres') {
    return `postgres · ${redactDatabaseUrl(process.env.DATABASE_URL)}`;
  }
  return `sqlite · ${getPayloadDatabaseFilePath()}`;
}

/**
 * Printed after `rag:ingest` tears down DB pools; then the entry script calls `process.exit(0)`.
 * Explains that a hung prompt is safe to Ctrl+C because work is already committed.
 */
export function printRagIngestCliExitBanner(outcome: 'success' | 'failure'): void {
  if (process.env.RAG_INGEST_CLI !== '1') {
    return;
  }
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const grn = (s: string) => c(color, pc.green, s);
  const red = (s: string) => c(color, pc.red, s);
  console.log('');
  console.log(dim('──'.repeat(32)));
  if (outcome === 'success') {
    console.log(`${grn('done')} ${dim('· ingest committed · exiting Node')}`);
    console.log(
      dim(
        'If the shell prompt does not return, press Ctrl+C once (Windows / Git Bash). Your data is already saved.',
      ),
    );
  } else {
    console.log(`${red('stopped')} ${dim('· ingest failed · exiting Node')}`);
    console.log(dim('If this process hangs, press Ctrl+C once to return to the prompt.'));
  }
  console.log(dim('──'.repeat(32)));
  console.log('');
}

/** Spinner for long Payload chunk writes (reuse + fresh). No-op when CLI disabled or not a TTY. */
export type ChunkWriteSpinner = {
  update: (text: string) => void;
  updateChunks: (writtenInSource: number, chunksInSource: number, hint?: string) => void;
  pause: () => void;
  resume: (text: string) => void;
  stop: () => void;
};

export function createChunkWriteSpinner(enabled: boolean): ChunkWriteSpinner {
  if (!enabled || !process.stdout.isTTY || process.env.CI === '1') {
    return {
      update: () => {},
      updateChunks: () => {},
      pause: () => {},
      resume: () => {},
      stop: () => {},
    };
  }

  let spinner = ora({
    text: 'Processing sources…',
    color: 'cyan',
    spinner: 'dots',
  }).start();

  return {
    update(text: string) {
      spinner.text = text;
    },
    updateChunks(writtenInSource: number, chunksInSource: number, hint = '') {
      const tail = hint ? ` · ${hint}` : '';
      spinner.text = `Payload chunk rows ${writtenInSource}/${chunksInSource}${tail}`;
    },
    pause() {
      spinner.stop();
    },
    resume(text: string) {
      spinner = ora({ text, color: 'cyan', spinner: 'dots' }).start();
    },
    stop() {
      spinner.stop();
    },
  };
}

/** Spinner while writing the semantic index (Postgres pgvector or SQLite). No-op when CLI off / not TTY / CI. */
export type VectorIndexSpinner = {
  start(total: number): void;
  update(written: number, total: number): void;
  stop(): void;
};

export function createVectorIndexSpinner(enabled: boolean, store: RagVectorStore): VectorIndexSpinner {
  if (!enabled || !process.stdout.isTTY || process.env.CI === '1') {
    return {
      start: () => {},
      update: () => {},
      stop: () => {},
    };
  }

  const label =
    store === 'postgres'
      ? 'Postgres rag_chunk_search (pgvector · DATABASE_URL)'
      : `SQLite ${getRagDatabaseFilePath()}`;

  let spinner: ReturnType<typeof ora> | null = null;

  return {
    start(total) {
      spinner = ora({
        text: `${label} · 0/${total} rows`,
        color: 'cyan',
        spinner: 'dots',
      }).start();
    },
    update(written, total) {
      if (spinner) {
        spinner.text = `${label} · ${written}/${total} rows`;
      }
    },
    stop() {
      spinner?.stop();
      spinner = null;
    },
  };
}
