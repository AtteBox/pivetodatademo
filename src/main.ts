import { MarkerSymbol, Coord, SitesMapLayer, LeafletRenderer } from './map';
import { pivet } from './datasource';
import { applyDomTranslations, getLocale, pickByLocale, resolveLocale, setLocale, t } from './i18n';
import { MapUI, LayerwiseUI, ResultBrowser } from './ui';

const navigator = (globalThis as any).navigator;
const document = (globalThis as any).document;

$(function () {
  setLocale(resolveLocale());
  document.documentElement.lang = getLocale();
  document.title = t('app.title');
  applyDomTranslations(document);

  // this is needed, because the popu must be shown at page load for flot etc to work properly
  $('#popup-window').hide();
  const init = function (lat: number, lon: number, zoom: number) {
    const leafletRenderer = new LeafletRenderer(new Coord(lat, lon), zoom, 'map-canvas');
    const mapUi = new MapUI();

    const pivetUi = new LayerwiseUI(
      mapUi,
      pickByLocale(pivet.siteAttributeNameToUIName),
      pickByLocale(pivet.resultSetAttributeNameToUIName),
      pickByLocale(pivet.resultAttributeNameToUIName),
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
      t('layer.pivetName'),
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
