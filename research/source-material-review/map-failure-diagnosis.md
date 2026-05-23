# Map Failure Diagnosis

Generated: 2026-05-23

## Live Result

`https://www.wpbnewconstruction.com/map/` returns HTTP 200 and the route renders the buyer-facing fallback. The fallback has the required actions:

- View Buildings
- Compare Projects
- Request Current Availability

The interactive Google map does not render on the current live bundle. A Playwright probe found:

- `/map/` map state: `unavailable`
- `/map/` Google map rendered: no
- `/map/` Google Maps network requests: 0
- `/` map state: `unavailable`
- `/` Google map rendered: no
- `/` Google Maps network requests: 0

The only repeated console warning was an unrelated mixed-content warning for `mailto:` form targets. There was no route crash, no Google Maps auth error, and no referrer-restriction error because the live bundle never requests Google Maps.

After strengthening QA, `npm run qa:map -- --live` fails as expected before deployment:

```text
/map/ did not render Google Maps in live mode: Google Maps was not requested by the bundle.
/ did not render Google Maps in live mode: Google Maps was not requested by the bundle.
```

## Local Result

Local `.env.local` status, without printing secrets:

- `VITE_GOOGLE_MAPS_API_KEY`: present
- `VITE_GOOGLE_MAPS_MAP_ID`: missing

`npm run qa:map` passes locally. This confirms the current source can render Google Maps when an API key is available, and that `VITE_GOOGLE_MAPS_MAP_ID` is not required for legacy marker rendering.

## Environment Status

- Local API key: present
- Local Map ID: missing
- Production/live bundle: no Google Maps loader present
- GitHub workflow build step passes `VITE_GOOGLE_MAPS_API_KEY` from repository secrets and `VITE_GOOGLE_MAPS_MAP_ID` from repository variables.
- `VITE_GOOGLE_MAPS_MAP_ID` remains optional.

No API secret values were printed or committed.

## Root Cause

The live production bundle was built or deployed without `VITE_GOOGLE_MAPS_API_KEY`, so Vite removed the Google Maps loader path from the public bundle. The browser therefore falls back immediately and never requests `maps.googleapis.com`.

This is not a Map ID failure, not a marker failure, and not a Google referrer-blocking failure. A referrer/key restriction failure would show a Maps request and an auth/referrer console error; this live bundle makes no Maps request at all.

## Fix Applied

- Strengthened `research/scripts/check-map-functionality.mjs` so live map QA requires a real Google map render instead of accepting fallback-only production behavior.
- Kept local no-key fallback behavior useful, while requiring Google rendering locally when a build-time API key is present.
- Added a deploy-time guard in `research/scripts/deploy-cloudflare-pages-with-retry.mjs` that refuses to deploy a production bundle that lacks the Google Maps loader.
- Preserved the existing source behavior where API key renders Google Maps and Map ID only controls Advanced Marker support.

## Remaining Verification

After deployment, `npm run qa:map -- --live` must pass with Google Maps rendered on both `/map/` and `/`. If it fails after a key-bearing bundle is deployed, the next likely causes would be key restrictions or Google API authorization, but those are not the current observed failure.
