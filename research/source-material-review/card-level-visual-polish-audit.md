# Card-Level Visual Polish Audit

Generated: 2026-05-22

## Review Inputs

- Local preview: `http://127.0.0.1:4173`
- Live bundle checked before branch work: `/assets/index-BEx5cNdw.js`, `/assets/index-5PjG79Ph.css`
- Routes reviewed in desktop and mobile screenshots: `/`, `/updates/`, `/market-notes/`, `/guidance/`, `/floorplans/`, `/buildings/`, `/map/`, `/compare/`, `/inquire/`, `/projects/olara/`, `/projects/rosewood/`, `/projects/nora-house/`, `/projects/south-flagler-house/`, `/corridors/north-flagler/`, `/corridors/downtown/`, `/corridors/south-flagler/`
- Screenshot folder: `output/playwright/card-level-audit/`

## Positives

- The homepage flow is clear: Hero, Map, Corridors, Updates, Guidance, Featured Buildings, CTA.
- Updates now keep users on-site through internal article routes.
- Source links are secondary on article pages instead of acting as the primary user path.
- Floorplans open in the internal viewer, which preserves buyer flow.
- Public navigation uses Updates and Guidance rather than Blog or admin-facing labels.
- Desktop and mobile sampled routes did not show horizontal overflow in the rendered pass.
- Public pages did not expose `needs_review`, `source-material`, or Builder labels in the rendered pass.

## UI Designer Findings

- Spacing and hierarchy are strongest on the homepage hero, map, corridor cards, and project rail.
- Updates cards were visually functional but needed a more editorial label structure: related project/corridor and date should read before source attribution.
- Guidance cards needed stronger evergreen labels so they feel like buyer guidance rather than a blog archive.
- Repetitive imagery risk is real: generic corridor/geography visuals and project renderings can appear close together across the homepage.
- Mobile layout is generally stable, but card-level image control is necessary because a poor manual choice can make stacked sections feel repetitive quickly.

## UX / Customer Findings

- The path makes sense: orient on map, narrow by corridor, read updates/guidance, then compare buildings.
- The site keeps users on-site better than before because updates and floorplans no longer push immediately to external sources.
- Brooke is positioned as the guide on inquiry, article, project, compare, and floorplan surfaces, but CTA copy was inconsistent enough to feel accidental.
- Buyer next steps are clear on project pages and inquiry, but the homepage needed safer operator controls so routine polish does not require TypeScript edits.

## Copywriter Findings

- Updates should read as buyer-context summaries, not source-first clippings.
- Guidance should feel evergreen with labels like Guidance, Buyer Guide, Market Context, Floor Plan Strategy, and Corridor Guide.
- CTA language should stay polished and advisory, not urgent or repetitive.
- Brooke attribution should consistently include the Scott Gordon Group at Douglas Elliman Palm Beach where space allows.

## Developer / QA Findings

- Existing section-level homepage overrides were useful but too blunt for card-specific polish.
- Existing upload support was already present and could be reused for card replacement images.
- Image repetition QA already checked static mappings and some rendered homepage risk, but it did not know about new card-level overrides.
- Builder public exposure checks already existed in `qa:content-studio`; the new homepage card override file now participates in that JSON safety check.
- A rendered homepage visual-flow QA script was needed in `qa:launch` so section order and adjacent visible image repetition are checked after build.

## Backend / Operator Findings

- Automation status existed, but Brooke needed clearer last run, next run, loaded LaunchAgent, GitHub auth, and report visibility.
- Manual workflow buttons existed for QA and maintenance; the panel now exposes issue import, news publisher, daily maintenance, newsletter draft generation, QA, and report paths in one place.
- `gh` was not available on the current shell path during Phase 0; the Builder now surfaces `gh` path/auth separately instead of hiding that failure.

## Fixes Applied This Branch

- Added `content/overrides/homepage-card-overrides.json`.
- Added Builder card-level editing for hero, corridors, updates, guidance, featured buildings, and CTA.
- Added image catalog metadata, thumbnails, categories, usage count, dimensions where available, and review-only status handling.
- Added non-blocking repetition warnings in the Builder.
- Wired approved card overrides into homepage hero, corridor cards, update cards, guidance cards, featured project cards, and bottom CTA.
- Made homepage update cards more editorial and kept Read Update as the primary action.
- Made guidance card labeling evergreen with Read Guidance as the primary action.
- Added consistent Brooke CTA copy to major CTA surfaces.
- Upgraded Automation Status with labeled health states and workflow buttons.
- Added `research/scripts/check-homepage-visual-flow.mjs` and `npm run qa:homepage-visual`.
- Wired homepage visual QA into `qa:launch`.

## Deferred Recommendations

- Add a small authenticated local-only report viewer for opening Markdown reports from Builder buttons.
- Add image focal-point controls if Brooke starts replacing many card images.
- Add a stronger per-card before/after preview against the live homepage once the Builder grows beyond local cockpit use.
- Consider storing intentional repetition approvals explicitly if future editorial choices require adjacent same-project visuals.
