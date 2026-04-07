import { AppEvent, DataQuery, IDataQuery } from '../core';
import { Coord, ISitesQuery, Site, Extent } from '../map';
import { IResultSetQuery, IResultSetListQuery, Result } from '../chart';
import { ISiteInfo, ISiteInfoQuery } from '../siteInfo';

const pivetServiceUri = 'https://rajapinnat.ymparisto.fi/api/vesla/2.0/odata/';

type ITextResourceMappingsByLanguage = {
  [language: string]: {
    [key: string]: string;
  };
};

export const siteAttributeNameToUIName: ITextResourceMappingsByLanguage = {
  fi: {
    Name: 'Nimi',
    Site_Id: 'Paikan ID',
    CoordinateSystem: 'Syötetty koordinaatisto',
    CoordETRSTM35FIN_North: 'Pohj-koordinaatti (ETRS-TM35FIN)',
    CoordETRSTM35FIN_East: 'Itä-koordinaatti (ETRS-TM35FIN)',
    CoordEUREFFIN_WGS84_Lat: 'Leveysaste (EUREF-FIN/WGS84)',
    CoordEUREFFIN_WGS84_Long: 'Pituusaste (EUREF-FIN/WGS84)',
    Depth_m: 'Syvyys (m)',
    EnvironmentType: 'Ympäristötyyppi',
    Municipal: 'Kunta',
    LakeCode: 'Järvitunnus',
    Lake: 'Järvi',
    WaterManagementAreaCode: 'Vesienhoitoalueen tunnus',
    WaterManagementArea: 'Vesienhoitoalueen nimi',
    WaterbasinCode: 'Valuma-alueen tunnus',
    Waterbasin: 'Valuma-alueen nimi',
    WaterbodyCode: 'Vesimuodostuman tunnus',
    Waterbody: 'Vesimuodostuman nimi',
    DateAdded: 'Lisätty pvm.',
    SiteRadius_m: 'Paikan säde',
    HelcomSubbasinCode: 'Helcom alue (koodi)',
    HelcomSubbasin: 'Helcom alue',
    HelcomCoastalAreaCode: 'Helcom rannikkoalue (koodi)',
    HelcomCoastalArea: 'Helcom rannikkoalue',
  },
};

export const resultAttributeNameToUIName: ITextResourceMappingsByLanguage = {
  fi: {
    Sampling_id: 'Näytteenoton ID',
    SampleDepth_m: 'Syvyys (m)',
    SampleDepthUpper_m: 'Syvyys ylhäällä (m)',
    SampleDepthLower_m: 'Syvyys alhaalla (m)',
    Sample_Id: 'Näytteen ID',
    Determination_Id: 'Määritysm. ID',
    Flag: 'Lippu',
    AnalyteCode: 'Analyyttitunnus',
    AnalyteNameFI: 'Analyytin nimi',
    DeterminationCode: 'Määritysm. tunnus',
    DeterminationNameFI: 'Määritysm. nimi',
  },
};

export const resultSetAttributeNameToUIName: ITextResourceMappingsByLanguage = {
  fi: {
    AnalyteNameFI: 'Analyytin nimi',
    AnalyteCode: 'Analyyttitunnus',
    SampleDepthUpper_m: 'Syvyys ylhäällä (m)',
    SampleDepthLower_m: 'Syvyys alhaalla (m)',
    Unit: 'Yksikkö',
  },
};

export class SitesQuery extends DataQuery<Site[]> implements ISitesQuery {
  #extent: Extent;
  constructor(extent: Extent) {
    super();
    this.#extent = extent;
  }

  getExtent() {
    return this.#extent;
  }

  execute(searchCallbackFunction: (sitesQuery: ISitesQuery) => void) {
    const strLatMin = this.#extent.getLatMin().toString();
    const strLatMax = this.#extent.getLatMax().toString();
    const strLngMin = this.#extent.getLngMin().toString();
    const strLngMax = this.#extent.getLngMax().toString();

    const firstRequestUri =
      pivetServiceUri +
      'Site_Wide?' +
      '$select=Name,Site_Id,CoordEUREFFIN_WGS84_Lat,CoordEUREFFIN_WGS84_Long&' +
      '$filter=CoordEUREFFIN_WGS84_Lat%20ge%20' +
      strLatMin +
      'M%20and%20CoordEUREFFIN_WGS84_Lat%20le%20' +
      strLatMax +
      'M%20and%20CoordEUREFFIN_WGS84_Long%20ge%20' +
      strLngMin +
      'M%20and%20CoordEUREFFIN_WGS84_Long%20le%20' +
      strLngMax +
      'M';

    this.#queryPivetSitesByRequestUri(firstRequestUri, [], () => searchCallbackFunction(this));
  }

  async #queryPivetSitesByRequestUri(
    requestUri: string,
    sitesFromPreviousPages: Site[],
    dataLoadedCallbackFunction: () => void,
  ) {
    try {
      const response = await fetch(requestUri);
      const data = (await response.json()) as { value: any; 'odata.nextLink': string };
      for (const key in data['value']) {
        const pivetSiteData = data.value[key];
        const coordLat = parseFloat(pivetSiteData.CoordEUREFFIN_WGS84_Lat.replace(',', '.'));
        const coordLng = parseFloat(pivetSiteData.CoordEUREFFIN_WGS84_Long.replace(',', '.'));
        const site = new Site(new Coord(coordLat, coordLng), pivetSiteData.Name, pivetSiteData.Site_Id);
        sitesFromPreviousPages.push(site);
      }
      if (data['odata.nextLink']) {
        const requestUri = data['odata.nextLink'];
        this.#queryPivetSitesByRequestUri(requestUri, sitesFromPreviousPages, dataLoadedCallbackFunction);
      } else {
        this.data = sitesFromPreviousPages;
        dataLoadedCallbackFunction();
      }
    } catch (err) {
      console.error('Error in SitesQuery > queryPivetSitesByRequestUri', err);
      this.error = JSON.stringify(err);
      dataLoadedCallbackFunction();
    }
  }
}

export class ResultSetQuery extends DataQuery<Result[]> implements IResultSetQuery {
  #analyteCode: string;
  #lowerDepth: string | null;
  #upperDepth: string | null;
  #unit: string;
  #infoObj: {};
  #siteId: number;
  constructor(
    siteId: number,
    analyteCode: string,
    lowerDepth: string | null,
    upperDepth: string | null,
    unit: string,
    infoObj: {},
  ) {
    super();
    this.#siteId = siteId;
    this.#analyteCode = analyteCode;
    this.#lowerDepth = lowerDepth;
    this.#upperDepth = upperDepth;
    this.#unit = unit;
    this.#infoObj = infoObj;
  }

  execute(callback: (dataQuery: IResultSetQuery) => void): void {
    const strUpperDepth = this.#upperDepth !== null ? this.#upperDepth + 'M' : 'null';
    const strLowerDepth = this.#lowerDepth !== null ? this.#lowerDepth + 'M' : 'null';

    const firstRequestUri =
      pivetServiceUri +
      'Result_Wide?' +
      '$select=Time,Value,Unit,Uncertainty,Sampling_id,SampleDepth_m,SampleDepthUpper_m,SampleDepthLower_m,Sample_Id,Determination_Id,Flag,AnalyteCode,AnalyteNameFI,DeterminationCode,DeterminationNameFI&' +
      '$filter=Site_Id%20eq%20' +
      this.#siteId +
      "%20and%20AnalyteCode%20eq%20'" +
      this.#analyteCode +
      "'%20and%20SampleDepthLower_m%20eq%20" +
      strLowerDepth +
      '%20and%20SampleDepthUpper_m%20eq%20' +
      strUpperDepth +
      '';
    this.#queryPivetResultsByRequestUri(firstRequestUri, [], () => callback(this));
  }

  async #queryPivetResultsByRequestUri(
    requestUri: string,
    collectedData: Result[],
    dataLoadedCallbackFunction: () => void,
  ) {
    try {
      const request = await fetch(requestUri);
      const data = (await request.json()) as { value: { [key: string]: any }[]; 'odata.nextLink': string };
      for (const key in data['value']) {
        const pivetResultData = data['value'][key];
        const addInfoAttributes: { [key: string]: string | number } = {};
        for (const key in pivetResultData) {
          const value = pivetResultData[key];
          if (
            (typeof value === 'string' || typeof value === 'number') &&
            key !== 'Value' &&
            key !== 'Time' &&
            key !== 'Unit' &&
            key !== 'Uncertainty'
          ) {
            addInfoAttributes[key] = value;
          }
        }
        const result = new Result(
          pivetResultData.Value,
          dateFromXMLDateTimeString(pivetResultData.Time),
          pivetResultData.Unit,
          pivetResultData.Uncertainty,
          addInfoAttributes,
        );
        collectedData.push(result);
      }
      if (data['odata.nextLink']) {
        const requestUri = data['odata.nextLink'];
        this.#queryPivetResultsByRequestUri(requestUri, collectedData, dataLoadedCallbackFunction);
      } else {
        this.data = collectedData;
        dataLoadedCallbackFunction();
      }
    } catch (err) {
      console.error('Error in ResultSetQuery > queryPivetResultsByRequestUri', err);
      this.error = JSON.stringify(err);
      dataLoadedCallbackFunction();
    }
  }

  isResultSearchReady() {
    return this.data != null;
  }

  getLabel() {
    return `${this.#analyteCode.trim()} ${this.#unit != null && this.#unit !== '' ? `(${this.#unit})` : ''} syv. ${this.#upperDepth}${this.#lowerDepth !== null ? ' - ' + this.#lowerDepth : ''} m`;
  }

  getInfoObj() {
    return this.#infoObj;
  }
}

//https://stackoverflow.com/a/8178739
function dateFromXMLDateTimeString(s: string) {
  const bits = s.split(/[-T:+]/g);
  const d = new Date(parseInt(bits[0]), parseInt(bits[1]) - 1, parseInt(bits[2]));
  d.setHours(parseInt(bits[3]), parseInt(bits[4]), parseInt(bits[5]));

  // Get supplied time zone offset in minutes
  let offsetMinutes = parseInt(bits[6]) * 60 + Number(bits[7]);
  const sign = /\d\d-\d\d:\d\d$/.test(s) ? '-' : '+';

  // Apply the sign
  offsetMinutes = 0 + (sign == '-' ? -1 * offsetMinutes : offsetMinutes);

  // Apply offset and local timezone
  d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset());

  // d is now a local time equivalent to the supplied time
  return d;
}

type IResultSetListQueryState = Map<string, IResultSetQuery>;

export class ResultSetListQuery extends DataQuery<IResultSetListQueryState> implements IResultSetListQuery {
  #siteId: number;
  constructor(siteId: number) {
    super();
    this.#siteId = siteId;
  }

  getAllResultSets() {
    return Array.from(this.data?.values() ?? []);
  }

  getResultSetByLabel(label: string) {
    for (const resultSet of this.data?.values() ?? []) {
      if (resultSet.getLabel() == label) {
        return resultSet;
      }
    }
    return null;
  }

  execute(callback: (dataQuery: ResultSetListQuery) => void): void {
    const firstRequestUri =
      pivetServiceUri +
      'Result_Wide?' +
      '$select=AnalyteNameFI,AnalyteCode,SampleDepthUpper_m,SampleDepthLower_m,Unit&' +
      '$filter=Site_Id%20eq%20' +
      this.#siteId;
    this.#queryPivetResultSetsByRequestUri(firstRequestUri, new Map(), () => callback(this));
  }

  async #queryPivetResultSetsByRequestUri(
    requestUri: string,
    collectedData: IResultSetListQueryState,
    readyLoadingCallback: () => void,
  ) {
    try {
      const response = await fetch(requestUri);
      const data = (await response.json()) as { value: { [key: string]: any }[]; 'odata.nextLink': string };
      for (const key in data['value']) {
        const pivetResultData = data['value'][key];
        const resultSetKey: string = JSON.stringify([
          pivetResultData.SampleDepthUpper_m,
          pivetResultData.SampleDepthLower_m,
          pivetResultData.AnalyteCode,
          pivetResultData.Unit,
        ]);
        if (!this.data?.has(resultSetKey)) {
          const addInfoAttributes: { [key: string]: string | number } = {};
          Object.entries(pivetResultData).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number') {
              addInfoAttributes[key] = value;
            }
          });
          const resultSet = new ResultSetQuery(
            this.#siteId,
            pivetResultData.AnalyteCode,
            pivetResultData.SampleDepthLower_m,
            pivetResultData.SampleDepthUpper_m,
            pivetResultData.Unit,
            addInfoAttributes,
          );
          collectedData.set(resultSetKey, resultSet);
        }
      }
      if (data['odata.nextLink']) {
        const requestUri = data['odata.nextLink'];
        this.#queryPivetResultSetsByRequestUri(requestUri, collectedData, readyLoadingCallback);
      } else {
        this.data = collectedData;
        readyLoadingCallback();
      }
    } catch (err) {
      console.error('Error in ResultSetListQuery > queryPivetResultSetsByRequestUri', err);
      this.error = JSON.stringify(err);
      readyLoadingCallback();
    }
  }
}

export class SiteInfoQuery extends DataQuery<ISiteInfo> implements ISiteInfoQuery {
  #siteId: number;
  siteInfoSearchFailedEvent: AppEvent<string>;

  constructor(siteId: number) {
    super();
    this.#siteId = siteId;
    this.siteInfoSearchFailedEvent = new AppEvent();
  }

  execute(callback: (dataQuery: IDataQuery<ISiteInfo>) => void): void {
    const queryData = async () => {
      const requestUri = pivetServiceUri + 'Site_Wide?' + '$filter=Site_Id%20eq%20' + this.#siteId;
      try {
        const response = await fetch(requestUri);
        const data = (await response.json()) as { value: { [key: string]: any }[] };
        if (data['value'].length < 1) {
          this.siteInfoSearchFailedEvent.trigger('Site with id ' + this.#siteId + ' not found');
        } else {
          // pick only the fields that are in the siteAttributeNameToUIName.fi and Site_Id:
          const selectedFields = new Set([...Object.keys(siteAttributeNameToUIName.fi), 'Site_Id']);
          const selectedSiteData = Object.entries(data['value'][0]).reduce<Partial<ISiteInfo>>((acc, [key, value]) => {
            if (selectedFields.has(key)) {
              acc[key] = value;
            }
            return acc;
          }, {}) as ISiteInfo;
          this.data = selectedSiteData;
        }
        callback(this);
      } catch (err) {
        console.error('Error in SiteInfoQuery > execute', err);
        this.error = JSON.stringify(err);
        callback(this);
      }
    };
    queryData();
  }

  getSiteId() {
    return this.#siteId;
  }
}
