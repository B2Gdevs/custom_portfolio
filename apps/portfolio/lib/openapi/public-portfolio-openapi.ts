/**
 * Public-only OpenAPI 3 document for interactive docs (`/docs/api`).
 * Admin-only, owner-only, and internal routes are intentionally omitted.
 * Extend this file when a route is meant to be callable without extra auth beyond cookies.
 */
export const publicPortfolioOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'Portfolio public API',
    description:
      'Anonymous and cookie-session endpoints used by the public site (discovery, docs, listen, artifacts). ' +
      'Routes under `/api/admin/*`, `/api/media/*`, `/api/reader/*` (except where noted), `/api/chat`, and Payload admin APIs are not listed here.',
    version: '1.0.0',
  },
  servers: [{ url: '/', description: 'Same origin as the site' }],
  tags: [
    { name: 'Auth', description: 'Session and portfolio cookie auth (no Clerk unless configured separately)' },
    { name: 'Content', description: 'Discovery search across blog, projects, listen' },
    { name: 'Artifacts', description: 'Published book EPUBs and related blobs' },
    { name: 'Docs', description: 'Documentation archive and MDX source API' },
    { name: 'Listen', description: 'Listen catalog unlock' },
    { name: 'Planning', description: 'Planning pack manifest and related read-only helpers' },
    { name: 'RAG', description: 'Semantic / hybrid content search for site features' },
    { name: 'Meta', description: 'This specification' },
  ],
  components: {
    securitySchemes: {
      CookieSession: {
        type: 'apiKey',
        in: 'cookie',
        name: 'portfolio-token',
        description: 'Optional owner session cookie set by `/api/auth/login` when not using Clerk-only flows.',
      },
    },
  },
  paths: {
    '/api/openapi': {
      get: {
        tags: ['Meta'],
        summary: 'OpenAPI document (this spec)',
        responses: {
          '200': {
            description: 'OpenAPI 3 JSON',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/api/auth/session': {
      get: {
        tags: ['Auth'],
        summary: 'Current session and feature entitlements',
        description: 'Returns JSON with viewer access flags; safe to call without auth.',
        security: [],
        responses: {
          '200': {
            description: 'Session payload',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Password login (owner bootstrap)',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Logged in; may Set-Cookie' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Clear portfolio session cookie',
        security: [],
        responses: {
          '200': { description: 'Logged out' },
        },
      },
    },
    '/api/content/search': {
      get: {
        tags: ['Content'],
        summary: 'Discovery search (blog, projects, listen titles)',
        security: [],
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Search query',
          },
        ],
        responses: {
          '200': {
            description: 'Hits array',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/api/rag/search': {
      get: {
        tags: ['RAG'],
        summary: 'RAG / hybrid search (when enabled)',
        security: [],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'Search results' },
        },
      },
    },
    '/api/published-book-artifacts/file/{filename}': {
      get: {
        tags: ['Artifacts'],
        summary: 'Download published EPUB or planning-pack zip by storage filename',
        description:
          'Serves bytes from Payload/S3. May redirect to `public/books/<slug>/book.epub` unless the Vercel flag ' +
          '`disable-static-published-book-epub-fallback` (or env `DISABLE_STATIC_PUBLISHED_BOOK_EPUB_FALLBACK=1`) is on. ' +
          'Filename format: `{bookSlug}--{epub|planning-pack}--{versionTag}.epub|zip`.',
        security: [],
        parameters: [
          {
            name: 'filename',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'mordreds_tale--epub--cp-20260401-034207-b3d8df0.epub',
          },
        ],
        responses: {
          '200': {
            description: 'File bytes',
            content: {
              'application/epub+zip': { schema: { type: 'string', format: 'binary' } },
              'application/zip': { schema: { type: 'string', format: 'binary' } },
            },
          },
          '302': { description: 'Redirect to static `/books/{slug}/book.epub` when applicable' },
          '307': { description: 'Temporary redirect to static EPUB' },
          '404': { description: 'Artifact missing and no static fallback' },
        },
      },
    },
    '/api/planning-pack/manifest': {
      get: {
        tags: ['Planning'],
        summary: 'Planning pack export manifest',
        security: [],
        responses: {
          '200': { description: 'JSON manifest' },
        },
      },
    },
    '/api/docs/archive': {
      get: {
        tags: ['Docs'],
        summary: 'Documentation archive bundle metadata',
        security: [],
        responses: {
          '200': { description: 'Archive index JSON' },
        },
      },
    },
    '/api/docs/source/{slug}': {
      get: {
        tags: ['Docs'],
        summary: 'Raw MDX source for a docs slug (when exposed)',
        security: [],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'MDX or text' },
          '404': { description: 'Unknown slug' },
        },
      },
    },
    '/api/listen/unlock': {
      post: {
        tags: ['Listen'],
        summary: 'Unlock private listen rows (password or entitlement)',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', additionalProperties: true },
            },
          },
        },
        responses: {
          '200': { description: 'Unlocked or token issued' },
          '401': { description: 'Invalid unlock' },
        },
      },
    },
  },
} as const;

export type PublicPortfolioOpenApi = typeof publicPortfolioOpenApi;
