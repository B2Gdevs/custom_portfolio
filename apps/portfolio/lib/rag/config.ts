import fs from 'node:fs';
import path from 'node:path';
export { getPayloadDatabaseFilePath } from '@/lib/payload/runtime-env';

const DEFAULT_RAG_DB_FILE = 'portfolio-rag.db';
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
/** Xenova `all-MiniLM-L6-v2` — 384-dim, CPU-friendly; see `apps/portfolio/models/README.md`. */
const DEFAULT_LOCAL_EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const DEFAULT_LOCAL_EMBEDDING_DIMENSIONS = 384;

export type RagEmbeddingProvider = 'openai' | 'local';

/** Default: local Xenova MiniLM (384-dim); set `RAG_EMBEDDING_PROVIDER=openai` for OpenAI embeddings. */
export function getEmbeddingProvider(): RagEmbeddingProvider {
  const value = process.env.RAG_EMBEDDING_PROVIDER?.trim().toLowerCase();
  if (value === 'openai') {
    return 'openai';
  }
  return 'local';
}

export type RagVectorStore = 'sqlite' | 'postgres';

/**
 * Where semantic index rows live: Postgres + pgvector (same Supabase DB as Payload) when
 * `PAYLOAD_DB_PROVIDER=postgres` and `DATABASE_URL` is set, unless overridden.
 * Set `RAG_VECTOR_STORE=sqlite` to force the local `portfolio-rag.db` sidecar.
 */
export function getRagVectorStore(): RagVectorStore {
  const explicit = process.env.RAG_VECTOR_STORE?.trim().toLowerCase();
  if (explicit === 'sqlite') {
    return 'sqlite';
  }
  if (explicit === 'postgres') {
    return 'postgres';
  }
  const payload = process.env.PAYLOAD_DB_PROVIDER?.trim().toLowerCase();
  if (payload === 'postgres' && process.env.DATABASE_URL?.trim()) {
    return 'postgres';
  }
  return 'sqlite';
}

function isPortfolioAppRoot(candidate: string): boolean {
  return (
    fs.existsSync(path.join(candidate, 'app')) &&
    fs.existsSync(path.join(candidate, 'content')) &&
    fs.existsSync(path.join(candidate, 'package.json'))
  );
}

export function getPortfolioAppRoot(): string {
  const fromEnv = process.env.PORTFOLIO_APP_ROOT?.trim();
  if (fromEnv && isPortfolioAppRoot(fromEnv)) {
    return path.resolve(fromEnv);
  }

  const cwd = process.cwd();
  if (isPortfolioAppRoot(cwd)) {
    return cwd;
  }

  const nestedAppRoot = path.join(cwd, 'apps', 'portfolio');
  if (isPortfolioAppRoot(nestedAppRoot)) {
    return nestedAppRoot;
  }

  return cwd;
}

function resolveFilePath(input: string): string {
  return path.isAbsolute(input) ? input : path.resolve(getPortfolioAppRoot(), input);
}

export function getRagDatabaseFilePath(): string {
  const explicitPath = process.env.RAG_SQLITE_PATH?.trim();
  if (explicitPath) {
    return resolveFilePath(explicitPath);
  }

  return path.join(getPortfolioAppRoot(), DEFAULT_RAG_DB_FILE);
}

export function getEmbeddingModel(): string {
  if (getEmbeddingProvider() === 'local') {
    return process.env.RAG_LOCAL_EMBEDDING_MODEL?.trim() || DEFAULT_LOCAL_EMBEDDING_MODEL;
  }
  return process.env.OPENAI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;
}

/**
 * Parallel `rag-sources` upserts during ingest (1–32). Higher = fewer round-trip waits when many sources.
 */
export function getRagIngestSourceUpsertConcurrency(): number {
  const parsed = Number(process.env.RAG_INGEST_SOURCE_UPSERT_CONCURRENCY?.trim());
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 32) {
    return Math.floor(parsed);
  }
  return 8;
}

/**
 * Parallel checksum-reuse pipelines (1–16). Each pipeline still batches chunk `payload.create` calls.
 * Embedding paths always run one source at a time (CPU / API limits).
 */
export function getRagIngestReuseSourceConcurrency(): number {
  const parsed = Number(process.env.RAG_INGEST_REUSE_SOURCE_CONCURRENCY?.trim());
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 16) {
    return Math.floor(parsed);
  }
  return 4;
}

/** When false, skip SQL bulk clone of `rag_chunks` and always use Payload `create` for reuse (slower). */
export function isRagIngestBulkChunkCloneEnabled(): boolean {
  return readBooleanEnv('RAG_INGEST_BULK_CHUNK_CLONE', true);
}

function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) {
    return defaultValue;
  }
  if (['1', 'true', 'yes', 'on'].includes(value)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(value)) {
    return false;
  }
  return defaultValue;
}

export function getEmbeddingDimensions(): number {
  if (getEmbeddingProvider() === 'local') {
    const parsed = Number(process.env.RAG_LOCAL_EMBEDDING_DIMENSIONS?.trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    return DEFAULT_LOCAL_EMBEDDING_DIMENSIONS;
  }

  const parsed = Number(process.env.OPENAI_EMBEDDING_DIMENSIONS?.trim());
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_EMBEDDING_DIMENSIONS;
}

export function getBasicAuthCredentials():
  | { username: string; password: string }
  | null {
  const username = process.env.ADMIN_BASIC_AUTH_USER?.trim();
  const password = process.env.ADMIN_BASIC_AUTH_PASSWORD?.trim();

  if (!username || !password) {
    return null;
  }

  return { username, password };
}
