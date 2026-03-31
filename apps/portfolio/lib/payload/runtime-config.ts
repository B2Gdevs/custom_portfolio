import { postgresAdapter } from '@payloadcms/db-postgres';
import { s3Storage, type S3StorageOptions } from '@payloadcms/storage-s3';
import type { Plugin } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
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
    return postgresAdapter({
      pool: {
        connectionString: getPayloadDatabaseUrl(),
      },
      push: readBooleanEnv('PAYLOAD_POSTGRES_PUSH', true),
    });
  }

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
  return s3Options ? [s3Storage(s3Options)] : [];
}
