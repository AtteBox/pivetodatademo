import { describe, it, expect } from 'vitest';
import { Coord, Extent, Site, MarkerSymbol } from './common';

describe('Map > Common', () => {
  it('creates and accesses Coord properties correctly', () => {
    const coord = new Coord(50.5, -120.5);
    expect(coord.getLat()).toBe(50.5);
    expect(coord.getLng()).toBe(-120.5);
  });

  it('calculates scaled Extent correctly', () => {
    const minCoord = new Coord(0, 0);
    const maxCoord = new Coord(100, 100);
    const extent = new Extent(minCoord, maxCoord);
    const scaledExtent = extent.getScaledExtent(0.5);

    expect(scaledExtent.getMinCoord().getLat()).toBe(25);
    expect(scaledExtent.getMaxCoord().getLat()).toBe(75);
  });

  it('compares two Site instances correctly', () => {
    const coord = new Coord(50.5, -120.5);
    const site1 = new Site(coord, 'SiteName', 'SiteID');
    const site2 = new Site(coord, 'SiteName', 'SiteID');
    const site3 = new Site(coord, 'AnotherSiteName', 'AnotherSiteID');

    expect(site1.equals(site2)).toBe(true);
    expect(site1.equals(site3)).toBe(false);
  });

  it('verifies MarkerSymbol attributes', () => {
    const symbol = new MarkerSymbol('url/to/image.png', 100, 50, 10, 25);
    expect(symbol.getImageUrl()).toBe('url/to/image.png');
    expect(symbol.getSizeX()).toBe(100);
    expect(symbol.getSizeY()).toBe(50);
    expect(symbol.getAnchorX()).toBe(10);
    expect(symbol.getAnchorY()).toBe(25);
  });
});
