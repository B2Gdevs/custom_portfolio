import path from 'node:path';
import { resolvePortfolioAppPath } from './app-root';

const DEFAULT_PAYLOAD_DB_FILE = 'portfolio.db';

export type PayloadDatabaseProvider = 'postgres' | 'sqlite';
export type PayloadStorageProvider = 'local' | 's3';

function resolveFilePath(input: string): string {
  return path.isAbsolute(input) ? input : resolvePortfolioAppPath(input);
}

export function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for the configured Payload runtime.`);
  }

  return value;
}

export function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

export function readBooleanEnv(name: string, defaultValue: boolean) {
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

export function getPayloadDatabaseProvider(): PayloadDatabaseProvider {
  const configuredProvider = readOptionalEnv('PAYLOAD_DB_PROVIDER');
  if (configuredProvider === 'postgres') {
    return 'postgres';
  }

  const databaseUrl = readOptionalEnv('DATABASE_URL');
  if (databaseUrl && /^(postgres|postgresql):/i.test(databaseUrl)) {
    return 'postgres';
  }

  return 'sqlite';
}

export function getPayloadStorageProvider(): PayloadStorageProvider {
  return readOptionalEnv('PAYLOAD_STORAGE_PROVIDER') === 's3' ? 's3' : 'local';
}

export function isPayloadUsingPostgres() {
  return getPayloadDatabaseProvider() === 'postgres';
}

export function isPayloadUsingS3Storage() {
  return getPayloadStorageProvider() === 's3';
}

export function getPayloadDatabaseFilePath(): string {
  const explicitPath =
    readOptionalEnv('DATABASE_PATH') ||
    readOptionalEnv('DATABASE_FILE') ||
    readOptionalEnv('PAYLOAD_SQLITE_PATH');

  if (explicitPath) {
    return resolveFilePath(explicitPath);
  }

  const databaseUrl = readOptionalEnv('DATABASE_URL');
  if (databaseUrl?.startsWith('file:')) {
    return resolveFilePath(databaseUrl.slice('file:'.length));
  }

  return resolvePortfolioAppPath(DEFAULT_PAYLOAD_DB_FILE);
}

export function getPayloadDatabaseUrl(): string {
  if (isPayloadUsingPostgres()) {
    return readRequiredEnv('DATABASE_URL');
  }

  const databaseUrl = readOptionalEnv('DATABASE_URL');
  if (databaseUrl) {
    return databaseUrl;
  }

  return `file:${getPayloadDatabaseFilePath().replace(/\\/g, '/')}`;
}
