/**
 * Custom Vite plugin to convert handlebar templates to JS
 */

const fileRegex = /\.(hbs)$/;

export default function handlebarTemplates() {
  return {
    name: 'transform-handlebar-templates',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileHandlebarsTemplateToJS(src),
          map: null, // provide source map if available
        };
      }
    },
  };
}

function compileHandlebarsTemplateToJS(src) {
  return `export default ${JSON.stringify(src)}`;
}
