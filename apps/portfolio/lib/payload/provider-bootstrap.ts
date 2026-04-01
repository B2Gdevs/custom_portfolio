import fs from 'node:fs';
import path from 'node:path';
import {
  getPayloadDatabaseFilePath,
  getPayloadDatabaseProvider,
  getPayloadDatabaseUrl,
  getPayloadStorageProvider,
  readOptionalEnv,
  readRequiredEnv,
  type PayloadDatabaseProvider,
  type PayloadStorageProvider,
} from './runtime-env';
import { resolvePortfolioAppPath, resolvePortfolioAppRoot } from './app-root';

const SNAPSHOT_MANIFEST_VERSION = 1;
const UPLOAD_DIRECTORIES = [
  'media/listen-media-assets',
  'media/published-book-artifacts',
  'media/reader-library-assets',
  'media/site-download-assets',
  'media/site-media-assets',
] as const;

export type ProviderUploadDirectory = (typeof UPLOAD_DIRECTORIES)[number];

export type ProviderBootstrapStatus = {
  appRoot: string;
  databaseProvider: PayloadDatabaseProvider;
  storageProvider: PayloadStorageProvider;
  databaseFilePath: string | null;
  databaseUrl: string | null;
  localSnapshotSupported: boolean;
  hostedBootstrapReady: boolean;
  missingHostedEnv: string[];
  uploadDirectories: Array<{
    relativePath: ProviderUploadDirectory;
    absolutePath: string;
    exists: boolean;
  }>;
};

export type ProviderSnapshotManifest = {
  version: number;
  createdAt: string;
  databaseProvider: 'sqlite';
  storageProvider: PayloadStorageProvider;
  appRoot: string;
  databaseFileRelative: string | null;
  uploadDirectories: Array<{
    relativePath: ProviderUploadDirectory;
    included: boolean;
  }>;
};

export type ProviderSnapshotExportResult = {
  manifestPath: string;
  outputDir: string;
  copiedDatabase: boolean;
  copiedUploadDirectories: string[];
};

export type ProviderSnapshotImportResult = {
  manifestPath: string;
  copiedDatabase: boolean;
  restoredUploadDirectories: string[];
};

export type HostedBootstrapCommand = {
  label: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  optional?: boolean;
};

function ensureDirectory(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirectoryIfPresent(sourceDir: string, targetDir: string) {
  if (!fs.existsSync(sourceDir)) {
    return false;
  }

  fs.rmSync(targetDir, { recursive: true, force: true });
  ensureDirectory(path.dirname(targetDir));
  fs.cpSync(sourceDir, targetDir, { recursive: true });
  return true;
}

function copyFileIfPresent(sourceFile: string, targetFile: string) {
  if (!fs.existsSync(sourceFile)) {
    return false;
  }

  ensureDirectory(path.dirname(targetFile));
  fs.copyFileSync(sourceFile, targetFile);
  return true;
}

function maskDatabaseUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return value.replace(/:\/\/([^:/?#]+):([^@]+)@/, '://$1:***@');
  }
}

function getUploadDirectoryEntries() {
  return UPLOAD_DIRECTORIES.map((relativePath) => {
    const absolutePath = resolvePortfolioAppPath(...relativePath.split('/'));
    return {
      relativePath,
      absolutePath,
      exists: fs.existsSync(absolutePath),
    };
  });
}

export function getProviderBootstrapStatus(): ProviderBootstrapStatus {
  const databaseProvider = getPayloadDatabaseProvider();
  const storageProvider = getPayloadStorageProvider();
  const missingHostedEnv = [
    'DATABASE_URL',
    'PAYLOAD_S3_ENDPOINT',
    'PAYLOAD_S3_BUCKET',
    'PAYLOAD_S3_ACCESS_KEY_ID',
    'PAYLOAD_S3_SECRET_ACCESS_KEY',
  ].filter((name) => !readOptionalEnv(name));

  return {
    appRoot: resolvePortfolioAppRoot(),
    databaseProvider,
    storageProvider,
    databaseFilePath: databaseProvider === 'sqlite' ? getPayloadDatabaseFilePath() : null,
    databaseUrl: databaseProvider === 'postgres' ? maskDatabaseUrl(getPayloadDatabaseUrl()) : null,
    localSnapshotSupported: databaseProvider === 'sqlite',
    hostedBootstrapReady:
      databaseProvider === 'postgres' && storageProvider === 's3' && missingHostedEnv.length === 0,
    missingHostedEnv,
    uploadDirectories: getUploadDirectoryEntries(),
  };
}

export function exportLocalProviderSnapshot(outputDir: string): ProviderSnapshotExportResult {
  const status = getProviderBootstrapStatus();
  if (!status.localSnapshotSupported || !status.databaseFilePath) {
    throw new Error('Local provider snapshots require PAYLOAD_DB_PROVIDER=sqlite.');
  }

  ensureDirectory(outputDir);
  const databaseTarget = path.join(outputDir, 'database', path.basename(status.databaseFilePath));
  const copiedDatabase = copyFileIfPresent(status.databaseFilePath, databaseTarget);
  const copiedUploadDirectories: string[] = [];

  for (const entry of status.uploadDirectories) {
    const snapshotDir = path.join(outputDir, 'uploads', entry.relativePath.replace(/\//g, path.sep));
    if (copyDirectoryIfPresent(entry.absolutePath, snapshotDir)) {
      copiedUploadDirectories.push(entry.relativePath);
    }
  }

  const manifest: ProviderSnapshotManifest = {
    version: SNAPSHOT_MANIFEST_VERSION,
    createdAt: new Date().toISOString(),
    databaseProvider: 'sqlite',
    storageProvider: status.storageProvider,
    appRoot: status.appRoot,
    databaseFileRelative: copiedDatabase
      ? path.relative(outputDir, databaseTarget).replace(/\\/g, '/')
      : null,
    uploadDirectories: status.uploadDirectories.map((entry) => ({
      relativePath: entry.relativePath,
      included: copiedUploadDirectories.includes(entry.relativePath),
    })),
  };

  const manifestPath = path.join(outputDir, 'provider-snapshot.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  return {
    manifestPath,
    outputDir,
    copiedDatabase,
    copiedUploadDirectories,
  };
}

export function readProviderSnapshotManifest(inputDir: string): ProviderSnapshotManifest {
  const manifestPath = path.join(inputDir, 'provider-snapshot.json');
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw) as ProviderSnapshotManifest;

  if (manifest.version !== SNAPSHOT_MANIFEST_VERSION || manifest.databaseProvider !== 'sqlite') {
    throw new Error(`Unsupported provider snapshot manifest at ${manifestPath}.`);
  }

  return manifest;
}

export function importLocalProviderSnapshot(inputDir: string): ProviderSnapshotImportResult {
  const status = getProviderBootstrapStatus();
  if (!status.localSnapshotSupported || !status.databaseFilePath) {
    throw new Error('Local provider snapshot import requires PAYLOAD_DB_PROVIDER=sqlite.');
  }

  const manifest = readProviderSnapshotManifest(inputDir);
  const copiedDatabase =
    manifest.databaseFileRelative !== null
      ? copyFileIfPresent(path.join(inputDir, manifest.databaseFileRelative), status.databaseFilePath)
      : false;
  const restoredUploadDirectories: string[] = [];

  for (const entry of manifest.uploadDirectories) {
    if (!entry.included) {
      continue;
    }

    const sourceDir = path.join(inputDir, 'uploads', entry.relativePath.replace(/\//g, path.sep));
    const targetDir = resolvePortfolioAppPath(...entry.relativePath.split('/'));
    if (copyDirectoryIfPresent(sourceDir, targetDir)) {
      restoredUploadDirectories.push(entry.relativePath);
    }
  }

  return {
    manifestPath: path.join(inputDir, 'provider-snapshot.json'),
    copiedDatabase,
    restoredUploadDirectories,
  };
}

export function getHostedBootstrapCommands(): HostedBootstrapCommand[] {
  readRequiredEnv('DATABASE_URL');
  readRequiredEnv('PAYLOAD_S3_ENDPOINT');
  readRequiredEnv('PAYLOAD_S3_BUCKET');
  readRequiredEnv('PAYLOAD_S3_ACCESS_KEY_ID');
  readRequiredEnv('PAYLOAD_S3_SECRET_ACCESS_KEY');

  const hasPublishedBooks = fs.existsSync(resolvePortfolioAppPath('public', 'books'));

  return [
    {
      label: 'public records schema patch',
      command: 'pnpm',
      args: ['run', 'payload:fix-public-records'],
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        PAYLOAD_STORAGE_PROVIDER: 's3',
      },
    },
    {
      label: 'lock rel columns patch',
      command: 'pnpm',
      args: ['run', 'payload:fix-locks-rels'],
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        PAYLOAD_STORAGE_PROVIDER: 's3',
      },
    },
    {
      label: 'auth seed',
      command: 'pnpm',
      args: ['run', 'auth:seed'],
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        PAYLOAD_STORAGE_PROVIDER: 's3',
      },
    },
    {
      label: 'site downloads publish',
      command: 'pnpm',
      args: ['run', 'site:publish:downloads'],
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        PAYLOAD_STORAGE_PROVIDER: 's3',
      },
    },
    {
      label: 'site app seed',
      command: 'pnpm',
      args: ['run', 'site:seed:apps'],
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        PAYLOAD_STORAGE_PROVIDER: 's3',
      },
    },
    {
      label: 'project seed',
      command: 'pnpm',
      args: ['run', 'site:seed:projects'],
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        PAYLOAD_STORAGE_PROVIDER: 's3',
      },
    },
    {
      label: 'resume seed',
      command: 'pnpm',
      args: ['run', 'site:seed:resumes'],
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        PAYLOAD_STORAGE_PROVIDER: 's3',
      },
    },
    {
      label: 'listen seed',
      command: 'pnpm',
      args: ['run', 'listen:seed'],
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        PAYLOAD_STORAGE_PROVIDER: 's3',
      },
    },
    {
      label: 'public media publish',
      command: 'pnpm',
      args: ['run', 'media:publish'],
      env: {
        PAYLOAD_DB_PROVIDER: 'postgres',
        PAYLOAD_STORAGE_PROVIDER: 's3',
      },
    },
    ...(hasPublishedBooks
      ? [
          {
            label: 'published books upload',
            command: 'pnpm',
            args: ['run', 'books:publish'],
            env: {
              PAYLOAD_DB_PROVIDER: 'postgres',
              PAYLOAD_STORAGE_PROVIDER: 's3',
            },
            optional: true,
          } satisfies HostedBootstrapCommand,
        ]
      : []),
  ];
}
