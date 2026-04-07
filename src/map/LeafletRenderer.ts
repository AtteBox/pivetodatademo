import L, { Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Coord, Extent, IMapRenderer } from './common';
import { AppEvent } from '../core';

// Fix Leaflet default marker icons not loading in production builds
const defaultIcon = new L.Icon({
  ...L.Icon.Default.prototype.options,
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
L.Marker.prototype.options.icon = defaultIcon;

export class LeafletRenderer implements IMapRenderer {
  markers: Map<number, Marker>;
  nextMarkerId: number;
  boundsChangedEvent: AppEvent<void>;
  markerHoverEvent: AppEvent<number>;
  markerClickEvent: AppEvent<number>;
  map: L.Map;
  markerHoverEndEvent: AppEvent<number>;
  constructor(coordStart: { getLat: () => any; getLng: () => any }, zoomStart: any, mapDivId: any) {
    this.markers = new Map();
    this.nextMarkerId = 0;

    const mapOptions = {
      center: { lat: coordStart.getLat(), lng: coordStart.getLng() },
      zoom: zoomStart,
    };

    this.boundsChangedEvent = new AppEvent();
    this.markerHoverEvent = new AppEvent();
    this.markerHoverEndEvent = new AppEvent();
    this.markerClickEvent = new AppEvent();

    this.map = L.map(mapDivId, mapOptions);

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on('moveend', () => this.boundsChangedEvent.trigger());
  }

  getScale() {
    // Define the zoom-to-scale mapping
    const dictGoogleZoomToScale: { [zoomLevel: string]: number } = {
      20: 1128.49722,
      19: 2256.99444,
      18: 4513.98888,
      17: 9027.977761,
      16: 18055.95552,
      15: 36111.91104,
      14: 72223.82209,
      13: 144447.6442,
      12: 288895.2884,
      11: 577790.5767,
      10: 1155581.153,
      9: 2311162.307,
      8: 4622324.614,
      7: 9244649.227,
      6: 18489298.45,
      5: 36978596.91,
      4: 73957193.82,
      3: 147914387.6,
      2: 295828775.3,
      1: 591657550.5,
    };

    const zoom = this.map.getZoom();
    if (zoom < 1 || zoom > 20) return Number.NaN;
    return dictGoogleZoomToScale[zoom.toString()];
  }

  getBounds() {
    const bounds = this.map.getBounds();
    const maxCoords = bounds.getNorthEast();
    const minCoords = bounds.getSouthWest();
    const extent = new Extent(new Coord(minCoords.lat, minCoords.lng), new Coord(maxCoords.lat, maxCoords.lng));
    return extent;
  }

  addMarker(coord: Coord) {
    const marker = L.marker([coord.getLat(), coord.getLng()]).addTo(this.map);

    const markerId = this.nextMarkerId++;
    this.markers.set(markerId, marker);

    marker.on('click', () => this.markerClickEvent.trigger(markerId));
    marker.on('mouseover', () => this.markerHoverEvent.trigger(markerId));
    marker.on('mouseout', () => this.markerHoverEndEvent.trigger(markerId));

    return markerId;
  }

  hideMarker(markerId: number) {
    const marker = this.markers.get(markerId);
    if (marker) this.map.removeLayer(marker);
  }

  showMarker(markerId: number) {
    const marker = this.markers.get(markerId);
    if (marker) marker.addTo(this.map);
  }

  removeMarker(markerId: number) {
    const marker = this.markers.get(markerId);
    if (marker) {
      this.map.removeLayer(marker);
      this.markers.delete(markerId);
    }
  }
}
