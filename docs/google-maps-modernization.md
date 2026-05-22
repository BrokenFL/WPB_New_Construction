# Google Maps Modernization

Updated 2026-05-22.

## What Changed

- Google Maps script loading now includes `loading=async`, `v=weekly`, and the existing `marker` library request.
- Marker rendering now prefers `AdvancedMarkerElement` through `google.maps.importLibrary("marker")` when available.
- Legacy `google.maps.Marker` remains as a fallback if the advanced marker library is unavailable.
- Map pins keep the existing click-through behavior, fit-bounds behavior, expanded map state, and project-location map support.
- The missing-key/error state now exposes buyer-facing fallback copy: "Map unavailable. Browse the building list instead." with a `/buildings/` link.

## Preserved Behavior

- Homepage atlas and `/map/` route still initialize only on active route views.
- Initial homepage map still starts with the top seven ranked project pins and expands to all tracked projects.
- Project pages still render a focused project map when latitude/longitude are present.
- Vite public env handling remains unchanged; no additional secret exposure was introduced.

## Remaining Notes

- Advanced markers work best with a valid Google Maps Map ID. The existing `VITE_GOOGLE_MAPS_MAP_ID` path is preserved.
- When no Map ID is present, the implementation intentionally falls back to legacy `google.maps.Marker` so local/preview maps still render; that environment may still show Google's legacy-marker deprecation warning.
- If production lacks a valid API key or Map ID, the fallback link should appear instead of a broken map surface.
- Future follow-up: remove the legacy marker fallback after production verification shows Advanced Markers are consistently available.
