# Vedenlaatu Kartalla

Interactive map app showing water quality data from Finland's PIVET API. Built with TypeScript, Leaflet, Vite, and Tailwind CSS. Charts use jQuery/Flot, templates use Handlebars.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Type-check + ESLint
- `npm run format` — Prettier
- `npm run test` — Unit tests (Vitest)
- `npm run e2e-test` — E2E tests (Playwright)

## Structure

- `src/datasource/pivet.ts` — PIVET API client (sites, results, result sets)
- `src/map/` — Leaflet map rendering and site markers
- `src/chart/` — Flot-based water quality charts
- `src/ui/` — UI components (popups, tooltips, result browser)
- `src/core/` — Shared types and interfaces
- `e2e-tests/` — Playwright E2E tests
