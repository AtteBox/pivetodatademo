import { test } from '@playwright/test';

test('should load site markers when zooming close enough', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-testid="layers-not-seen-message"]');

  while (await page.isVisible('[data-testid="layers-not-seen-message"]')) {
    await page.click('.leaflet-control-zoom-in');
  }

  await page.waitForSelector('img[alt="Marker"]');
});
