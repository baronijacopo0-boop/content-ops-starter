import { expect, test } from '@playwright/test';

const PAGES = [
  '/dashboard',
  '/deals',
  '/analyze',
  '/listings/new',
  '/listings',
  '/inventory',
  '/sales',
  '/watchlist',
  '/analytics',
  '/guide',
  '/calculator',
  '/profile',
  '/settings',
];

test('mobile: nessun overflow orizzontale e bottom navigation', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /account demo/ }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('link', { name: 'Deals' })).toBeVisible();
  for (const p of PAGES) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `overflow on ${p}`).toBeLessThanOrEqual(1);
  }
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await expect(page.getByRole('link', { name: 'Calcolatore Profitto' })).toBeVisible();
});
