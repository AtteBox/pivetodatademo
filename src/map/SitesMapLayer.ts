import { AppEvent } from '../core';
import { Extent, IMapRenderer, ISitesQuery, MarkerSymbol, Site } from './common';

export class SitesMapLayer {
  // TODO: Replace any with the correct types
  SitesQueryType: { new (extent: Extent): ISitesQuery };
  markerSymbol: MarkerSymbol;
  mapRendererObject: IMapRenderer;
  loadSitesExtentScale: number;
  showSitesScale: number;
  maxSiteCountLoaded: number;
  markersAreHidden: boolean;
  dictSiteIdToMarkerId: Map<any, any>;
  dictSiteIdToSite: Map<any, any>;
  dictQueryExtentToSiteIds: Map<any, any>;
  earlierQueryExtents: Extent[];
  siteClickEvent: AppEvent<number>;
  siteHoverEvent: AppEvent<number>;
  siteHoverEndEvent: AppEvent<number>;
  errorEvent: AppEvent<unknown>;
  sitesLoadingEvent: AppEvent<void>;
  sitesLoadingReadyEvent: AppEvent<void>;
  startLayerSeenEvent: AppEvent<void>;
  endLayerSeenEvent: AppEvent<void>;

  constructor(
    SitesQueryType: { new (extent: Extent): ISitesQuery },
    markerSymbol: MarkerSymbol,
    mapRendererObject: IMapRenderer,
    loadSitesExtentScale_Optional = 1.5,
    showSitesScale_Optional = 500000,
    maxSiteCountLoaded_Optional = 3000,
  ) {
    this.SitesQueryType = SitesQueryType;
    this.markerSymbol = markerSymbol;
    this.mapRendererObject = mapRendererObject;
    this.loadSitesExtentScale = loadSitesExtentScale_Optional;
    this.showSitesScale = showSitesScale_Optional;
    this.maxSiteCountLoaded = maxSiteCountLoaded_Optional;
    this.markersAreHidden = true;
    this.dictSiteIdToMarkerId = new Map();
    this.dictSiteIdToSite = new Map();
    this.dictQueryExtentToSiteIds = new Map();
    this.earlierQueryExtents = [];

    // Bind events
    mapRendererObject.boundsChangedEvent.addListener(this.onBoundsChanged.bind(this));
    mapRendererObject.markerClickEvent.addListener(this.onMarkerClick.bind(this));
    mapRendererObject.markerHoverEvent.addListener(this.onMarkerHover.bind(this));
    mapRendererObject.markerHoverEndEvent.addListener(this.onMarkerHoverEnd.bind(this));

    // Initialize events
    this.siteClickEvent = new AppEvent();
    this.siteHoverEvent = new AppEvent();
    this.siteHoverEndEvent = new AppEvent();
    this.errorEvent = new AppEvent();
    this.sitesLoadingEvent = new AppEvent();
    this.sitesLoadingReadyEvent = new AppEvent();
    this.startLayerSeenEvent = new AppEvent();
    this.endLayerSeenEvent = new AppEvent();
  }

  getSiteIdByMarkerId(markerId: number) {
    for (const [siteId, storedMarkerId] of this.dictSiteIdToMarkerId.entries()) {
      if (storedMarkerId === markerId) return siteId;
    }
    return null;
  }

  onMarkerClick = (markerId: number) => {
    const siteId = this.getSiteIdByMarkerId(markerId);
    this.siteClickEvent.trigger(siteId);
  };

  onMarkerHover = (markerId: number) => {
    const site = this.dictSiteIdToSite.get(this.getSiteIdByMarkerId(markerId));
    this.siteHoverEvent.trigger(site);
  };

  onMarkerHoverEnd = (markerId: number) => {
    const site = this.dictSiteIdToSite.get(this.getSiteIdByMarkerId(markerId));
    this.siteHoverEndEvent.trigger(site);
  };

  onBoundsChanged = () => {
    const scale = this.mapRendererObject.getScale();
    if (scale < this.showSitesScale) {
      if (this.markersAreHidden) this.showAllMarkers();
      const boundsExtent = this.mapRendererObject.getBounds();
      const extentIsInsideEarlierExtents = this.earlierQueryExtents.some(
        (earlierQueryExtent) =>
          earlierQueryExtent.getLatMax() >= boundsExtent.getLatMax() &&
          earlierQueryExtent.getLngMax() >= boundsExtent.getLngMax() &&
          earlierQueryExtent.getLatMin() <= boundsExtent.getLatMin() &&
          earlierQueryExtent.getLngMin() <= boundsExtent.getLngMin(),
      );

      if (!extentIsInsideEarlierExtents) {
        console.log('The bounds are out of earlier bounds');
        const scaledExtent = boundsExtent.getScaledExtent(this.loadSitesExtentScale);

        this.earlierQueryExtents.push(scaledExtent);
        const sitesQuery = new this.SitesQueryType(scaledExtent);
        this.sitesLoadingEvent.trigger();
        sitesQuery.execute(this.sitesQuery_Callback.bind(this));
      }
    } else {
      if (!this.markersAreHidden) this.hideAllMarkers();
    }
  };

  sitesQuery_Callback = (sitesQuery: ISitesQuery) => {
    this.sitesLoadingReadyEvent.trigger();

    if (sitesQuery.getError() === null) {
      this.addSites(sitesQuery.getData()!, sitesQuery.getExtent());
    } else {
      this.removeExtentFromEarlierQueryExtents(sitesQuery.getExtent());
      this.errorEvent.trigger(sitesQuery.getError());
    }
  };

  hideAllMarkers = () => {
    Array.from(this.dictSiteIdToMarkerId.values()).forEach((markerId) => {
      this.mapRendererObject.hideMarker(markerId);
    });
    this.markersAreHidden = true;
    this.endLayerSeenEvent.trigger();
  };

  showAllMarkers = () => {
    Array.from(this.dictSiteIdToMarkerId.values()).forEach((markerId) => {
      this.mapRendererObject.showMarker(markerId);
    });
    this.markersAreHidden = false;
    this.startLayerSeenEvent.trigger();
  };

  addSites = (siteArray: Site[], extent: Extent) => {
    if (!this.markersAreHidden && this.earlierQueryExtents.includes(extent)) {
      siteArray.forEach((site) => {
        if (!this.dictSiteIdToMarkerId.has(site.getId())) {
          const markerId = this.mapRendererObject.addMarker(site.getCoord(), this.markerSymbol, site.getName());
          this.dictSiteIdToMarkerId.set(site.getId(), markerId);
          this.dictSiteIdToSite.set(site.getId(), site);
        }
      });

      this.dictQueryExtentToSiteIds.set(
        extent,
        siteArray.map((site) => site.getId()),
      );

      // Remove sites if there are too many
      while (this.dictSiteIdToMarkerId.size > this.maxSiteCountLoaded) {
        this.removeEarliestQueryExtentAndLoadedIds(extent);
      }
    } else {
      // Remove extent because sites are not loaded after all
      this.removeExtentFromEarlierQueryExtents(extent);
    }
  };

  removeEarliestQueryExtentAndLoadedIds = (justLoadedExtentNotToBeRemovedInAnyCase: Extent) => {
    const removableExtent = this.earlierQueryExtents.shift();
    if (removableExtent && removableExtent !== justLoadedExtentNotToBeRemovedInAnyCase) {
      console.log('Removed extent.');
      const siteIds = this.dictQueryExtentToSiteIds.get(removableExtent);
      if (siteIds !== null) {
        for (const i in siteIds) {
          const id = siteIds[i];

          const markerId = this.dictSiteIdToMarkerId.get(id);

          if (markerId !== null) {
            //remove marker
            this.mapRendererObject.removeMarker(markerId);
            this.dictSiteIdToMarkerId.delete(id);
            this.dictSiteIdToSite.delete(id);
            console.log('Removed site with id: ' + id);
          }
        }
        this.dictQueryExtentToSiteIds.delete(removableExtent);
      }
    }
  };

  removeExtentFromEarlierQueryExtents = (extent: Extent) => {
    const index = this.earlierQueryExtents.indexOf(extent);
    if (index > -1) this.earlierQueryExtents.splice(index, 1);
  };
}
