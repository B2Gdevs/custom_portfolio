import path from 'path';
import { createRequire } from 'module';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import type { NextConfig } from 'next';

/** Monorepo root (`.planning/` + `vendor/repo-planner`). Required for RepoPlanner API routes + CLI. */
const monorepoRoot = path.resolve(__dirname, '../..');
if (process.env.REPOPLANNER_PROJECT_ROOT === undefined) {
  process.env.REPOPLANNER_PROJECT_ROOT = monorepoRoot;
}
/** Keep `.planning/` free of `reports/` — matches `scripts/run-planning-cli.mjs` default. */
if (process.env.REPOPLANNER_REPORTS_DIR === undefined) {
  process.env.REPOPLANNER_REPORTS_DIR = path.join(monorepoRoot, '.planning-reports');
}

const nextConfig: NextConfig = {
  distDir: process.env.PORTFOLIO_DIST_DIR || '.next',
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  transpilePackages: ['repo-planner'],
  async redirects() {
    return [
      { source: '/docs/tools', destination: '/apps', permanent: false },
      { source: '/docs/tools/:path*', destination: '/apps/:path*', permanent: false },
      { source: '/dialogue-forge', destination: '/apps/dialogue-forge', permanent: true },
      { source: '/books/upload/read', destination: '/apps/reader', permanent: true },
      { source: '/books/:bookSlug/read', destination: '/apps/reader?book=:bookSlug', permanent: true },
      { source: '/books', destination: '/apps/reader', permanent: true },
    ];
  },
  experimental: {
    mdxRs: false,
    externalDir: true,
  },
  // Keep native/server-only SQLite and Payload packages out of the client bundle.
  serverExternalPackages: [
    '@libsql/client',
    '@libsql/hrana-client',
    '@libsql/isomorphic-fetch',
    '@libsql/isomorphic-ws',
    '@payloadcms/db-sqlite',
    'better-sqlite3',
    'libsql',
    'payload',
    'sqlite-vec',
  ],
  webpack: (config, { webpack, isServer }) => {
    const portfolioRoot = path.resolve(__dirname);
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
      'react-markdown': resolvePkg('react-markdown'),
      diff: resolvePkg('diff'),
    };

    if (isServer) {
      config.module.rules.push({
        test: /(README\.md|LICENSE)$/i,
        include: /node_modules[\\\/](?:\.pnpm[\\\/])?(?:@libsql|libsql)/,
        type: 'asset/source',
      });
      config.plugins.push(
        new webpack.IgnorePlugin({
          checkResource(resource: string, context: string) {
            const ctx = context.replace(/\\/g, '/');
            const res = resource.replace(/\\/g, '/');
            const isLibsqlDocArtifact =
              (ctx.includes('/@libsql/') || ctx.includes('/libsql/')) &&
              (res.endsWith('/README.md') || res.endsWith('/LICENSE'));

            return isLibsqlDocArtifact;
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

export default withMDX(nextConfig);
