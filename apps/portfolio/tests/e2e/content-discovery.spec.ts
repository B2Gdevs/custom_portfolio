import { expect, test } from '@playwright/test';

test.describe('Blog and projects discovery', () => {
  test('filters the blog index and opens command palette results', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Search blog' }).fill('reader');
    await expect(page.getByText('Making the Site More Personal')).toBeVisible();

    await page.keyboard.press('Control+K');
    await expect(page.getByRole('dialog', { name: 'Search blog, projects, and listen' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Search blog, projects, and listen' }).fill('dialogue');
    await page.getByRole('button', { name: /Dialogue Forge: Interactive Narrative Builder/i }).click();

    await expect(page).toHaveURL(/\/projects\/dialogue-forge-interactive-narrative-builder$/);
    await expect(page.getByRole('heading', { name: 'Dialogue Forge: Interactive Narrative Builder' })).toBeVisible();
  });

  test('shows project filters and TOC on the detail page', async ({ page }) => {
    await page.goto('/projects');

    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Search projects' }).fill('dialogue');
    await expect(page.getByRole('link', { name: /Dialogue Forge: Interactive/i })).toBeVisible();

    await page.goto('/projects/dialogue-forge-interactive-narrative-builder');
    await expect(page.getByText('ON THIS PAGE')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Projects' }).first()).toBeVisible();
    const topLinksSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Links & Downloads' }),
    });
    await expect(topLinksSection.getByRole('link', { name: 'Open Dialogue Forge' })).toBeVisible();
  });

  test('shows the dialogue forge app shell with a visible way back to the project page', async ({ page }) => {
    await page.goto('/apps/dialogue-forge');

    await expect(page.getByRole('link', { name: 'Back to Project' })).toBeVisible();
    await expect(page.getByDisplayValue('Example: The Mysterious Stranger')).toBeVisible();
  });
});
