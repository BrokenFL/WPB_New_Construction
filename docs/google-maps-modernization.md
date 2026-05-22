# Google Maps Modernization

Updated 2026-05-22.

## What Changed

- Google Maps script loading now includes `loading=async`, `v=weekly`, and the existing `marker` library request.
- Marker rendering now prefers `AdvancedMarkerElement` through `google.maps.importLibrary("marker")` when available.
- Legacy `google.maps.Marker` remains as a fallback when a Map ID is not configured or the advanced marker library is unavailable.
- Map pins keep the existing click-through behavior, fit-bounds behavior, expanded map state, and project-location map support.
- The missing-key/error state now exposes buyer-facing fallback copy headed "Map temporarily unavailable" with building, compare, and availability actions.
- Missing local config no longer prints raw missing-env messages into project map panels. The visible state stays buyer-facing and quiet.
- If `VITE_GOOGLE_MAPS_MAP_ID` is missing, the app can still load Google Maps with legacy markers. A Map ID is only needed for Advanced Markers.

## Required Environment

Copy `.env.example` to `.env.local` for local work and fill only the values you need.

| Variable | Required For | Notes |
| --- | --- | --- |
| `VITE_GOOGLE_MAPS_API_KEY` | Interactive Google Maps | Keep private. Configure locally or in the deploy environment, never in source. |
| `VITE_GOOGLE_MAPS_MAP_ID` | Advanced Markers | Optional. If blank, the app uses legacy markers when a valid API key is present. |

Local previews without a Google Maps API key should show the "Map temporarily unavailable" fallback. This is intentional.

## Preserved Behavior

- Homepage atlas and `/map/` route still initialize only on active route views.
- Initial homepage map still starts with the top seven ranked project pins and expands to all tracked projects.
- Project pages still render a focused project map when latitude/longitude are present.
- Vite public env handling remains unchanged; no additional secret exposure was introduced.

## Remaining Notes

- Advanced markers work best with a valid Google Maps Map ID. The existing `VITE_GOOGLE_MAPS_MAP_ID` path is preserved.
- When no Map ID is present, the implementation uses legacy markers.
- If production lacks a valid API key, the fallback panel should appear instead of a broken map surface.
- Future follow-up: remove the legacy marker fallback after production verification shows Advanced Markers are consistently available.
