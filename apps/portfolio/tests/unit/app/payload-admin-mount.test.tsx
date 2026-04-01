// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import PayloadLayout from '@/app/(payload)/layout';
import PayloadAdminPage, {
  generateMetadata as generateAdminMetadata,
} from '@/app/(payload)/admin/[[...segments]]/page';
import PayloadAdminNotFound, {
  generateMetadata as generateNotFoundMetadata,
} from '@/app/(payload)/admin/[[...segments]]/not-found';
import {
  DELETE,
  GET,
  OPTIONS,
  PATCH,
  POST,
  PUT,
} from '@/app/(payload)/api/[...slug]/route';
import {
  GET as GRAPHQL_PLAYGROUND_GET,
} from '@/app/(payload)/api/graphql-playground/route';
import {
  OPTIONS as GRAPHQL_OPTIONS,
  POST as GRAPHQL_POST,
} from '@/app/(payload)/api/graphql/route';
import { assertAdminOwnerOrRedirect } from '@/lib/auth/admin-owner-gate';

const layoutSpies = vi.hoisted(() => ({
  handleServerFunctions: vi.fn().mockResolvedValue({ ok: true }),
  rootPage: vi.fn(),
  notFoundPage: vi.fn(),
  generatePageMetadata: vi.fn().mockResolvedValue({ title: 'Payload Admin' }),
  restGetHandler: vi.fn(() => new Response('get')),
  restPostHandler: vi.fn(() => new Response('post')),
  restDeleteHandler: vi.fn(() => new Response('delete')),
  restPatchHandler: vi.fn(() => new Response('patch')),
  restPutHandler: vi.fn(() => new Response('put')),
  restOptionsHandler: vi.fn(() => new Response('options')),
  graphqlPostHandler: vi.fn(() => new Response('graphql-post')),
  graphqlPlaygroundHandler: vi.fn(() => new Response('graphql-playground')),
}));

vi.mock('@payload-config', () => ({
  default: {
    slug: 'payload-config',
  },
}));

vi.mock('@payloadcms/next/css', () => ({}));

vi.mock('@payloadcms/next/rsc', () => ({
  CollectionCards: () => null,
}));

vi.mock('@payloadcms/next/layouts', () => ({
  handleServerFunctions: layoutSpies.handleServerFunctions,
  RootLayout: ({
    children,
  }: {
    children: ReactNode;
    config: unknown;
    importMap: unknown;
    serverFunction: unknown;
  }) => <div data-testid="payload-root-layout">{children}</div>,
}));

vi.mock('@payloadcms/next/views', () => ({
  RootPage: layoutSpies.rootPage.mockImplementation(() => (
    <div data-testid="payload-root-page">payload-admin-page</div>
  )),
  NotFoundPage: layoutSpies.notFoundPage.mockImplementation(() => (
    <div data-testid="payload-not-found-page">payload-admin-not-found</div>
  )),
  generatePageMetadata: layoutSpies.generatePageMetadata,
}));

vi.mock('@payloadcms/next/routes', () => ({
  REST_GET: vi.fn(() => layoutSpies.restGetHandler),
  REST_POST: vi.fn(() => layoutSpies.restPostHandler),
  REST_DELETE: vi.fn(() => layoutSpies.restDeleteHandler),
  REST_PATCH: vi.fn(() => layoutSpies.restPatchHandler),
  REST_PUT: vi.fn(() => layoutSpies.restPutHandler),
  REST_OPTIONS: vi.fn(() => layoutSpies.restOptionsHandler),
  GRAPHQL_POST: vi.fn(() => layoutSpies.graphqlPostHandler),
  GRAPHQL_PLAYGROUND_GET: vi.fn(() => layoutSpies.graphqlPlaygroundHandler),
}));

vi.mock('@/lib/auth/admin-owner-gate', () => ({
  assertAdminOwnerOrRedirect: vi.fn().mockResolvedValue(undefined),
}));

describe('Payload admin mount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    layoutSpies.generatePageMetadata.mockResolvedValue({ title: 'Payload Admin' });
    layoutSpies.rootPage.mockImplementation(() => (
      <div data-testid="payload-root-page">payload-admin-page</div>
    ));
    layoutSpies.notFoundPage.mockImplementation(() => (
      <div data-testid="payload-not-found-page">payload-admin-not-found</div>
    ));
  });

  it('gates the payload admin layout behind the owner redirect helper', async () => {
    const ui = await PayloadLayout({
      children: <div>payload-child</div>,
    });

    render(ui);

    expect(assertAdminOwnerOrRedirect).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('payload-root-layout')).toHaveTextContent('payload-child');
  });

  it('wires the admin catch-all page and metadata through Payload views', async () => {
    const params = Promise.resolve({ segments: ['collections'] });
    const searchParams = Promise.resolve({ q: 'users' });

    const metadata = await generateAdminMetadata({ params, searchParams });
    render(<PayloadAdminPage params={params} searchParams={searchParams} />);

    expect(layoutSpies.generatePageMetadata).toHaveBeenCalledTimes(1);
    expect(layoutSpies.rootPage).toHaveBeenCalledTimes(1);
    expect(metadata).toEqual({ title: 'Payload Admin' });
    expect(screen.getByTestId('payload-root-page')).toBeInTheDocument();
  });

  it('wires the admin not-found page through Payload views', async () => {
    const params = Promise.resolve({ segments: ['missing'] });
    const searchParams = Promise.resolve({});

    const metadata = await generateNotFoundMetadata({ params, searchParams });
    render(<PayloadAdminNotFound params={params} searchParams={searchParams} />);

    expect(layoutSpies.generatePageMetadata).toHaveBeenCalledTimes(1);
    expect(layoutSpies.notFoundPage).toHaveBeenCalledTimes(1);
    expect(metadata).toEqual({ title: 'Payload Admin' });
    expect(screen.getByTestId('payload-not-found-page')).toBeInTheDocument();
  });

  it('exports payload REST and GraphQL route handlers', async () => {
    expect(GET(new Request('http://localhost/api/users'))).toBeInstanceOf(Response);
    expect(POST(new Request('http://localhost/api/users'))).toBeInstanceOf(Response);
    expect(DELETE(new Request('http://localhost/api/users'))).toBeInstanceOf(Response);
    expect(PATCH(new Request('http://localhost/api/users'))).toBeInstanceOf(Response);
    expect(PUT(new Request('http://localhost/api/users'))).toBeInstanceOf(Response);
    expect(OPTIONS(new Request('http://localhost/api/users'))).toBeInstanceOf(Response);
    expect(GRAPHQL_POST(new Request('http://localhost/api/graphql'))).toBeInstanceOf(Response);
    expect(GRAPHQL_OPTIONS(new Request('http://localhost/api/graphql'))).toBeInstanceOf(
      Response,
    );
    expect(
      GRAPHQL_PLAYGROUND_GET(new Request('http://localhost/api/graphql-playground')),
    ).toBeInstanceOf(Response);
  });
});
