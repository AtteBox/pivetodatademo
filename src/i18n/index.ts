import { Locale, TranslationKey, localeToBcp47, resources } from './resources';

export type { Locale, TranslationKey } from './resources';
export { resources, localeToBcp47 } from './resources';

export type ITextResourceMappingsByLanguage = {
  [language: string]: {
    [key: string]: string;
  };
};

export const DEFAULT_LOCALE: Locale = 'fi';

// The locale is fixed for the lifetime of the page: it is resolved once at
// startup and a future language picker would reload with ?lang=. This keeps
// every locale-dependent value (compiled template output, result set labels,
// cached date formatters) internally consistent without invalidation logic.
let currentLocale: Locale = DEFAULT_LOCALE;
let dateTimeFormat: Intl.DateTimeFormat | null = null;

export function resolveLocale(
  search: string = (globalThis as any).location?.search ?? '',
  navigatorLanguage: string | undefined = (globalThis as any).navigator?.language,
): Locale {
  const requested = new URLSearchParams(search).get('lang') ?? navigatorLanguage?.split('-')[0];
  if (requested != null && requested in resources) {
    return requested as Locale;
  }
  return DEFAULT_LOCALE;
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  dateTimeFormat = null;
}

export function getLocale() {
  return currentLocale;
}

export function t(key: TranslationKey, params?: { [name: string]: string | number }): string {
  const text = resources[currentLocale][key] ?? resources[DEFAULT_LOCALE][key];
  if (text == null) {
    console.warn('Missing translation for key', key);
    return key;
  }
  return text.replace(/\{(\w+)\}/g, (placeholder, name) =>
    params?.[name] != null ? String(params[name]) : placeholder,
  );
}

export function formatDateTime(date: Date): string {
  if (dateTimeFormat == null) {
    dateTimeFormat = new Intl.DateTimeFormat(localeToBcp47[currentLocale], {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
  return dateTimeFormat.format(date);
}

export function getMonthShortNames(): string[] {
  const format = new Intl.DateTimeFormat(localeToBcp47[currentLocale], { month: 'short' });
  const names = [];
  for (let month = 0; month < 12; month++) {
    names.push(format.format(new Date(2000, month, 1)));
  }
  return names;
}

export function pickByLocale<T>(mappingsByLanguage: { [language: string]: T }): T {
  return mappingsByLanguage[currentLocale] ?? mappingsByLanguage[DEFAULT_LOCALE];
}

export function applyDomTranslations(root: {
  querySelectorAll: (selector: string) => Iterable<{ textContent: string; getAttribute: (name: string) => string }>;
}) {
  for (const elem of root.querySelectorAll('[data-i18n]')) {
    elem.textContent = t(elem.getAttribute('data-i18n') as TranslationKey);
  }
}
