import { test } from '@playwright/test';

test('should load site markers when zooming close enough', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('text=Siirry lähemmäksi');

  while (await page.isVisible('text=Siirry lähemmäksi')) {
    await page.click('text=+');
  }

  await page.waitForSelector('img[alt="Marker"]');
});
