import Handlebars from 'handlebars';

import { t, TranslationKey } from '../i18n';

// Registered before any Handlebars.compile call, since this is the only
// module that compiles templates. Usage: {{t 'some.key' param=value}}
Handlebars.registerHelper('t', function (key: string, options: Handlebars.HelperOptions) {
  return t(key as TranslationKey, options.hash);
});

const scriptElemIdToTemplateCache = new Map();

export function renderTemplate(templateHtml: string, modelData: any) {
  let compiledTemplate = scriptElemIdToTemplateCache.get(templateHtml);
  if (compiledTemplate == null) {
    compiledTemplate = Handlebars.compile(templateHtml);
    scriptElemIdToTemplateCache.set(templateHtml, compiledTemplate);
  }
  return compiledTemplate(modelData);
}
