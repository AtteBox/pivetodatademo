# Codebase Improvement Plan

## Quick Wins

### Task 1: Remove debug console.log statements
- **Priority:** MEDIUM
- **Files:** `src/map/SitesMapLayer.ts`, `src/ui/ResultBrowser.ts`, `src/datasource/pivet.ts`
- [ ] Remove `console.log` calls in SitesMapLayer.ts (lines ~99, 167, 180)
- [ ] Remove duplicate `console.error(error)` in ResultBrowser.ts:42 (already logged on line 41)
- [ ] Keep `console.error` calls but ensure they log meaningful context
- [ ] Add ESLint rule `no-console: ["warn", { allow: ["error", "warn"] }]`
- **Verify:** `npm run lint && npm run build`; grep confirms no stray `console.log`

### Task 2: Use strict equality consistently
- **Priority:** LOW
- **Files:** `src/ui/MapUI.ts`, `src/ui/LayerwiseUI.ts`, `src/datasource/pivet.ts`
- [ ] Replace `==` with `===` in MapUI.ts:30,33
- [ ] Replace `==` with `===` in LayerwiseUI.ts:211
- [ ] Replace `==` with `===` in pivet.ts:271
- [ ] Add ESLint rule `eqeqeq: "error"` (allow `== null` exception)
- **Verify:** `npm run lint`

---

## Foundational Refactors

### Task 3: Extract constants and configuration
- **Priority:** MEDIUM
- **Files:** `src/datasource/pivet.ts`, `src/main.ts`, `src/map/LeafletRenderer.ts`, `src/chart/Chart.ts`, `src/map/SitesMapLayer.ts`
- [ ] Create `src/config.ts` with named constants:
  - `PIVET_API_BASE_URL` (from pivet.ts:6)
  - `DEFAULT_COORDS` / `DEFAULT_ZOOM` / `GEOLOCATION_ZOOM` (from main.ts:34-35)
  - `DEFAULT_LANGUAGE` (from main.ts:14)
  - `HALF_YEAR_MS` (from Chart.ts:41)
  - `TOOLTIP_MARGIN_PX` (from LayerwiseUI.ts:59)
  - `ZOOM_TO_SCALE_MAP` (from LeafletRenderer.ts:51-72)
  - `SITE_QUERY_SCALE_THRESHOLD` / `MAX_SITES` (from SitesMapLayer.ts:30-32)
- [ ] Replace all hardcoded values with references to these constants
- **Verify:** `npm run build && npm run test`

### Task 4: Extract generic pagination helper in pivet.ts
- **Priority:** HIGH
- **Files:** `src/datasource/pivet.ts`
- [ ] Create generic `async fetchAllPages<TRaw, TResult>(uri, mapFn): Promise<TResult[]>` utility
- [ ] Replace `#queryPivetSitesByRequestUri`, `#queryPivetResultsByRequestUri`, `#queryPivetResultSetsByRequestUri` with calls to the utility (~100 lines of duplication removed)
- [ ] Convert `execute()` methods from callback-based to async/await internally
- [ ] Fix bug at line 304 where `this.data?.has(resultSetKey)` checks the wrong Map (should check `collectedData`)
- **Verify:** `npm run lint && npm run test && npm run build`

### Task 5: Improve type safety — eliminate `any` usage
- **Priority:** HIGH
- **Files:** `src/datasource/pivet.ts`, `src/chart/Chart.ts`, `src/ui/LayerwiseUI.ts`, `src/ui/ResultBrowser.ts`, `src/map/SitesMapLayer.ts`, `src/map/LeafletRenderer.ts`, `src/main.ts`, `.eslintrc`
- [ ] Define proper interfaces for PIVET API responses (`PivetSiteResponse`, `PivetResultResponse`)
- [ ] Type `SiteInfoQueryType` parameter in ResultBrowser constructor (line 15, currently `any`)
- [ ] Type callback parameters in ResultBrowser (`resultSetListQuery_Callback` line 52)
- [ ] Replace `($ as any).plot` in Chart.ts with a proper Flot type declaration
- [ ] Replace `const window = globalThis as any` in LayerwiseUI.ts and main.ts with proper typing
- [ ] Type `siteObject: any` parameter in `showSiteInfo` (LayerwiseUI.ts:125)
- [ ] Type `objectPropertiesToNameValueArray` with proper generics (LayerwiseUI.ts:236-237)
- [ ] Re-enable ESLint rules: `@typescript-eslint/no-explicit-any: "warn"`, `@typescript-eslint/ban-types: "warn"`
- **Verify:** `npm run lint` passes with stricter rules; `npm run build` succeeds

---

## Reliability

### Task 6: Improve error handling for API calls
- **Priority:** HIGH
- **Files:** `src/datasource/pivet.ts`, `src/core/index.ts`, `src/ui/MapUI.ts`
- [ ] Replace `this.error = JSON.stringify(err)` with storing the actual error object
- [ ] Add HTTP response status checking: `if (!response.ok) throw new Error(...)`
- [ ] Add `AbortController` with timeout (e.g., 30s) to fetch calls
- [ ] Validate that `data.value` exists and is an array before iterating
- [ ] Show meaningful user-facing error messages when API calls fail
- **Verify:** Build succeeds; manually test with network offline; E2E tests pass

### Task 7: Increase unit test coverage
- **Priority:** MEDIUM-HIGH
- **New files:** `src/datasource/pivet.spec.ts`, `src/chart/Chart.spec.ts`, `src/ui/ResultBrowser.spec.ts`
- [ ] Export and test `dateFromXMLDateTimeString` (currently unexported in pivet.ts)
- [ ] Test `SitesQuery`, `ResultSetQuery`, `ResultSetListQuery` with mocked `fetch`
- [ ] Test error scenarios: network failure, malformed JSON, empty responses, missing fields
- [ ] Test `Chart` extent calculation logic
- [ ] Test `ResultBrowser` event wiring and callback flows
- [ ] Test `generateCSSColorStrings` color distribution
- [ ] Test `objectPropertiesToNameValueArray` mapping logic
- **Verify:** `npm run test` passes; aim for >60% line coverage on `src/datasource/` and `src/chart/`

### Task 8: Fix E2E test issues
- **Priority:** MEDIUM
- **Files:** `e2e-tests/siteInfo.spec.ts`, `e2e-tests/graph.spec.ts`, `playwright.config.ts`
- [ ] Remove `eval()` usage in E2E tests (TODOs at siteInfo.spec.ts:5 and graph.spec.ts:44)
- [ ] Implement TODO test cases in graph.spec.ts:33-34 (selection zoom and mouse scroll zoom)
- [ ] Enable Firefox testing in playwright.config.ts (currently commented out)
- [ ] Add E2E test for error state using route interception
- **Verify:** `npx playwright test` passes on Chromium and Firefox

---

## User Experience

### Task 9: Improve accessibility
- **Priority:** MEDIUM
- **Files:** `index.html`, `src/ui/LayerwiseUI.ts`, `src/ui/templates/*.hbs`
- [ ] Add `aria-label` attributes to map controls and interactive buttons
- [ ] Add proper `role` attributes to popup window, tooltip, and loading indicators
- [ ] Fix result set buttons: use `aria-pressed` instead of `aria-selected` (they are toggles, not selection items)
- [ ] Add keyboard event handlers (`Enter`/`Space`) for result set buttons
- [ ] Add `aria-live="polite"` to loading indicators and error messages
- [ ] Add skip-to-content link for keyboard navigation
- **Verify:** Manual keyboard-only testing; Lighthouse accessibility audit

### Task 10: Deduplicate HTML loading spinners
- **Priority:** LOW
- **Files:** `index.html`
- [ ] Extract the 4 nearly identical loading spinner SVGs into a reusable pattern or single CSS class
- [ ] Ensure each spinner instance keeps its unique container ID for JS targeting
- **Verify:** Visual check; E2E tests pass
