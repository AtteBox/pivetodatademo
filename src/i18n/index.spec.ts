import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, formatDateTime, getMonthShortNames, pickByLocale, resolveLocale, t } from './index';

describe('t', () => {
  it('returns the resource text for a known key', () => {
    expect(t('popup.tab.siteInfo')).toBe('Paikan tiedot');
  });

  it('interpolates named parameters', () => {
    expect(t('map.zoomCloserToSee', { layerName: 'vedenlaatu PIVET' })).toBe(
      'Siirry lähemmäksi nähdäksesi vedenlaatu PIVET kohteet',
    );
  });

  it('leaves the placeholder in place when a parameter is missing', () => {
    expect(t('map.zoomCloserToSee')).toBe('Siirry lähemmäksi nähdäksesi {layerName} kohteet');
  });

  it('falls back to the key for an unknown key', () => {
    expect(t('no.such.key' as any)).toBe('no.such.key');
  });
});

describe('resolveLocale', () => {
  it('prefers the lang query parameter', () => {
    expect(resolveLocale('?lang=fi', 'en-US')).toBe('fi');
  });

  it('falls back to the navigator language prefix', () => {
    expect(resolveLocale('', 'fi-FI')).toBe('fi');
  });

  it('returns the default locale for unsupported languages', () => {
    expect(resolveLocale('?lang=xx', 'xx-XX')).toBe(DEFAULT_LOCALE);
  });

  it('returns the default locale when nothing is requested', () => {
    expect(resolveLocale('', undefined)).toBe(DEFAULT_LOCALE);
  });
});

describe('formatDateTime', () => {
  it('formats dates in the current locale', () => {
    const formatted = formatDateTime(new Date(2019, 5, 12, 10, 30));
    expect(formatted).toContain('12.6.2019');
    expect(formatted).toContain('10.30');
  });
});

describe('getMonthShortNames', () => {
  it('returns 12 locale month names', () => {
    const names = getMonthShortNames();
    expect(names).toHaveLength(12);
    expect(names[0].toLowerCase()).toContain('tammi');
  });
});

describe('pickByLocale', () => {
  it('picks the mapping of the current locale', () => {
    expect(pickByLocale({ fi: 'suomi', en: 'english' })).toBe('suomi');
  });

  it('falls back to the default locale mapping', () => {
    expect(pickByLocale({ [DEFAULT_LOCALE]: 'oletus' })).toBe('oletus');
  });
});
