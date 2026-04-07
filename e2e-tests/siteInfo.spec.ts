import { test } from '@playwright/test';

test('should show site info when clicking on marker', async ({ page }) => {
  await arrangeMarkersOnMap(page);
  // TODO: Don't use eval or browsers click function
  await page.$$eval('img[alt="Marker"]', (markers) => {
    (markers[0] as any).click();
  });
  await page.waitForSelector('text=Paikan tiedot');
  await page.waitForSelector('text=Paikan ID');
  await page.waitForSelector('text=Nimi');
});

async function arrangeMarkersOnMap(page) {
  await page.goto('/');

  while (await page.isVisible('text=Siirry lähemmäksi')) {
    await page.click('text=+');
  }

  await page.waitForSelector('img[alt="Marker"]');
}
