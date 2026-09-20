# PR #115 — Citywide aerial hero

This focused change replaces the Shorecrest-led homepage hero with a citywide aerial supplied by Brooke. It preserves the established solid masthead, hero copy and buyer actions, Development Desk, four-area discovery section, closing bridge artwork and all underlying buyer flows. No canonical facts, approved-news data or asset-warehouse records changed.

## Art direction and selection

The previous hero was polished but presented the site through one building. The citywide aerial communicates West Palm Beach, the Intracoastal and Palm Beach in one frame, which better supports the homepage's market-wide promise. The accepted treatment keeps the original camera and composition, uses a restrained warm editorial finish, and leaves the bright city and water visible. Readability comes from localized navy fades behind the copy rather than a dark veil over the whole image.

Two landscape treatments were produced with built-in ImageGen from the user-supplied source. The stronger golden-hour pass was rejected because it introduced clouds, a stronger sun reflection and excessive surface texture. The selected restrained treatment limits the requested work to tonal balance, color separation, noise and subtle clarity. A generated portrait attempt was also rejected because it introduced sky detail. Mobile production assets therefore use a deterministic portrait crop from the selected landscape master, preserving the same accepted pixels while keeping the bridge and skyline recognizable.

| Evidence | Previous hero | Citywide aerial hero |
| --- | --- | --- |
| Desktop | [Previous 1440px opening](../hero-finish/after-desktop-opening.png) | [Final 1440 × 900 viewport](after/home-hero-desktop-1440x900.png) |
| Mobile | [Previous 390px opening](../hero-finish/after-mobile-viewport.png) | [Final 390 × 844 viewport](after/home-hero-mobile-390x844.png) |
| Mobile sequence | — | [Hero into Development Desk](after/home-hero-to-desk-mobile-390x844.png) |

## Source, edits and limits

- User-supplied source: `source-user-supplied.png`, 1672 × 941, 2,672,341 bytes, SHA-256 `9f1e8e135c8e49275da07d4d798508519ecfe904733d0e88fd4781f7b2a57eda`.
- Selected ImageGen output: `selected-editorial-master.png`, 1672 × 941, 2,944,158 bytes, SHA-256 `8f12b5b6b2398d7b212dd9d9d720bcdf5f8bd01bc4e169ecff247f8723380fd2`.
- The supplied reference already has generated-image provenance. The ImageGen tool did not expose its underlying model ID. Exact prompts and rejected-treatment reasons are retained in [prompts.json](prompts.json).
- This is an illustrative editorial aerial. Its architecture and geography were not independently verified against an official current aerial, developer survey or architectural model in this change. Visual agreement with a generated reference is not independent proof. The treatment must not be cited as photographic evidence of project status, exact massing or current construction conditions.
- No source was upscaled. The originals remain unchanged in this evidence folder. These draft-PR derivatives were not added to the approved asset warehouse.
- The public hero has descriptive alternative text and no process caption. Provenance remains in this internal evidence record and the source metadata.

## Responsive derivatives and loading

The reproducible derivative script writes WebP at quality 84. Desktop candidates are 960 × 540 (166,774 bytes), 1280 × 720 (268,972 bytes) and 1672 × 941 (390,350 bytes). The deterministic mobile crop begins at x=480 in the selected 1672 × 941 master and produces 390 × 807 (93,048 bytes) and 455 × 941 (113,944 bytes). Full hashes and paths are in [derived-manifest.json](derived-manifest.json); [reproduce-derivatives.mjs](reproduce-derivatives.mjs) recreates them.

Browser QA at 1440 × 900 and 390 × 844 confirmed the intended responsive source, one eager/high-priority hero image, successful loading and no horizontal overflow. The 390px opening preserves the complete masthead → hero → Development Desk sequence without changing the established hero height. Runtime measurements are in [capture-metadata.json](capture-metadata.json).

## Fresh graphic-design critique

The new opening is more memorable and more accurate to the site's citywide positioning. The diagonal coastline and bridge create a strong visual route into the skyline, while the left-side water gives the headline a calm field. The localized desktop fade keeps the city luminous, and the mobile crop reads as a deliberately art-directed composition rather than a squeezed desktop frame. The solid masthead now moves naturally into an image that explains the whole market at a glance.

The remaining limit is the source itself: close inspection still reads as illustrative rather than documentary photography, particularly in small building and vegetation detail. That is acceptable for the approved editorial role but should constrain factual claims. A verified current aerial from an official or licensed source would be the appropriate future replacement if documentary precision becomes a requirement.

## Validation boundary

`typecheck`, production build, hero-image QA, homepage visual flow and rendered hero performance passed before commit. The final gatekeeper and asset/accessibility checks are recorded in the PR handoff after the exact pushed SHA is available. The local built preview is `http://127.0.0.1:5188/`. No merge or deployment is included.

Models actually used: `gpt-5.6-sol` at `xhigh` for art direction and `gpt-5.6-luna` at `max` for bounded asset inventory. Built-in ImageGen produced the visual treatments; no model substitution or paid service was used.
