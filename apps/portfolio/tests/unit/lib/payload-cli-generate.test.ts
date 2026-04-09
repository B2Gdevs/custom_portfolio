import type { Payload } from 'payload';
import { describe, expect, it, vi } from 'vitest';
import {
  PAYLOAD_CLI_GENERATE_ALIASES,
  siteAppRecordFromSeed,
  upsertSiteAppRecordViaLocalPayload,
} from '@/lib/magicborn/payload-cli-generate';
import { SITE_APP_RECORD_COLLECTION_SLUG } from '@/lib/payload/collections/siteAppRecords';

function mockPayload(partial: {
  find?: Payload['find'];
  update?: Payload['update'];
  create?: Payload['create'];
}): Payload {
  return {
    find: partial.find ?? vi.fn(),
    update: partial.update ?? vi.fn(),
    create: partial.create ?? vi.fn(),
  } as unknown as Payload;
}

describe('payload-cli-generate', () => {
  it('maps app alias to site-app-records', () => {
    expect(PAYLOAD_CLI_GENERATE_ALIASES.app.collection).toBe(SITE_APP_RECORD_COLLECTION_SLUG);
  });

  it('builds body from seed registry', () => {
    const body = siteAppRecordFromSeed('get-anything-done');
    expect(body).toMatchObject({
      slug: 'get-anything-done',
      title: 'Get Anything Done (GAD)',
      published: true,
    });
  });

  it('upsertSiteAppRecordViaLocalPayload updates when doc exists', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [{ id: 7, slug: 'x' }] });
    const update = vi.fn().mockResolvedValue({});
    const create = vi.fn();
    const payload = mockPayload({ find, update, create });
    const result = await upsertSiteAppRecordViaLocalPayload(payload, {
      body: { title: 'T' },
      slug: 'x',
    });
    expect(result).toEqual({ ok: true, id: 7, mode: 'updated' });
    expect(find).toHaveBeenCalledWith({
      collection: SITE_APP_RECORD_COLLECTION_SLUG,
      where: { slug: { equals: 'x' } },
      limit: 1,
      depth: 0,
    });
    expect(update).toHaveBeenCalledWith({
      collection: SITE_APP_RECORD_COLLECTION_SLUG,
      id: '7',
      data: { title: 'T' },
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('upsertSiteAppRecordViaLocalPayload creates when no doc', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    const create = vi.fn().mockResolvedValue({ id: 'new1' });
    const payload = mockPayload({ find, create });
    const result = await upsertSiteAppRecordViaLocalPayload(payload, {
      body: { title: 'T', slug: 'new' },
      slug: 'new',
    });
    expect(result).toEqual({ ok: true, id: 'new1', mode: 'created' });
    expect(create).toHaveBeenCalledWith({
      collection: SITE_APP_RECORD_COLLECTION_SLUG,
      data: { title: 'T', slug: 'new' },
    });
  });
});
