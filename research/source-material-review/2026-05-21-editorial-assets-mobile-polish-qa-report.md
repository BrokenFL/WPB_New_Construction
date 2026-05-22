# Editorial Assets + Mobile Polish QA Report

## Summary

This branch sources the first editorial image assets, keeps geography-sensitive placeholders where the supplied art is not a fit, tightens mobile spacing around sticky CTAs, and adds launch gates for public JSON language, form labels, and image performance.

## Editorial Asset Status

- `wpb-geography-map-hero.jpg`: available; user-provided Downtown WPB / Intracoastal image optimized to JPG.
- `downtown-core-corridor.jpg`: available; user-provided Downtown WPB night skyline image optimized to JPG.
- `rosemary-square-corridor.jpg`: available as representative Downtown/Rosemary imagery; a street-level Rosemary image is still preferred later.
- `flagler-waterfront-corridor.jpg`: available; user-provided North Flagler / Intracoastal aerial optimized to JPG.
- `nora-growth-corridor.jpg`: not sourced; kept as an editorial placeholder because the supplied North Flagler aerial should not be mislabeled as NORA.
- `buyer-intelligence-interior.jpg`: not sourced; kept as an editorial placeholder because no supplied image shows an interior.

## Mobile Polish Changes

- Added a reusable sticky CTA height variable on mobile.
- Added footer bottom padding so sticky CTA buttons do not cover final content.
- Preserved horizontal-safe nav behavior and added form/card min-width protection.
- Brochure inquiry controls now use visible labels.

## Public JSON Safety

- Public generated media fields now use `imageDisplayStatus` instead of public-facing authorization language.
- Public project media notes now say no project sponsor or brand affiliation is implied.
- Added `qa:public-json` to block sign-off, authorization, endorsement, internal approval, backend placeholder, and example-domain leakage in public/dist text outputs.

## Form Accessibility

- Added a source-level form accessibility gate for visible controls lacking labels or ARIA naming.
- Added a hidden label for the chat input.
- Replaced project brochure placeholder-only inquiry controls with labeled controls.

## Image Performance

- Project cards now use `loading="lazy"` and `decoding="async"`.
- Editorial panels use `decoding="async"` and eager loading only when explicitly rendered as hero.
- Added performance budget documentation and a QA gate for broad eager/sync media use, oversized editorial assets, and built chunk budgets.

## New QA Gates

- `npm run qa:public-json`
- `npm run qa:a11y-forms`
- `npm run qa:performance`
- `npm run qa:launch` now runs the launch readiness check plus all three gates.

## Checks Run

Pending final full verification at branch close:

- `npm run typecheck`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run check:updates`
- `npm run qa:public-json`
- `npm run qa:a11y-forms`
- `npm run qa:performance`
- `npm run qa:gatekeeper`
- `npm run qa:launch`

## Remaining Risks

- NORA and buyer-intelligence interior imagery still need true source assets.
- Existing large inherited project/concept assets remain allowlisted and should be optimized in a separate media-weight branch.
- Final mobile visual QA should continue after each content/image change because hero typography is intentionally large.

## Recommended Next Branch

`codex/source-nora-interior-assets-and-media-weight`
