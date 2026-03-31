import {
  getPayloadDatabaseAdapter,
  getPayloadDatabaseFilePath,
  getPayloadDatabaseProvider,
  getPayloadDatabaseUrl,
  getPayloadPlugins,
  getPayloadS3StorageOptions,
  getPayloadStorageProvider,
  isPayloadUsingPostgres,
  isPayloadUsingS3Storage,
} from '@/lib/payload/runtime-config';

describe('payload runtime config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.PAYLOAD_DB_PROVIDER;
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_PATH;
    delete process.env.DATABASE_FILE;
    delete process.env.PAYLOAD_SQLITE_PATH;
    delete process.env.PAYLOAD_POSTGRES_PUSH;
    delete process.env.PAYLOAD_STORAGE_PROVIDER;
    delete process.env.PAYLOAD_S3_BUCKET;
    delete process.env.PAYLOAD_S3_ENDPOINT;
    delete process.env.PAYLOAD_S3_REGION;
    delete process.env.PAYLOAD_S3_ACCESS_KEY_ID;
    delete process.env.PAYLOAD_S3_SECRET_ACCESS_KEY;
    delete process.env.PAYLOAD_S3_FORCE_PATH_STYLE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('defaults to local sqlite and local storage', () => {
    expect(getPayloadDatabaseProvider()).toBe('sqlite');
    expect(getPayloadStorageProvider()).toBe('local');
    expect(isPayloadUsingPostgres()).toBe(false);
    expect(isPayloadUsingS3Storage()).toBe(false);
    expect(getPayloadDatabaseFilePath().replace(/\\/g, '/')).toContain('/apps/portfolio/portfolio.db');
    expect(getPayloadDatabaseUrl()).toContain('file:');
    expect(getPayloadS3StorageOptions()).toBeNull();
    expect(getPayloadPlugins()).toEqual([]);
  });

  it('reads postgres mode from DATABASE_URL', () => {
    process.env.PAYLOAD_DB_PROVIDER = 'postgres';
    process.env.DATABASE_URL = 'postgres://postgres:secret@example.supabase.co:6543/postgres';

    expect(getPayloadDatabaseProvider()).toBe('postgres');
    expect(isPayloadUsingPostgres()).toBe(true);
    expect(getPayloadDatabaseUrl()).toBe(
      'postgres://postgres:secret@example.supabase.co:6543/postgres',
    );

    const adapter = getPayloadDatabaseAdapter();
    expect(adapter).toBeTruthy();
  });

  it('infers postgres mode from DATABASE_URL when provider is unset', () => {
    process.env.DATABASE_URL = 'postgresql://postgres:secret@example.supabase.co:5432/postgres';

    expect(getPayloadDatabaseProvider()).toBe('postgres');
    expect(isPayloadUsingPostgres()).toBe(true);
    expect(getPayloadDatabaseUrl()).toBe(
      'postgresql://postgres:secret@example.supabase.co:5432/postgres',
    );

    const adapter = getPayloadDatabaseAdapter();
    expect(adapter).toBeTruthy();
  });

  it('builds S3 storage options for Supabase-compatible storage', () => {
    process.env.PAYLOAD_STORAGE_PROVIDER = 's3';
    process.env.PAYLOAD_S3_BUCKET = 'reader-library';
    process.env.PAYLOAD_S3_ENDPOINT = 'https://project-ref.storage.supabase.co/storage/v1/s3';
    process.env.PAYLOAD_S3_REGION = 'us-east-1';
    process.env.PAYLOAD_S3_ACCESS_KEY_ID = 'key';
    process.env.PAYLOAD_S3_SECRET_ACCESS_KEY = 'secret';
    process.env.PAYLOAD_S3_FORCE_PATH_STYLE = 'true';

    expect(getPayloadStorageProvider()).toBe('s3');
    expect(isPayloadUsingS3Storage()).toBe(true);
    expect(getPayloadPlugins()).toHaveLength(1);
    expect(getPayloadS3StorageOptions()).toMatchObject({
      bucket: 'reader-library',
      collections: {
        'listen-media-assets': {
          signedDownloads: false,
        },
        'published-book-artifacts': {
          signedDownloads: false,
        },
        'reader-library-assets': {
          signedDownloads: true,
        },
        'site-media-assets': {
          signedDownloads: false,
        },
      },
      config: {
        endpoint: 'https://project-ref.storage.supabase.co/storage/v1/s3',
        forcePathStyle: true,
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'key',
          secretAccessKey: 'secret',
        },
      },
    });
  });
});
