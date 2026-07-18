// All user-visible UI text lives here, keyed by locale.
// The fi block is the single source of truth for keys: adding a language means
// adding a sibling block, and TypeScript enforces that it contains every key.
const fi = {
  'app.title': 'Vedenlaatu kartalla',
  'app.sykeApisLink': 'Syken rajapinnat',
  'map.loadingSites': 'Haetaan kohteita kartalle...',
  'map.zoomCloserToSee': 'Siirry lähemmäksi nähdäksesi {layerName} kohteet',
  'layer.pivetName': 'vedenlaatu PIVET',
  'popup.loading': 'Haetaan tietoa...',
  'popup.tab.siteInfo': 'Paikan tiedot',
  'popup.tab.results': 'Paikan tulokset',
  'charts.selectResultsPrompt': 'Valitse tuloksia vasemmalta nähdäksesi kuvaajan',
  'charts.zoomMode': 'Kohdistustapa',
  'charts.zoomMode.selection': 'Hiiren valinta',
  'charts.zoomMode.scroll': 'Rulla ja vetäminen',
  'charts.initialExtent': 'Alkuperäinen rajaus',
  'tooltip.time': 'Aika',
  'tooltip.value': 'Arvo',
  'tooltip.uncertainty': 'Epävarmuus',
  'resultSet.depthAbbr': 'syv.',
  'error.title': 'Virhe tapahtui',
  'error.body': 'Sovelluksessa tapahtui odottamaton virhe. Kokeile toimintoa myöhemmin uudelleen.',
} as const;

export type TranslationKey = keyof typeof fi;

export type Locale = 'fi'; // future: 'fi' | 'en' | 'sv'

export const resources: { [L in Locale]: Record<TranslationKey, string> } = { fi };

export const localeToBcp47: Record<Locale, string> = { fi: 'fi-FI' };
