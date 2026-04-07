import { test, Page } from '@playwright/test';

test('should draw graph', async ({ page }) => {
  await arrangeResultsShown(page);
  await page.click('#charts-result-set-button_0');
  await page.waitForSelector('#popup-window-loader');
  await page.isHidden('#popup-window-loader');
  await page.waitForSelector('#flot-charts-placeholder canvas.flot-base');
});

test('should show analyte tooltip', async ({ page }) => {
  await arrangeResultsShown(page);
  await page.locator('#charts-result-set-button_0').hover();
  const tooltip = await page.waitForSelector('#tooltip');
  tooltip.waitForSelector('text=Analyyttitunnus');
});

test('should show result tooltip', async ({ page }) => {
  await arrangeResultsShown(page);
  await page.waitForSelector('#flot-charts-placeholder canvas.flot-base');
  await page.waitForSelector('#no-selected-result-set-message');
  await page.click('#charts-result-set-button_0');
  await page.waitForSelector('#popup-window-loader');
  await page.isHidden('#no-selected-result-set-message');
  await page.isHidden('#popup-window-loader');
  await page.waitForTimeout(2000);
  await hoverFirstNonBgPixel(page);
  await page.waitForTimeout(500);
  const tooltip = await page.waitForSelector('#tooltip');
  tooltip.waitForSelector('text=Arvo');
});

// TODO: test for selection zooming graph
// TODO: test for mouse roller zooming graph

async function arrangeResultsShown(page) {
  await page.goto('/');

  while (await page.isVisible('text=Siirry lähemmäksi')) {
    await page.click('text=+');
  }

  await page.waitForSelector('img[alt="Marker"]');
  // TODO: Don't use eval
  await page.$$eval('img[alt="Marker"]', (markers) => {
    markers[0].click();
  });
  await page.waitForSelector('text=Paikan tiedot');
  await page.click('text=Paikan tulokset');
}

// Function to execute in the browser context
const getFirstNonBgPixel = async () => {
  const canvas = document.querySelector('canvas.flot-base') as HTMLCanvasElement;
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const imageData = ctx!.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Scan for the first non-white pixel
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    // Convert RGBA to hex
    const hex =
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex; // Pad with zero if necessary
        })
        .join('');
    if (!['#ffffff', 'd9d9d9', '#bbbbbb', '#545454', '#000000', '#525252'].includes(hex)) {
      console.log('returning non bg pixel', hex);
      // Calculate the pixel's x and y coordinates
      const x = (i / 4) % width;
      const y = Math.floor(i / 4 / width);
      return { x, y };
    }
  }

  return null;
};

const hoverFirstNonBgPixel = async (page: Page) => {
  // Execute the function in the page context and get the first non-white pixel's coordinates
  const nonWhitePixel = await page.evaluate(getFirstNonBgPixel);

  // Click on the non-white pixel if found
  if (nonWhitePixel) {
    await page.locator('canvas.flot-base').hover({
      position: { x: nonWhitePixel.x, y: nonWhitePixel.y },
      force: true,
    });
    console.log(`Hovering on pixel at (${nonWhitePixel.x}, ${nonWhitePixel.y})`);
  } else {
    throw new Error('No non bg pixel found');
  }
};
