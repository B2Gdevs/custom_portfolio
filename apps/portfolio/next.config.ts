import './env-bootstrap';
import path from 'path';
import { createRequire } from 'module';
import createMDX from '@next/mdx';
import { withPayload } from '@payloadcms/next/withPayload';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import type { NextConfig } from 'next';

const portfolioRoot = path.resolve(__dirname);

/** Monorepo root (`.planning/` + `vendor/repo-planner`). Required for RepoPlanner API routes + CLI. */
const monorepoRoot = path.resolve(__dirname, '../..');
if (process.env.REPOPLANNER_PROJECT_ROOT === undefined) {
  process.env.REPOPLANNER_PROJECT_ROOT = monorepoRoot;
}
/** Keep `.planning/` free of `reports/` — matches `scripts/run-planning-cli.mjs` default. */
if (process.env.REPOPLANNER_REPORTS_DIR === undefined) {
  process.env.REPOPLANNER_REPORTS_DIR = path.join(monorepoRoot, '.planning-reports');
}

const chatIsolatedDist = process.env.PORTFOLIO_DIST_DIR === '.next-chat';

/** Bundled into serverless routes that initialize Payload (dynamic `require` of DB adapters). */
const payloadAdapterTraceIncludes = [
  './node_modules/@payloadcms/db-sqlite/**/*',
  './node_modules/@payloadcms/db-postgres/**/*',
  './node_modules/pg/**/*',
  '../../node_modules/@payloadcms/db-sqlite/**/*',
  '../../node_modules/@payloadcms/db-postgres/**/*',
  '../../node_modules/pg/**/*',
] as const;

const nextConfig: NextConfig = {
  /** Remaining static routes; docs MDX are `force-dynamic` so they do not prerender at build. */
  staticPageGenerationTimeout: 300,
  distDir: process.env.PORTFOLIO_DIST_DIR || '.next',
  /**
   * pnpm hoists deps to the monorepo root; Vercel serverless traces from `apps/portfolio` by default
   * and can omit `@payloadcms/db-*` / `pg` (externals) → MODULE_NOT_FOUND at runtime. Trace from repo root.
   */
  outputFileTracingRoot: monorepoRoot,
  /** Lean Node server bundle for terminal chat only; full `pnpm build` stays default `.next`. */
  ...(chatIsolatedDist
    ? {
        output: 'standalone' as const,
      }
    : {}),
  /**
   * Payload loads exactly one DB adapter via dynamic `require()`. Next file tracing does not
   * always follow that, so Vercel lambdas can miss `@payloadcms/db-sqlite` and throw MODULE_NOT_FOUND.
   * Include both adapters + `pg` (postgres adapter) from app and hoisted root `node_modules`.
   */
  /**
   * Keys must match real route paths; a bare `**` key does not apply reliably on Vercel.
   * Payload uses dynamic `require()` for DB adapters — ensure these packages are traced.
   */
  outputFileTracingIncludes: {
    '/api/**/*': [...payloadAdapterTraceIncludes],
    '/admin/**/*': [...payloadAdapterTraceIncludes],
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  transpilePackages: [
    'repo-planner',
    '@portfolio/repub-builder',
    '@tldraw/tldraw',
    'tldraw',
  ],
  async redirects() {
    return [
      { source: '/docs/tools', destination: '/apps', permanent: false },
      { source: '/docs/tools/:path*', destination: '/apps/:path*', permanent: false },
      { source: '/dialogue-forge', destination: '/apps/dialogue-forge', permanent: true },
      { source: '/books/upload/read', destination: '/apps/reader', permanent: true },
      { source: '/books/:bookSlug/read', destination: '/apps/reader?book=:bookSlug', permanent: true },
      { source: '/books', destination: '/apps/reader', permanent: true },
      {
        source: '/docs/books/planning/mordreds-tale-state',
        destination: '/docs/books/mordreds-tale/planning/state',
        permanent: true,
      },
      {
        source: '/docs/books/planning/mordreds-tale-task-registry',
        destination: '/docs/books/mordreds-tale/planning/task-registry',
        permanent: true,
      },
      {
        source: '/docs/books/planning/mordreds-tale-decisions',
        destination: '/docs/books/mordreds-tale/planning/decisions',
        permanent: true,
      },
      {
        source: '/docs/books/planning/mordreds-legacy-state',
        destination: '/docs/books/mordreds-legacy/planning/state',
        permanent: true,
      },
      {
        source: '/docs/books/planning/mordreds-legacy-task-registry',
        destination: '/docs/books/mordreds-legacy/planning/task-registry',
        permanent: true,
      },
      {
        source: '/docs/books/planning/mordreds-legacy-decisions',
        destination: '/docs/books/mordreds-legacy/planning/decisions',
        permanent: true,
      },
      {
        source: '/docs/books/planning/magicborn-rune-path-state',
        destination: '/docs/books/magicborn-rune-path/planning/state',
        permanent: true,
      },
      {
        source: '/docs/books/planning/magicborn-rune-path-task-registry',
        destination: '/docs/books/magicborn-rune-path/planning/task-registry',
        permanent: true,
      },
      {
        source: '/docs/books/planning/magicborn-rune-path-decisions',
        destination: '/docs/books/magicborn-rune-path/planning/decisions',
        permanent: true,
      },
      {
        source: '/docs/books/planning/mordreds-tale/:path*',
        destination: '/docs/books/mordreds-tale/planning/:path*',
        permanent: true,
      },
      {
        source: '/docs/books/planning/mordreds-legacy/:path*',
        destination: '/docs/books/mordreds-legacy/planning/:path*',
        permanent: true,
      },
      {
        source: '/docs/books/planning/magicborn-rune-path/:path*',
        destination: '/docs/books/magicborn-rune-path/planning/:path*',
        permanent: true,
      },
    ];
  },
  experimental: {
    mdxRs: false,
    externalDir: true,
  },
  // Keep native/server-only SQLite and Payload packages out of the client bundle.
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
    const requirePortfolio = createRequire(path.join(portfolioRoot, 'package.json'));
    const resolvePkg = (name: string) => path.dirname(requirePortfolio.resolve(`${name}/package.json`));

    config.resolve = config.resolve ?? {};
    config.resolve.modules = [
      path.join(portfolioRoot, 'node_modules'),
      path.join(monorepoRoot, 'node_modules'),
      ...(config.resolve.modules || []),
    ];
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string | false | string[]>),
      '@': portfolioRoot,
      '@payload-config': path.join(portfolioRoot, 'payload.config.ts'),
      'react-markdown': resolvePkg('react-markdown'),
      diff: resolvePkg('diff'),
    };

    if (isServer) {
      const existingExternals = config.externals ?? [];
      config.externals = [
        ...(Array.isArray(existingExternals) ? existingExternals : [existingExternals]),
        ({ request }: { request?: string }, callback: (error?: Error | null, result?: string) => void) => {
          if (
            request &&
            (
              request === 'payload' ||
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
              request.startsWith('pg/')
            )
          ) {
            return callback(null, `commonjs ${request}`);
          }

          callback();
        },
      ];
      config.module.rules.push({
        test: /(README\.md|LICENSE)$/i,
        include: /node_modules[\\\/].*(?:@libsql|libsql)/,
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
              (ctx.includes('/@libsql/') || ctx.includes('/libsql/')) &&
              res.endsWith('.node');

            return isLibsqlDocArtifact || isLibsqlNativeArtifact;
          },
        }),
      );
    }
    return config;
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            className: ['anchor'],
          },
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: 'github-dark',
          keepBackground: false,
        },
      ],
    ],
  },
});

export default withPayload(withMDX(nextConfig), {
  devBundleServerPackages: false,
});
