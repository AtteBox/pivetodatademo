import Handlebars from 'handlebars';

const scriptElemIdToTemplateCache = new Map();

export function renderTemplate(templateHtml: string, modelData: any) {
  let compiledTemplate = scriptElemIdToTemplateCache.get(templateHtml);
  if (compiledTemplate == null) {
    compiledTemplate = Handlebars.compile(templateHtml);
    scriptElemIdToTemplateCache.set(templateHtml, compiledTemplate);
  }
  return compiledTemplate(modelData);
}
