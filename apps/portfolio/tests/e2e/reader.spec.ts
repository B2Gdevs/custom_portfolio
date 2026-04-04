import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const portfolioRoot = path.resolve(__dirname, '../..');

test.describe('Reader and published EPUB artifacts', () => {
  test('books manifest is served as JSON', async ({ request }) => {
    const res = await request.get('/books/manifest.json');
    expect(res.ok(), await res.text()).toBeTruthy();
    const data = (await res.json()) as unknown;
    expect(Array.isArray(data)).toBe(true);
  });

  test('artifact EPUB redirects to static /books/.../book.epub when built file exists', async ({
    request,
  }) => {
    const epubPath = path.join(portfolioRoot, 'public', 'books', 'mordreds_tale', 'book.epub');
    if (!fs.existsSync(epubPath)) {
      test.skip();
    }

    const res = await request.get(
      '/api/published-book-artifacts/file/mordreds_tale--epub--cp-20260401-034207-b3d8df0.epub',
      { maxRedirects: 0 },
    );

    expect([200, 302, 307]).toContain(res.status());
    if (res.status() === 302 || res.status() === 307) {
      const loc = res.headers().location ?? '';
      expect(loc).toMatch(/\/books\/mordreds_tale\/book\.epub$/);
    }
  });

  test('reader app shell loads without uncaught page errors', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/apps/reader', { waitUntil: 'load', timeout: 120_000 });

    expect(pageErrors, pageErrors.join('\n')).toEqual([]);
  });
});
