import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { describe, expect, it } from 'vitest';
import { getPayloadClient } from '@/lib/payload';
import {
  buildPublishedArtifactS3KeyCandidates,
  findPublishedBookArtifactForFile,
} from '@/lib/payload/published-artifact-resolve';
import { getPayloadS3StorageOptions, isPayloadUsingS3Storage } from '@/lib/payload/runtime-config';
import { isPayloadUsingPostgres } from '@/lib/payload/runtime-env';

/** Canonical manifest filename (double hyphen before version segment). */
const SAMPLE_EPUB =
  'mordreds_tale--epub--cp-20260401-034207-b3d8df0.epub';

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

const envReady =
  Boolean(process.env.DATABASE_URL?.trim()) &&
  isPayloadUsingPostgres() &&
  isPayloadUsingS3Storage();

describe('published-book-artifacts (integration: Postgres + Supabase S3)', () => {
  it.skipIf(!envReady)(
    'finds Payload row and at least one S3 key that exists for the manifest EPUB name',
    async () => {
      const payload = await getPayloadClient();
      const doc = await findPublishedBookArtifactForFile(payload, SAMPLE_EPUB);

      expect(doc, 'published-book-artifacts row should exist for manifest filename').not.toBeNull();
      expect(String(doc?.filename ?? '')).toMatch(/mordreds_tale--epub/);

      const s3Opts = getPayloadS3StorageOptions();
      const client = buildS3Client();
      expect(s3Opts && client, 'S3 client').toBeTruthy();
      if (!s3Opts || !client) {
        return;
      }

      const keys = buildPublishedArtifactS3KeyCandidates(doc!, SAMPLE_EPUB);
      expect(keys.length).toBeGreaterThan(0);

      let hit: string | null = null;
      for (const key of keys) {
        try {
          await client.send(
            new HeadObjectCommand({
              Bucket: s3Opts.bucket,
              Key: key,
            }),
          );
          hit = key;
          break;
        } catch (err: unknown) {
          const name = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
          if (name === 'NotFound' || name === 'NoSuchKey') {
            continue;
          }
          throw err;
        }
      }

      expect(hit, `S3 object missing for all keys: ${keys.join(' | ')}`).not.toBeNull();
    },
  );

  it.skipIf(!envReady || !process.env.INTEGRATION_TEST_HTTP_URL?.trim())(
    'HTTP GET succeeds when INTEGRATION_TEST_HTTP_URL points at a running app',
    async () => {
      const base = process.env.INTEGRATION_TEST_HTTP_URL!.trim();

      const url = new URL(
        `/api/published-book-artifacts/file/${encodeURIComponent(SAMPLE_EPUB)}`,
        base.endsWith('/') ? base : `${base}/`,
      );

      const res = await fetch(url, { redirect: 'manual' });
      expect(
        [200, 302, 307].includes(res.status),
        `GET ${url} → ${res.status} ${await res.text().catch(() => '')}`,
      ).toBe(true);
    },
  );
});
