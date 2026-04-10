import fs from 'node:fs';
import path from 'node:path';
import { GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getRangeRequestInfo } from 'payload/internal';
import { unknownToStringStrict as asString } from '@/lib/coerce-unknown-to-string';
import { isUnknownRecord as isRecord } from '@/lib/is-unknown-record';
import { getPayloadClient } from '@/lib/payload';
import { resolvePortfolioAppPath } from '@/lib/payload/app-root';
import {
  buildPublishedArtifactS3KeyCandidates,
  findPublishedBookArtifactForFile,
  getStaticPublicBuiltEpubPath,
  parsePublishedArtifactFilename,
} from '@/lib/payload/published-artifact-resolve';
import {
  getPayloadS3StorageOptions,
  isPayloadUsingS3Storage,
} from '@/lib/payload/runtime-config';
import { disableStaticPublishedBookEpubFallback } from '@/flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildS3Client() {
  const opts = getPayloadS3StorageOptions();
  if (!opts) {
    return null;
  }

  return new S3Client({
    credentials: opts.config.credentials,
    endpoint: opts.config.endpoint,
    region: opts.config.region,
    forcePathStyle: opts.config.forcePathStyle,
  });
}

/**
 * When Payload/S3 cannot serve the artifact, redirect to the EPUB emitted under `public/books/<slug>/book.epub`
 * by `pnpm run build:books` (included in Vercel build). `fetch()` follows this redirect in the reader.
 * Skipped when the Vercel flag `disable-static-published-book-epub-fallback` is true.
 */
function redirectToStaticBuiltEpub(
  request: Request,
  bookSlug: string,
  allowStaticFallback: boolean,
) {
  if (!allowStaticFallback) {
    return null;
  }
  const staticPath = getStaticPublicBuiltEpubPath(bookSlug);
  if (!fs.existsSync(staticPath)) {
    return null;
  }

  return NextResponse.redirect(new URL(`/books/${bookSlug}/book.epub`, request.url), 307);
}

/**
 * Serves published book artifacts (EPUB / planning-pack zip) without relying on Payload's
 * bundled `/api/.../file/:filename` handler. Resolves by exact filename, then version, then
 * `isCurrent` so manifest URLs stay valid after republish. Falls back to static `public/books/`
 * EPUB when storage is empty or objects are missing (preview deploys, S3 drift).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename: rawParam } = await context.params;
  let filename: string;
  try {
    filename = decodeURIComponent(rawParam);
  } catch {
    return new Response('Not Found', { status: 404 });
  }

  if (
    !filename ||
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return new Response('Not Found', { status: 404 });
  }

  const parsedFilename = parsePublishedArtifactFilename(filename);

  const allowStaticFallback = !(await disableStaticPublishedBookEpubFallback());

  const payload = await getPayloadClient();
  const doc = await findPublishedBookArtifactForFile(payload, filename);

  if (!isRecord(doc)) {
    if (parsedFilename?.artifactKind === 'epub') {
      const redirect = redirectToStaticBuiltEpub(
        request,
        parsedFilename.bookSlug,
        allowStaticFallback,
      );
      if (redirect) {
        return redirect;
      }
    }
    return new Response('Not Found', { status: 404 });
  }

  const docFilename = asString(doc.filename);
  if (!docFilename) {
    return new Response('Not Found', { status: 404 });
  }

  const mimeType =
    asString(doc.mimeType) ??
    (filename.toLowerCase().endsWith('.epub')
      ? 'application/epub+zip'
      : 'application/zip');

  if (!isPayloadUsingS3Storage()) {
    const filePath = path.join(
      resolvePortfolioAppPath('media', 'published-book-artifacts'),
      docFilename,
    );
    if (!fs.existsSync(filePath)) {
      const bookSlug = asString(doc.bookSlug);
      if (bookSlug) {
        const redirect = redirectToStaticBuiltEpub(request, bookSlug, allowStaticFallback);
        if (redirect) {
          return redirect;
        }
      }
      return new Response('Not Found', { status: 404 });
    }
    const buf = fs.readFileSync(filePath);
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(buf.length),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }

  const s3Opts = getPayloadS3StorageOptions();
  const client = buildS3Client();
  if (!s3Opts || !client) {
    console.error('[published-book-artifacts/file] S3 configured but client init failed');
    return new Response('Internal Server Error', { status: 500 });
  }

  const keyCandidates = buildPublishedArtifactS3KeyCandidates(doc, filename);
  let resolvedKey: string | null = null;
  let headContentLength: number | null = null;

  for (const key of keyCandidates) {
    try {
      const head = await client.send(
        new HeadObjectCommand({
          Bucket: s3Opts.bucket,
          Key: key,
        }),
      );
      const fileSize = head.ContentLength;
      if (typeof fileSize === 'number' && Number.isFinite(fileSize) && fileSize >= 0) {
        resolvedKey = key;
        headContentLength = fileSize;
        break;
      }
    } catch (err: unknown) {
      const name = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
      const code =
        err && typeof err === 'object' && '$metadata' in err
          ? (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
          : undefined;
      if (name === 'NoSuchKey' || name === 'NotFound' || code === 404) {
        continue;
      }
      console.error('[published-book-artifacts/file] HeadObject', key, err);
      throw err;
    }
  }

  if (resolvedKey === null || headContentLength === null) {
    console.error('[published-book-artifacts/file] no S3 object for keys', keyCandidates);
    const bookSlug = asString(doc.bookSlug);
    if (bookSlug && asString(doc.artifactKind) === 'epub') {
      const redirect = redirectToStaticBuiltEpub(request, bookSlug, allowStaticFallback);
      if (redirect) {
        return redirect;
      }
    }
    return new Response('Not Found', { status: 404 });
  }

  try {
    const rangeHeader = request.headers.get('range');
    const rangeResult = getRangeRequestInfo({
      fileSize: headContentLength,
      rangeHeader,
    });

    if (rangeResult.type === 'invalid') {
      return new Response(null, {
        status: rangeResult.status,
        headers: new Headers(rangeResult.headers as HeadersInit),
      });
    }

    const rangeForS3 =
      rangeResult.type === 'partial'
        ? `bytes=${rangeResult.rangeStart}-${rangeResult.rangeEnd}`
        : undefined;

    const object = await client.send(
      new GetObjectCommand({
        Bucket: s3Opts.bucket,
        Key: resolvedKey,
        Range: rangeForS3,
      }),
    );

    if (!object.Body) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    if (object.ETag) {
      headers.set('ETag', String(object.ETag));
    }
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');

    for (const [k, v] of Object.entries(rangeResult.headers)) {
      headers.set(k, v);
    }

    const body = object.Body as NodeJS.ReadableStream;
    return new Response(body as unknown as BodyInit, {
      status: rangeResult.status,
      headers,
    });
  } catch (err: unknown) {
    const name = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
    const code =
      err && typeof err === 'object' && '$metadata' in err
        ? (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
        : undefined;

    if (name === 'NoSuchKey' || name === 'NotFound' || code === 404) {
      const bookSlug = asString(doc.bookSlug);
      if (bookSlug && asString(doc.artifactKind) === 'epub') {
        const redirect = redirectToStaticBuiltEpub(request, bookSlug, allowStaticFallback);
        if (redirect) {
          return redirect;
        }
      }
      return new Response('Not Found', { status: 404 });
    }

    console.error('[published-book-artifacts/file]', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
