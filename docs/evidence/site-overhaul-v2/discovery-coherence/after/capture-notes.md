# Discovery coherence capture notes

Generated from the rebuilt local preview at `http://127.0.0.1:5188` on 2026-09-20. The capture helper exercised Chromium and WebKit at 1440×900 and 390×844, then saved full target-section screenshots here.

Captured targets:

- `home-collection-*`: the three-building preview, dynamic 24-building scope, and both Explore-all actions.
- `north-flagler-hero-*` / `north-flagler-hero-directory-*`: corridor hero and onward inventory entry.
- `north-flagler-full-inventory-*`: the complete ten-building North Flagler directory, including Alba.
- `corridor-hub-*`: all five corridor choices, including South End.
- `olara-alternatives-*`: the three-building North Flagler continuation module and its ten-building/all-buildings/compare actions.
- `article-discovery-*`: the real Alba update route and its North Flagler continuation module.
- `map-selected-*`: the map with Olara selected, the 24-building count, and building/corridor/compare links.

The screenshots were taken after checking the skip-link state and blurring focus, so the accessibility skip control is not visually open in the evidence. Images inside the long inventory and corridor sections were warmed in the capture browser only; source loading behavior was not changed.

Visual result: the homepage preview reads as an intentional sample with an explicit 24-building path; North Flagler exposes all ten records early and keeps Alba visible; the corridor hub presents five distinct areas; Olara and the Alba update route both continue into relevant building research; and the map shows a selected building with onward links. The latest pass reported no page errors, no console errors, and no mobile horizontal overflow. Browser request cancellations were limited to external Google Maps/font resources during browser teardown.

`capture-results.json` records the per-engine/per-viewport run. The reproducible helper is one directory above this `after/` folder at `capture-discovery-coherence.mjs`.

After the final ≤720px homepage CTA placement correction, `home-collection-mobile-chromium.png` and `home-collection-mobile-webkit.png` were recaptured against the current preview. The 390px composition now keeps the first Explore-all action in the intro flow above the cards and retains the full-directory action after the explanatory note.
