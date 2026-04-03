import { describe, expect, it, vi } from 'vitest';
import {
  copilotPayloadFind,
  copilotPayloadFindById,
  normalizeCopilotDepth,
  normalizeCopilotLimit,
  normalizeCopilotPage,
} from '@/lib/copilot/payload-read-tools';
import { isCopilotReadCollectionAllowed } from '@/lib/copilot/copilot-read-allowlist';

describe('copilot read allowlist', () => {
  it('allows catalog collections and denies internal ones', () => {
    expect(isCopilotReadCollectionAllowed('project-records')).toBe(true);
    expect(isCopilotReadCollectionAllowed('book-records')).toBe(true);
    expect(isCopilotReadCollectionAllowed('rag-chunks')).toBe(false);
    expect(isCopilotReadCollectionAllowed('users')).toBe(false);
  });
});

describe('normalizeCopilotLimit', () => {
  it('caps and defaults', () => {
    expect(normalizeCopilotLimit(undefined)).toBe(10);
    expect(normalizeCopilotLimit(99)).toBe(25);
    expect(normalizeCopilotLimit(3)).toBe(3);
  });
});

describe('normalizeCopilotPage', () => {
  it('clamps page', () => {
    expect(normalizeCopilotPage(undefined)).toBe(1);
    expect(normalizeCopilotPage(99999)).toBe(500);
  });
});

describe('normalizeCopilotDepth', () => {
  it('clamps depth', () => {
    expect(normalizeCopilotDepth(undefined)).toBe(0);
    expect(normalizeCopilotDepth(99)).toBe(2);
  });
});

describe('copilotPayloadFind', () => {
  it('rejects non-allowlisted collections without calling find', async () => {
    const find = vi.fn();
    const res = await copilotPayloadFind({ collection: 'rag-chunks' }, { find, findByID: vi.fn() });
    expect(find).not.toHaveBeenCalled();
    expect(res).toMatchObject({
      ok: false,
      error: 'collection_not_allowed',
      collection: 'rag-chunks',
    });
  });

  it('calls find with capped args for allowlisted collection', async () => {
    const find = vi.fn().mockResolvedValue({
      docs: [{ id: 'a' }],
      totalDocs: 1,
      limit: 10,
      page: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
    const res = await copilotPayloadFind(
      {
        collection: 'project-records',
        limit: 100,
        page: 2,
        depth: 5,
        sort: '-updatedAt',
      },
      { find, findByID: vi.fn() },
    );

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'project-records',
        limit: 25,
        page: 2,
        depth: 2,
        sort: '-updatedAt',
      }),
    );
    expect(res.ok).toBe(true);
    if (res.ok && res.operation === 'find') {
      expect(res.result.docs).toHaveLength(1);
    }
  });
});

describe('copilotPayloadFindById', () => {
  it('rejects non-allowlisted collections', async () => {
    const findByID = vi.fn();
    const res = await copilotPayloadFindById(
      { collection: 'users', id: 'x' },
      { find: vi.fn(), findByID },
    );
    expect(findByID).not.toHaveBeenCalled();
    expect(res).toMatchObject({ ok: false, error: 'collection_not_allowed' });
  });

  it('returns doc when found', async () => {
    const findByID = vi.fn().mockResolvedValue({ id: 'x', title: 'T' });
    const res = await copilotPayloadFindById(
      { collection: 'site-app-records', id: 'x' },
      { find: vi.fn(), findByID },
    );
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'site-app-records',
        id: 'x',
        depth: 0,
      }),
    );
    expect(res).toMatchObject({ ok: true, operation: 'findByID' });
    if (res.ok && res.operation === 'findByID') {
      expect(res.result.doc).toMatchObject({ id: 'x' });
    }
  });

  it('returns not_found when doc is null', async () => {
    const findByID = vi.fn().mockResolvedValue(null);
    const res = await copilotPayloadFindById(
      { collection: 'project-records', id: 'missing' },
      { find: vi.fn(), findByID },
    );
    expect(res).toMatchObject({ ok: false, error: 'not_found' });
  });
});
