import { AppEvent, IDataQuery } from '../core';

export class Coord {
  lat: number;
  lng: number;
  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }

  getLat() {
    return this.lat;
  }

  getLng() {
    return this.lng;
  }
}

export class Extent {
  minCoord: Coord;
  maxCoord: Coord;
  constructor(minCoord: Coord, maxCoord: Coord) {
    this.minCoord = minCoord;
    this.maxCoord = maxCoord;
  }

  getMinCoord() {
    return this.minCoord;
  }

  getMaxCoord() {
    return this.maxCoord;
  }

  getLatMin() {
    return this.minCoord.getLat();
  }

  getLngMin() {
    return this.minCoord.getLng();
  }

  getLatMax() {
    return this.maxCoord.getLat();
  }

  getLngMax() {
    return this.maxCoord.getLng();
  }

  getScaledExtent(scale: number) {
    const diffLat = (this.maxCoord.getLat() - this.minCoord.getLat()) * 0.5 * scale;
    const diffLng = (this.maxCoord.getLng() - this.minCoord.getLng()) * 0.5 * scale;
    const avgLat = (this.maxCoord.getLat() + this.minCoord.getLat()) * 0.5;
    const avgLng = (this.maxCoord.getLng() + this.minCoord.getLng()) * 0.5;
    return new Extent(new Coord(avgLat - diffLat, avgLng - diffLng), new Coord(avgLat + diffLat, avgLng + diffLng));
  }

  equals(e2: Extent) {
    return (
      this.minCoord.getLat() === e2.getMinCoord().getLat() &&
      this.minCoord.getLng() === e2.getMinCoord().getLng() &&
      this.maxCoord.getLat() === e2.getMaxCoord().getLat() &&
      this.maxCoord.getLng() === e2.getMaxCoord().getLng()
    );
  }
}

export class MarkerSymbol {
  imageUrl: string;
  sizeX: number;
  sizeY: number;
  anchorX: number;
  anchorY: number;
  constructor(imageUrl: string, sizeX: number, sizeY: number, anchorX: number, anchorY: number) {
    this.imageUrl = imageUrl;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.anchorX = anchorX;
    this.anchorY = anchorY;
  }

  getSizeX() {
    return this.sizeX;
  }

  getSizeY() {
    return this.sizeY;
  }

  getAnchorX() {
    return this.anchorX;
  }

  getAnchorY() {
    return this.anchorY;
  }

  getImageUrl() {
    return this.imageUrl;
  }
}

export type IMapRenderer = {
  boundsChangedEvent: AppEvent<void>;
  markerHoverEvent: AppEvent<number>;
  markerClickEvent: AppEvent<number>;
  markerHoverEndEvent: AppEvent<number>;
  removeMarker: (markerId: number) => void;
  addMarker: (coord: Coord, markerSymbol: MarkerSymbol, name: string) => void;
  showMarker: (markerId: number) => void;
  hideMarker: (markerId: number) => void;
  getBounds: () => Extent;
  getScale: () => number;
};

export class Site {
  coord: Coord;
  name: string;
  id: string;
  constructor(coord: Coord, name: string, id: string) {
    this.coord = coord;
    this.name = name;
    this.id = id;
  }

  getCoord() {
    return this.coord;
  }

  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  equals(s2: Site) {
    return this.id === s2.getId();
  }
}

export type ISitesQuery = IDataQuery<Site[]> & {
  getExtent: () => Extent;
  execute: (searchCallbackFunction: (sitesQuery: ISitesQuery) => void) => void;
};
