# Homepage four-area collection

This focused follow-up keeps the established V2 homepage, hero, news section and buyer flows intact while tightening the selected building preview. The collection now presents four approved examples in this order:

1. Olara — North Flagler
2. Nora House — Downtown
3. South Flagler House — South Flagler
4. OLIN Palm Beach — Palm Beach

The heading is `4 buildings, four different areas.` and the deck is `A curated preview across North Flagler, Downtown, South Flagler, and Palm Beach, drawn from 24 tracked buildings.` The selected-examples note and both complete-directory actions remain in the section. The cards use a four-up wide desktop grid, a two-by-two tablet grid and a single-column phone layout, with square media frames and aligned card actions.

## Image basis

OLIN uses the existing approved side-exterior card image at `public/assets/projects/olin-palm-beach/hero/olin-palm-beach-hero-side-exterior-v01.webp`. The approved asset catalog identifies the source as the user-provided, approved PNG `public-projects/olin-palm-beach/approved-for-website/images/olin-palm-beach-hero-side-exterior-v01.png`, published as a centered object-fit WebP derivative at 1,535 × 1,024 pixels (420,374 bytes). No new or generated imagery was introduced in this follow-up.

## Rendered evidence

The `before/` files are the current three-card collection captured from the preceding discovery milestone before this change. The `after/` files are complete `section.home-featured-section` captures from the built preview at `http://127.0.0.1:5188/`:

- `after/homepage-four-area-desktop-chromium.png` — Chromium, 1,440 × 1,233 pixels
- `after/homepage-four-area-tablet-chromium.png` — Chromium, 1,024 px viewport with the intended two-by-two grid
- `after/homepage-four-area-mobile-chromium.png` — Chromium, 390 × 2,800 pixels
- `after/capture-metadata.json` — loaded image dimensions, card order, viewport widths and browser error checks

The captures include the heading, deck, all four cards, selected-examples note and the lower directory action. The focused review found no clipping or horizontal overflow; the scripted desktop/mobile capture also found no console errors or failed image requests. The tablet render confirms the intended two-by-two composition. The OLIN image remains recognizable in its centered square crop.

## Verification

- `npm run typecheck` — passed
- `npm run build` — passed, including the existing postbuild prerender steps
- `npm run qa:discovery-coherence` — passed, 36/36 Chromium/WebKit checks
- `git diff --check` — passed

Implementation source: `e580c04e0bd7b456f119043b4b89e699a47cbb90`. The later evidence commit contains documentation and captures only. Exact pushed-head and CI identity are recorded in the draft PR handoff. No merge or deployment was performed.
