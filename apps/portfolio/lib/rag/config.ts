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

export function getEmbeddingProvider(): RagEmbeddingProvider {
  const value = process.env.RAG_EMBEDDING_PROVIDER?.trim().toLowerCase();
  return value === 'local' ? 'local' : 'openai';
}

function isPortfolioAppRoot(candidate: string): boolean {
  return (
    fs.existsSync(path.join(candidate, 'app')) &&
    fs.existsSync(path.join(candidate, 'content')) &&
    fs.existsSync(path.join(candidate, 'package.json'))
  );
}

export function getPortfolioAppRoot(): string {
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
