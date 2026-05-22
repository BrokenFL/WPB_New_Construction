# Emergency Map Runtime Diagnosis

## User-Reported Symptom

`/map/` visually loaded after the emergency JS crash fix, but the actual Google map/pins/interaction were no longer working.

## Live Route Status

Before this branch, `https://www.wpbnewconstruction.com/map/` returned HTTP 200 and loaded bundle `/assets/index-C1RPapRV.js` plus CSS `/assets/index-BDNJw2SC.css`, but the route showed the fallback state instead of an interactive map. Browser QA found no fatal route crash and no Google Maps network request on `/map/`.

`npm run qa:map -- --live` was expected to fail before deployment because the live bundle still used the old fallback copy.

## Local Route Status

Before the fix, local behavior matched the source-code issue: the map initializer treated a missing `VITE_GOOGLE_MAPS_MAP_ID` as a hard failure even when `VITE_GOOGLE_MAPS_API_KEY` was present.

After the fix, local preview `/map/` loads Google Maps, requests Google Maps JS successfully, renders Google map panes, and keeps the text corridor/project list visible. The local run emitted only the expected legacy `google.maps.Marker` deprecation warning because no Map ID is configured locally.

## Console Errors

Live before fix:

- No uncaught JavaScript error found on `/map/`.
- Repeated browser mixed-content warnings were observed for `mailto:` form targets. These are unrelated to map initialization.

Local after fix:

- No uncaught JavaScript error.
- Google Maps legacy marker deprecation warning appears when `VITE_GOOGLE_MAPS_MAP_ID` is absent and the app uses `google.maps.Marker`.

## Network Failures

Live before fix:

- No route-blocking network failure.
- No Google Maps script request was made because source logic returned fallback before loading Google Maps.

Local after fix:

- Google Maps JS and tile requests returned HTTP 200.
- No route-blocking network failure.

## Google Maps Script Status

The production bundle contains the Google Maps loader path, but the live `/map/` branch did not execute it because the runtime required both `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID`. The Map ID should only control Advanced Markers, not whether the map can render.

## Environment Variable Status

Local `.env.local` status:

- `VITE_GOOGLE_MAPS_API_KEY` present: yes
- `VITE_GOOGLE_MAPS_MAP_ID` present: no

Repository/deploy wiring:

- `.env.example` documents both variables without values.
- `.github/workflows/deploy-cloudflare-pages.yml` passes `VITE_GOOGLE_MAPS_API_KEY` from repository secrets and `VITE_GOOGLE_MAPS_MAP_ID` from repository variables.
- Secret values were not added to reports or source.

Cloudflare Pages should define:

- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_GOOGLE_MAPS_MAP_ID` if Advanced Markers are desired

`VITE_GOOGLE_MAPS_MAP_ID` is optional after this fix.

## Root Cause

The map initializer incorrectly treated missing `VITE_GOOGLE_MAPS_MAP_ID` as a complete map failure. That forced the homepage map and `/map/` route into fallback even when a valid Google Maps API key existed and legacy markers could render.

## Fix Applied

- Removed the hard `VITE_GOOGLE_MAPS_MAP_ID` requirement from homepage, `/map/`, and project-location map initialization.
- Preserved Advanced Markers when a Map ID exists.
- Allowed legacy markers when a valid API key exists but Map ID is absent.
- Added valid latitude/longitude filtering before marker creation.
- Kept script loading single-use through the existing shared loader.
- Added approved public fallback copy and actions.
- Added a corridor/project text list on `/map/` so the route remains useful if Google Maps fails.
- Added `qa:map` and wired it into `qa:launch`.

## Routes Re-tested

Local preview:

- `/map/`: passed `npm run qa:map`; Google Maps rendered with legacy markers when local API key was present.
- `/`: passed `npm run qa:map`; homepage map preview did not crash.

Live pre-deploy:

- `/`: HTTP 200 with JS `/assets/index-C1RPapRV.js` and CSS `/assets/index-BDNJw2SC.css`.
- `/map/`: HTTP 200 but fallback-only due to the Map ID hard requirement in the live bundle.

## Remaining Risks

- Production still needs a valid Google Maps API key with correct domain/referrer restrictions.
- If production lacks a valid API key, users will see the clean fallback instead of a broken map.
- Without `VITE_GOOGLE_MAPS_MAP_ID`, the app uses legacy markers and Google logs a deprecation warning. This is non-fatal, but adding a Map ID remains recommended for Advanced Markers.
