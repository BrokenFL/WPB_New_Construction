# Brooke Builder Visual Overlay After Report

Created: 2026-05-22
Branch: `codex/brooke-builder-visual-overlay-editor`

## What Changed

- Added `Visual Editor` as the default Brooke Builder path.
- Reframed the Homepage editor around a site-like page canvas instead of a card/grid simulator.
- Added an editing page selector with Homepage fully implemented and other pages marked as coming next.
- Added Edit and Preview modes:
  - Edit mode shows clickable hotspot labels and outlines.
  - Preview mode hides overlay labels for a clean page read.
- Added a simple side editor that follows the selected Homepage section/card.
- Added direct image replacement affordances:
  - drop onto the selected page image/card
  - drop into the side panel
  - choose an existing image
- Kept the detailed card tree and image picker under `Advanced Editor`.

## Visual Preview Coverage

The Homepage visual renderer now includes:

- Hero
- Map preview
- Corridors
- Updates
- Guidance
- Featured Buildings
- CTA

It uses Builder image URL resolution so remote Builder images resolve through `https://www.wpbnewconstruction.com/...` instead of filesystem paths.

## Screenshots

- `research/source-material-review/brooke-builder-visual-overlay-screens/01-visual-editor-overview.png`
- `research/source-material-review/brooke-builder-visual-overlay-screens/02-selected-update-card.png`
- `research/source-material-review/brooke-builder-visual-overlay-screens/03-clean-preview-mode.png`

## QA Notes

- Local browser check: Visual Editor rendered with 20 editable hotspots.
- Selected an Updates card and confirmed the side panel followed the selected item.
- Preview mode hid hotspot labels.
- Visible image check found no visible broken images and no filesystem image URLs.
- Static Builder visual QA passed.
- Remote image resolver QA passed.
- Public Builder route check: `/brooke-builder/` and `/content-studio/` returned `302` to `/`.
- Remote Builder protection check: `https://builder.wpbnewconstruction.com/` returned a Cloudflare Access login redirect.

## Still Deferred

- Visual editing for Updates, Guidance, Projects, Floorplans, and Corridors as standalone pages.
- True inline text editing inside the canvas. Current behavior focuses the side-panel text field when headline/deck text is clicked.
- Full remote authenticated visual screenshot still depends on the Cloudflare Access session in the browser profile.
