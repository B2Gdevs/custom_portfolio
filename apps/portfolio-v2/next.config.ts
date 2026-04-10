import './env-bootstrap';
import path from 'path';
import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

const appRoot = path.resolve(__dirname);
const monorepoRoot = path.resolve(__dirname, '../..');

const payloadAdapterTraceIncludes = [
  './node_modules/@payloadcms/db-sqlite/**/*',
  './node_modules/@payloadcms/db-postgres/**/*',
  './node_modules/pg/**/*',
  '../../node_modules/@payloadcms/db-sqlite/**/*',
  '../../node_modules/@payloadcms/db-postgres/**/*',
  '../../node_modules/pg/**/*',
] as const;

const payloadS3TraceIncludes = [
  './node_modules/@aws-sdk/client-s3/**/*',
  './node_modules/@aws-sdk/s3-request-presigner/**/*',
  './node_modules/@payloadcms/storage-s3/**/*',
  './node_modules/@smithy/**/*',
  '../../node_modules/@aws-sdk/client-s3/**/*',
  '../../node_modules/@aws-sdk/s3-request-presigner/**/*',
  '../../node_modules/@payloadcms/storage-s3/**/*',
  '../../node_modules/@smithy/**/*',
] as const;

const payloadServerTraceIncludes = [...payloadAdapterTraceIncludes, ...payloadS3TraceIncludes];

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 300,
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    '/**': [...payloadServerTraceIncludes],
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  serverExternalPackages: [
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    '@libsql/client',
    '@libsql/hrana-client',
    '@libsql/isomorphic-fetch',
    '@libsql/isomorphic-ws',
    '@payloadcms/db-postgres',
    '@payloadcms/db-sqlite',
    '@payloadcms/storage-s3',
    'better-sqlite3',
    'libsql',
    'payload',
    'pg',
    'sqlite-vec',
  ],
  webpack: (config, { webpack, isServer }) => {
    config.resolve = config.resolve ?? {};
    config.resolve.modules = [
      path.join(appRoot, 'node_modules'),
      path.join(monorepoRoot, 'node_modules'),
      ...(config.resolve.modules || []),
    ];
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string | false | string[]>),
      '@': appRoot,
      '@payload-config': path.join(appRoot, 'payload.config.ts'),
    };

    if (isServer) {
      const existingExternals = config.externals ?? [];
      config.externals = [
        ...(Array.isArray(existingExternals) ? existingExternals : [existingExternals]),
        ({ request }: { request?: string }, callback: (error?: Error | null, result?: string) => void) => {
          if (
            request &&
            (request === 'payload' ||
              request.startsWith('payload/') ||
              request === '@payloadcms/db-postgres' ||
              request.startsWith('@payloadcms/db-postgres/') ||
              request === '@payloadcms/db-sqlite' ||
              request.startsWith('@payloadcms/db-sqlite/') ||
              request === '@payloadcms/storage-s3' ||
              request.startsWith('@payloadcms/storage-s3/') ||
              request === '@aws-sdk/client-s3' ||
              request.startsWith('@aws-sdk/client-s3/') ||
              request === '@aws-sdk/s3-request-presigner' ||
              request.startsWith('@aws-sdk/s3-request-presigner/') ||
              request === 'libsql' ||
              request.startsWith('@libsql/') ||
              request === 'pg' ||
              request.startsWith('pg/'))
          ) {
            return callback(null, `commonjs ${request}`);
          }

          callback();
        },
      ];
      config.module.rules.push({
        test: /(README\.md|LICENSE)$/i,
        include: /node_modules[\\/](?:@libsql|libsql)/,
        type: 'asset/source',
      });
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /(README\.md|LICENSE|\.node)$/i,
          contextRegExp: /(?:^|[\\/])(?:@libsql|libsql)(?:[\\/]|$)/,
        }),
        new webpack.IgnorePlugin({
          checkResource(resource: string, context: string) {
            const ctx = context.replace(/\\/g, '/');
            const res = resource.replace(/\\/g, '/');
            const isLibsqlDocArtifact =
              (ctx.includes('/@libsql/') || ctx.includes('/libsql/')) &&
              (res.endsWith('/README.md') ||
                res.endsWith('README.md') ||
                res.endsWith('/LICENSE') ||
                res.endsWith('LICENSE'));
            const isLibsqlNativeArtifact =
              (ctx.includes('/@libsql/') || ctx.includes('/libsql/')) && res.endsWith('.node');

            return isLibsqlDocArtifact || isLibsqlNativeArtifact;
          },
        }),
      );
    }
    return config;
  },
};

export default withPayload(nextConfig, {
  devBundleServerPackages: false,
});
