import { ITextResourceMappingsByLanguage } from '../i18n';

// UI labels for PIVET API fields, keyed by language. Kept in a module with no
// browser dependencies so that e2e tests can import the expected labels too.
// The keys mirror the OData $select field names used in ./pivet.ts.

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
