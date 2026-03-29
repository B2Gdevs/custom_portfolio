import { expect, test } from '@playwright/test';

const authHeader = `Basic ${Buffer.from('admin:secret').toString('base64')}`;

test.describe('AI API surfaces', () => {
  test('requires basic auth for the admin ingest route', async ({ request }) => {
    const response = await request.get('/api/admin/rag/ingest');

    expect(response.status()).toBe(401);
    expect(response.headers()['www-authenticate']).toContain('Basic');
  });

  test('returns the deferred ingest response after basic auth succeeds', async ({ request }) => {
    const getResponse = await request.get('/api/admin/rag/ingest', {
      headers: { authorization: authHeader },
    });
    const postResponse = await request.post('/api/admin/rag/ingest', {
      headers: { authorization: authHeader },
    });

    expect(getResponse.status()).toBe(200);
    await expect(getResponse.json()).resolves.toMatchObject({
      ok: false,
      error: 'ingest_route_not_enabled',
    });

    expect(postResponse.status()).toBe(503);
    await expect(postResponse.json()).resolves.toMatchObject({
      ok: false,
      error: 'ingest_route_not_enabled',
    });
  });

  test('rejects empty RAG queries at the API boundary', async ({ request }) => {
    const response = await request.get('/api/rag/search');

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'missing_query',
    });
  });

});
