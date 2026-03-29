import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_PAYLOAD_DB_FILE = 'portfolio.db';
const DEFAULT_RAG_DB_FILE = 'portfolio-rag.db';
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
const DEFAULT_EMBEDDING_DIMENSIONS = 1536;

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

export function getPayloadDatabaseFilePath(): string {
  const explicitPath =
    process.env.DATABASE_PATH?.trim() ||
    process.env.DATABASE_FILE?.trim() ||
    process.env.PAYLOAD_SQLITE_PATH?.trim();

  if (explicitPath) {
    return resolveFilePath(explicitPath);
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl?.startsWith('file:')) {
    return resolveFilePath(databaseUrl.slice('file:'.length));
  }

  return path.join(getPortfolioAppRoot(), DEFAULT_PAYLOAD_DB_FILE);
}

export function getPayloadDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    return databaseUrl;
  }

  return `file:${getPayloadDatabaseFilePath().replace(/\\/g, '/')}`;
}

export function getRagDatabaseFilePath(): string {
  const explicitPath = process.env.RAG_SQLITE_PATH?.trim();
  if (explicitPath) {
    return resolveFilePath(explicitPath);
  }

  return path.join(getPortfolioAppRoot(), DEFAULT_RAG_DB_FILE);
}

export function getEmbeddingModel(): string {
  return process.env.OPENAI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;
}

export function getEmbeddingDimensions(): number {
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
