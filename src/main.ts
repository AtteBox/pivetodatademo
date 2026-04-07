import { MarkerSymbol, Coord, SitesMapLayer, LeafletRenderer } from './map';
import { pivet } from './datasource';
import { MapUI, LayerwiseUI, ResultBrowser } from './ui';

const navigator = (globalThis as any).navigator;

$(function () {
  // this is needed, because the popu must be shown at page load for flot etc to work properly
  $('#popup-window').hide();
  const init = function (lat: number, lon: number, zoom: number) {
    const leafletRenderer = new LeafletRenderer(new Coord(lat, lon), zoom, 'map-canvas');
    const mapUi = new MapUI();

    const lang = 'fi';
    const pivetUi = new LayerwiseUI(
      mapUi,
      pivet.siteAttributeNameToUIName[lang],
      pivet.resultSetAttributeNameToUIName[lang],
      pivet.resultAttributeNameToUIName[lang],
      true,
    );
    const pivetMarkerSymbol = new MarkerSymbol('img/ImageMarker.png', 18, 19, 9, 9);
    const pivetSitesMapLayer = new SitesMapLayer(pivet.SitesQuery, pivetMarkerSymbol, leafletRenderer);
    new ResultBrowser(
      pivetSitesMapLayer,
      pivetUi,
      mapUi,
      pivet.ResultSetListQuery,
      pivet.SiteInfoQuery,
      'vedenlaatu PIVET',
    );
  };
  const defaultFin = function () {
    init(65.0, 28.0, 5);
  };
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (pos: { coords: { latitude: number; longitude: number } }) {
      init(pos.coords.latitude, pos.coords.longitude, 10);
    }, defaultFin);
  }
});
