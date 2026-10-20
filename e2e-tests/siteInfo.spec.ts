import { test } from '@playwright/test';

import { siteAttributeNameToUIName } from '../src/datasource/pivetLabels';

test('should show site info when clicking on marker', async ({ page }) => {
  await arrangeMarkersOnMap(page);
  // TODO: Don't use eval or browsers click function
  await page.$$eval('img[alt="Marker"]', (markers) => {
    (markers[0] as any).click();
  });
  await page.waitForSelector('[data-testid="tab-site-info"]');
  await page.waitForSelector('text=' + siteAttributeNameToUIName.fi.Site_Id);
  await page.waitForSelector('text=' + siteAttributeNameToUIName.fi.Name);
});

async function arrangeMarkersOnMap(page) {
  await page.goto('/');

  while (await page.isVisible('[data-testid="layers-not-seen-message"]')) {
    await page.click('.leaflet-control-zoom-in');
  }

  await page.waitForSelector('img[alt="Marker"]');
}
