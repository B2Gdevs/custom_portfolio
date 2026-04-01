import { describe, expect, it, vi } from 'vitest';
import {
  PAYLOAD_CLI_GENERATE_ALIASES,
  resolvePayloadCliOrigin,
  siteAppRecordFromFallback,
  upsertSiteAppRecordViaRest,
} from '@/lib/magicborn/payload-cli-generate';
import { SITE_APP_RECORD_COLLECTION_SLUG } from '@/lib/payload/collections/siteAppRecords';

describe('payload-cli-generate', () => {
  it('maps app alias to site-app-records', () => {
    expect(PAYLOAD_CLI_GENERATE_ALIASES.app.collection).toBe(SITE_APP_RECORD_COLLECTION_SLUG);
  });

  it('builds body from fallback registry', () => {
    const body = siteAppRecordFromFallback('repo-planner');
    expect(body).toMatchObject({
      slug: 'repo-planner',
      title: 'Repo Planner',
      published: true,
    });
  });

  it('resolvePayloadCliOrigin respects MAGICBORN_PAYLOAD_URL', () => {
    const a = process.env.MAGICBORN_PAYLOAD_URL;
    const b = process.env.NEXT_PUBLIC_APP_URL;
    process.env.MAGICBORN_PAYLOAD_URL = 'https://example.com/';
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(resolvePayloadCliOrigin()).toBe('https://example.com');
    if (a !== undefined) process.env.MAGICBORN_PAYLOAD_URL = a;
    else delete process.env.MAGICBORN_PAYLOAD_URL;
    if (b !== undefined) process.env.NEXT_PUBLIC_APP_URL = b;
    else delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it('upsertSiteAppRecordViaRest PATCHes when doc exists', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ docs: [{ id: 7, slug: 'x' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doc: { id: 7 } }),
      });
    const result = await upsertSiteAppRecordViaRest({
      origin: 'http://localhost:3000',
      apiKey: 'k',
      body: { title: 'T' },
      slug: 'x',
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: true, id: 7, mode: 'updated' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const patchCall = fetchMock.mock.calls[1];
    expect(patchCall[0]).toBe(`http://localhost:3000/api/${SITE_APP_RECORD_COLLECTION_SLUG}/7`);
    expect(patchCall[1]?.method).toBe('PATCH');
  });

  it('upsertSiteAppRecordViaRest POSTs when no doc', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ docs: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doc: { id: 'new1' } }),
      });
    const result = await upsertSiteAppRecordViaRest({
      origin: 'http://localhost:3000',
      apiKey: 'k',
      body: { title: 'T', slug: 'new' },
      slug: 'new',
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: true, id: 'new1', mode: 'created' });
  });
});
