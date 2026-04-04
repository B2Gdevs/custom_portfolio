import fs from 'node:fs';
import path from 'node:path';
import { GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getRangeRequestInfo } from 'payload/internal';
import { sanitizeFilename } from 'payload/shared';
import { getPayloadClient } from '@/lib/payload';
import { resolvePortfolioAppPath } from '@/lib/payload/app-root';
import { PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG } from '@/lib/payload/collections/publishedBookArtifacts';
import {
  getPayloadS3StorageOptions,
  isPayloadUsingS3Storage,
} from '@/lib/payload/runtime-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sanitizePrefix(prefix: string) {
  return prefix
    .replace(/\\/g, '/')
    .split('/')
    .filter((segment) => segment !== '..' && segment !== '.')
    .join('/')
    .replace(/^\/+/, '')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

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
 * Serves published book artifacts (EPUB / planning-pack zip) without relying on Payload's
 * bundled `/api/.../file/:filename` handler. That handler can return 500 for some S3-compatible
 * backends when `HeadObject` omits `ContentLength` (it treats falsy sizes as error).
 *
 * This route is more specific than `(payload)/api/[...slug]`, so Next.js prefers it for
 * `/api/published-book-artifacts/file/*`.
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

  const payload = await getPayloadClient();
  const found = await payload.find({
    collection: PUBLISHED_BOOK_ARTIFACTS_COLLECTION_SLUG,
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    where: {
      filename: {
        equals: filename,
      },
    },
  });

  const doc = found.docs[0];
  if (!isRecord(doc)) {
    return new Response('Not Found', { status: 404 });
  }

  const docFilename = asString(doc.filename);
  if (docFilename !== filename) {
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
      filename,
    );
    if (!fs.existsSync(filePath)) {
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

  const prefix = sanitizePrefix(asString(doc.prefix) ?? '');
  const key = path.posix.join(prefix, sanitizeFilename(filename));

  try {
    const head = await client.send(
      new HeadObjectCommand({
        Bucket: s3Opts.bucket,
        Key: key,
      }),
    );

    let fileSize = head.ContentLength;
    if (typeof fileSize !== 'number' || !Number.isFinite(fileSize) || fileSize < 0) {
      console.error('[published-book-artifacts/file] missing ContentLength for key', key);
      return new Response('Internal Server Error', { status: 500 });
    }

    const rangeHeader = request.headers.get('range');
    const rangeResult = getRangeRequestInfo({
      fileSize,
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
        Key: key,
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
      return new Response('Not Found', { status: 404 });
    }

    console.error('[published-book-artifacts/file]', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
