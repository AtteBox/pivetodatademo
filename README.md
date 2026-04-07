# Vedenlaatu kartalla

## About

A browser app where Finnish surface water quality sites and results presented on a map.

The codebase is mostly old jQuery-code with a custom architecture from 2014.

## Tech stack

- Node/NPM
- Typescript
- Vite
- Vitest
- Playwright
- jQuery
- Leaflet
- Flot

## How to develop

1. Install depdendecies: `npm install`
1. Run development server: `npm run dev`
1. Edit code and debug with a browser
1. Lint and format before pushing: `npm run format && npm run lint`
1. Remember to create a feature or fix branch before pushing and publishing a PR

## How to test

### Unit tests

Add `Vitest` unit tests for complex functions. If you need tests for `src/example.ts`, add the tests in `src/example.test.ts` Run them in the following way:

1. Install depdendecies: `npm install`
1. Run development server: `npm run test`

### Integration tests

Add `Playwright` tests for new functionalities to at least test for regression of functonalities. Run the tests in the following way:

1. Install depdendecies: `npm install`
1. Run development server: `npm run e2e-test`

# Deployment

The main-branch is automatically deployed using Google Cloud Build to Google App Engine serving at https://pivetodatademo.appspot.com.

PR Preview branches are deployed Netlify.
