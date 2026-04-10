import type { S3StorageOptions } from '@payloadcms/storage-s3';
import type { Plugin } from 'payload';
import {
  getPayloadDatabaseUrl,
  isPayloadUsingPostgres,
  isPayloadUsingS3Storage,
  readBooleanEnv,
  readOptionalEnv,
  readRequiredEnv,
} from './runtime-env';

const DEFAULT_S3_REGION = 'us-east-1';
const DEFAULT_S3_FORCE_PATH_STYLE = true;
const requireRuntime = eval('require') as NodeRequire;
const PAYLOAD_DB_POSTGRES = ['@payloadcms', 'db-postgres'].join('/');
const PAYLOAD_DB_SQLITE = ['@payloadcms', 'db-sqlite'].join('/');
const PAYLOAD_STORAGE_S3 = ['@payloadcms', 'storage-s3'].join('/');

export {
  getPayloadDatabaseFilePath,
  getPayloadDatabaseProvider,
  getPayloadDatabaseUrl,
  getPayloadStorageProvider,
  isPayloadUsingPostgres,
  isPayloadUsingS3Storage,
  type PayloadDatabaseProvider,
  type PayloadStorageProvider,
} from './runtime-env';

export function getPayloadDatabaseAdapter() {
  if (isPayloadUsingPostgres()) {
    const { postgresAdapter } = requireRuntime(
      PAYLOAD_DB_POSTGRES,
    ) as typeof import('@payloadcms/db-postgres');

    return postgresAdapter({
      pool: {
        connectionString: getPayloadDatabaseUrl(),
      },
      push: readBooleanEnv('PAYLOAD_POSTGRES_PUSH', true),
    });
  }

  const { sqliteAdapter } = requireRuntime(
    PAYLOAD_DB_SQLITE,
  ) as typeof import('@payloadcms/db-sqlite');

  return sqliteAdapter({
    client: {
      url: getPayloadDatabaseUrl(),
    },
  });
}

export function getPayloadS3StorageOptions(): S3StorageOptions | null {
  if (!isPayloadUsingS3Storage()) {
    return null;
  }

  return {
    bucket: readRequiredEnv('PAYLOAD_S3_BUCKET'),
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
      'site-download-assets': {
        signedDownloads: false,
      },
      'site-media-assets': {
        signedDownloads: false,
      },
    },
    config: {
      credentials: {
        accessKeyId: readRequiredEnv('PAYLOAD_S3_ACCESS_KEY_ID'),
        secretAccessKey: readRequiredEnv('PAYLOAD_S3_SECRET_ACCESS_KEY'),
      },
      endpoint: readRequiredEnv('PAYLOAD_S3_ENDPOINT'),
      forcePathStyle: readBooleanEnv(
        'PAYLOAD_S3_FORCE_PATH_STYLE',
        DEFAULT_S3_FORCE_PATH_STYLE,
      ),
      region: readOptionalEnv('PAYLOAD_S3_REGION') ?? DEFAULT_S3_REGION,
    },
  };
}

export function getPayloadPlugins(): Plugin[] {
  const s3Options = getPayloadS3StorageOptions();
  if (!s3Options) {
    return [];
  }

  const { s3Storage } = requireRuntime(
    PAYLOAD_STORAGE_S3,
  ) as typeof import('@payloadcms/storage-s3');

  return [s3Storage(s3Options)];
}
