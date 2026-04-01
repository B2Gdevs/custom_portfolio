import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('provider bootstrap helpers', () => {
  let tempRoot: string;

  beforeEach(() => {
    vi.resetModules();
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-provider-bootstrap-'));
  });

  afterEach(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('reports hosted readiness and masks the database URL', async () => {
    vi.doMock('@/lib/payload/app-root', () => ({
      resolvePortfolioAppRoot: () => tempRoot,
      resolvePortfolioAppPath: (...segments: string[]) => path.join(tempRoot, ...segments),
    }));

    vi.doMock('@/lib/payload/runtime-env', () => ({
      getPayloadDatabaseFilePath: () => path.join(tempRoot, 'portfolio.db'),
      getPayloadDatabaseProvider: () => 'postgres',
      getPayloadDatabaseUrl: () =>
        'postgresql://postgres.example:super-secret@db.example.com:5432/postgres',
      getPayloadStorageProvider: () => 's3',
      readOptionalEnv: (name: string) =>
        ({
          DATABASE_URL: 'postgresql://postgres.example:super-secret@db.example.com:5432/postgres',
          PAYLOAD_S3_ENDPOINT: 'https://storage.example.com',
          PAYLOAD_S3_BUCKET: 'reader-library',
          PAYLOAD_S3_ACCESS_KEY_ID: 'key',
          PAYLOAD_S3_SECRET_ACCESS_KEY: 'secret',
        })[name] ?? null,
      readRequiredEnv: (name: string) =>
        ({
          DATABASE_URL: 'postgresql://postgres.example:super-secret@db.example.com:5432/postgres',
          PAYLOAD_S3_ENDPOINT: 'https://storage.example.com',
          PAYLOAD_S3_BUCKET: 'reader-library',
          PAYLOAD_S3_ACCESS_KEY_ID: 'key',
          PAYLOAD_S3_SECRET_ACCESS_KEY: 'secret',
        })[name],
    }));

    const { getProviderBootstrapStatus } = await import('@/lib/payload/provider-bootstrap');
    const status = getProviderBootstrapStatus();

    expect(status.databaseProvider).toBe('postgres');
    expect(status.storageProvider).toBe('s3');
    expect(status.hostedBootstrapReady).toBe(true);
    expect(status.databaseUrl).toContain('***');
    expect(status.databaseUrl).not.toContain('super-secret');
  });

  it('exports and re-imports a local sqlite snapshot with upload directories', async () => {
    const dbPath = path.join(tempRoot, 'portfolio.db');
    const siteDownloadsDir = path.join(tempRoot, 'media', 'site-download-assets');
    fs.mkdirSync(siteDownloadsDir, { recursive: true });
    fs.writeFileSync(dbPath, 'db-version-1');
    fs.writeFileSync(path.join(siteDownloadsDir, 'asset.txt'), 'asset-version-1');

    vi.doMock('@/lib/payload/app-root', () => ({
      resolvePortfolioAppRoot: () => tempRoot,
      resolvePortfolioAppPath: (...segments: string[]) => path.join(tempRoot, ...segments),
    }));

    vi.doMock('@/lib/payload/runtime-env', () => ({
      getPayloadDatabaseFilePath: () => dbPath,
      getPayloadDatabaseProvider: () => 'sqlite',
      getPayloadDatabaseUrl: () => `file:${dbPath.replace(/\\/g, '/')}`,
      getPayloadStorageProvider: () => 'local',
      readOptionalEnv: () => null,
      readRequiredEnv: (name: string) => {
        throw new Error(`${name} not expected`);
      },
    }));

    const {
      exportLocalProviderSnapshot,
      importLocalProviderSnapshot,
    } = await import('@/lib/payload/provider-bootstrap');

    const outputDir = path.join(tempRoot, 'snapshot');
    const exported = exportLocalProviderSnapshot(outputDir);

    expect(exported.copiedDatabase).toBe(true);
    expect(exported.copiedUploadDirectories).toContain('media/site-download-assets');
    expect(fs.existsSync(path.join(outputDir, 'provider-snapshot.json'))).toBe(true);

    fs.writeFileSync(dbPath, 'db-version-2');
    fs.writeFileSync(path.join(siteDownloadsDir, 'asset.txt'), 'asset-version-2');

    const imported = importLocalProviderSnapshot(outputDir);

    expect(imported.copiedDatabase).toBe(true);
    expect(imported.restoredUploadDirectories).toContain('media/site-download-assets');
    expect(fs.readFileSync(dbPath, 'utf8')).toBe('db-version-1');
    expect(fs.readFileSync(path.join(siteDownloadsDir, 'asset.txt'), 'utf8')).toBe('asset-version-1');
  });
});
