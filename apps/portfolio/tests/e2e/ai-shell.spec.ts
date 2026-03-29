import { expect, test } from '@playwright/test';

test.describe('AI shell', () => {
  test('renders the public site chat shell on the homepage', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          text: 'Morgana is the sleeping source at the center of Magicborn lore.',
          query: 'Who is Morgana?',
          model: 'gpt-4o-mini',
          hits: [
            {
              chunkId: 1,
              sourceId: 'docs:magicborn/morgana-the-sleeping-root',
              sourceKind: 'magicborn',
              sourceScope: 'magicborn',
              title: 'Morgana, the Sleeping Root',
              heading: 'Known Facts',
              anchor: 'known-facts',
              publicUrl: '/docs/magicborn/morgana-the-sleeping-root',
              sourcePath: 'apps/portfolio/content/docs/magicborn/morgana-the-sleeping-root.mdx',
              content: 'Morgana powers relics.',
              snippet: 'Morgana powers relics.',
              distance: 0.2,
              score: 0.9,
            },
          ],
        }),
      });
    });

    await page.goto('/');

    await expect(page.getByTestId('site-copilot-shell')).toBeAttached();
    await expect(page.getByRole('button', { name: 'Open Chat' })).toBeVisible();

    await page.getByRole('button', { name: 'Open Chat' }).click();

    await expect(page.getByRole('heading', { name: 'Chat' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Type a message...' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Type a message...' }).fill('Who is Morgana?');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(
      page.getByText('Morgana is the sleeping source at the center of Magicborn lore.'),
    ).toBeVisible();
    await expect(page.getByText('Sources (1)')).toBeVisible();
    await page.getByText('Sources (1)').click();
    await expect(page.getByRole('link', { name: 'Open source' })).toHaveAttribute(
      'href',
      '/docs/magicborn/morgana-the-sleeping-root#known-facts',
    );
  });
});
