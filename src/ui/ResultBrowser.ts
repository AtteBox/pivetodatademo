import { SitesMapLayer } from '../map';
import { IResultSetListQuery } from '../chart';
import { ISiteInfoQuery } from '../siteInfo';
import { ILayerWiseUI } from './LayerwiseUI';
import { IMapUI } from './MapUI';

export class ResultBrowser {
  private siteIdOpen: number | null = null;

  constructor(
    private sitesMapLayer: SitesMapLayer,
    private layerWiseUI: ILayerWiseUI,
    private mapUI: IMapUI,
    private ResultSetListQueryType: new (siteId: number) => IResultSetListQuery,
    private SiteInfoQueryType: any,
    private layerName: string,
  ) {
    this.bindEvents();
    this.mapUI.startLayerNotSeenIndicator(layerName);
  }

  private bindEvents() {
    this.layerWiseUI.errorEvent.addListener(this.layerWiseUI_onError);
    this.layerWiseUI.navigateToResultsEvent.addListener(this.layerWiseUI_onNavigateToResults);
    this.layerWiseUI.navigateToSiteInfoEvent.addListener(this.layerWiseUI_onNavigateToSiteInfo);

    this.sitesMapLayer.errorEvent.addListener(this.sitesMapLayer_onError);
    this.sitesMapLayer.siteClickEvent.addListener(this.sitesMapLayer_onSiteClick);
    this.sitesMapLayer.sitesLoadingEvent.addListener(() => this.mapUI.startLoadingIndicator());
    this.sitesMapLayer.sitesLoadingReadyEvent.addListener(() => this.mapUI.endLoadingIndicator());
    this.sitesMapLayer.startLayerSeenEvent.addListener(() => this.mapUI.endLayerNotSeenIndicator(this.layerName));
    this.sitesMapLayer.endLayerSeenEvent.addListener(() => this.mapUI.startLayerNotSeenIndicator(this.layerName));
  }

  private sitesMapLayer_onError = (error: unknown) => {
    console.error('Error in ResultBrowser > sitesMapLayer_onError', error);
    this.mapUI.showAppErrMsg();
  };

  private layerWiseUI_onError = (error: unknown) => {
    console.error('Error in ResultBrowser > layerWiseUI_onError', error);
    console.error(error);
    this.mapUI.showAppErrMsg();
  };

  private layerWiseUI_onNavigateToResults = () => {
    this.mapUI.startPopupLoadingIndicator();
    const resultSetListQuery = new this.ResultSetListQueryType(this.siteIdOpen!);
    resultSetListQuery.execute(this.resultSetListQuery_Callback);
  };

  private resultSetListQuery_Callback = (resultSetListQuery: any) => {
    this.mapUI.endPopupLoadingIndicator();
    if (resultSetListQuery.getError() === null) {
      const resultSets = resultSetListQuery.getAllResultSets();
      resultSets.sort((rs1: any, rs2: any) => rs1.getLabel().localeCompare(rs2.getLabel()));
      this.layerWiseUI.showResults(resultSets);
    } else {
      this.mapUI.showAppErrMsg();
    }
  };

  private layerWiseUI_onNavigateToSiteInfo = () => {
    this.mapUI.startPopupLoadingIndicator();
    const siteInfoQuery = new this.SiteInfoQueryType(this.siteIdOpen);
    siteInfoQuery.execute(this.siteInfoQuery_Callback);
  };

  private siteInfoQuery_Callback = (siteInfoQuery: ISiteInfoQuery) => {
    this.mapUI.endPopupLoadingIndicator();
    if (siteInfoQuery.getError() === null) {
      this.layerWiseUI.showSiteInfo(siteInfoQuery.getData()!);
    } else {
      this.mapUI.showAppErrMsg();
    }
  };

  private sitesMapLayer_onSiteClick = (siteId: number) => {
    this.siteIdOpen = siteId;
    this.layerWiseUI_onNavigateToSiteInfo();
  };
}
