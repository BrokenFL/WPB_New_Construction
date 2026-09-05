# P2-001: individual floor-plan HTML pilot

Date: 2026-09-05
Branch: `astra-phase-2-growth`
Starting branch HEAD: `63a267111bc672f531033eaaf48f65be903cb26e`
Read-only Phase 1 baseline: `fb7bf0e9b93a4c4710423dcd900d3e9d185e7605`
Status: implementation prepared for branch review; full-repository verification pending.

## Scope

Two individual reference pages, not all plans or two new project indexes:

- `/floorplans/olara/residence-d/`
- `/floorplans/alba-palm-beach/residence-d/`

The existing approved library remains the fact/asset source. An explicit publication allowlist selects one existing asset per plan and checks the reviewed fact snapshot. It does not publish collection/index/fact-sheet records as individual residences. IDs match the existing canonical plan identity; `v01` is the approved library asset edition, not an inferred developer revision date.

## Implemented

- Complete HTML with a preview, direct PDF download, source link, factual plan table, review date, project/library links, comparison action and current-availability inquiry.
- Clean self-canonicals, unique titles/descriptions/H1, WebPage/CreativeWork/MediaObject/Breadcrumb schema, matching discovery ItemLists and meaningful, stable sitemap dates.
- Native crawlable links from the existing library and both project pages, in initial HTML and after the existing app hydrates or navigates.
- Additive bootstrap with scoped floor-plan presentation. Existing `src/main.ts` and its routes/viewers remain unchanged. New entity links use native document navigation; existing SPA routes retain their router.
- Shared existing analytics sanitizer, consent adapter and lead-attribution implementation. No new Google loader, PII fields, lead endpoint or query-string attribution. Plan context is stored using existing `cta_context` (`floorplan:project:plan`) and carried to clean `/inquire/`.
- Postbuild preserves existing template assets and uses its explicit prerender end marker, avoiding unsafe first-`</div>` replacement. HTML/discovery/sitemap transformations are idempotent.
- Existing PDF URLs and files remain intact, including the indexed legacy Olara D path. No PDF canonical, redirect or noindex change.
- Regression tests plus static/browser QA and a branch-only, read-only QA workflow. No production workflow changes and no deploy/merge commands.

## Files

`index.html`, `package.json`, `src/bootstrap.ts`, `src/lib/floorplanEntities.ts`, `src/floorplanPage.ts`, `src/floorplanEntities.css`, `research/scripts/prerender-floorplan-entities.mjs`, `research/scripts/floorplan-entities.test.mjs`, `research/scripts/check-floorplan-entities.mjs`, `.github/workflows/phase-2-qa.yml`, this progress note.

New routes/discovery/sitemap output are generated in `dist/` by postbuild. No generated research feed, approved asset, source-of-truth record, lockfile, main branch or production setting is intentionally changed.

## Source checks and publication caveats

Sources inspected on 2026-09-05:

- Olara developer floor-plan index: https://www.olarawestpalmbeach.com/floorplans
- Olara D: https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_D.pdf
- Alba developer residences: https://www.albapalmbeach.com/residences
- Alba D: https://www.albapalmbeach.com/wp-content/uploads/Alba-Floorplans-D_Unbranded.pdf

Olara D text and rendered source sheet match 2 bedrooms + den, 2 baths + powder, floors 7–26, 1,774 interior / 381 exterior / 2,155 total square feet. Do not infer an effective date from the PDF filename.

**Alba D source discrepancy:** the source reports 1,786 interior and 578 terrace square feet, but 2,374 total. The components sum to 2,364, a 10-square-foot difference. The page preserves the reported values and explicitly flags this discrepancy; it does not silently amend developer data. The source carries **REV. 8/2022**, displayed plainly. No representation of current availability or an unchanged current drawing is made. Alba source text was readable; the official PDF screenshot fetch failed, so visual PDF verification remains a review item. Inspect the existing preview in the browser artifacts before approval.

Technical guidance reviewed: Google's canonical consolidation, URL structure and sitemap lastmod guidance. HTML pages have their own self-canonicals; PDFs retain their existing treatment.

## Search Console baseline

Read-only property: `sc-domain:wpbnewconstruction.com`.
Finalized window: 2026-08-06 through 2026-09-02; prior window 2026-07-09 through 2026-08-05.
Site totals: 63 clicks, 3,403 impressions; prior 53 clicks, 1,752 impressions.
Olara D's legacy PDF appeared with **0 clicks, 2 impressions and average position 3.5**. This supports preserving its URL and offering an HTML buyer journey; it is not proof of meaningful floor-plan demand or expected conversion uplift. Raw query logs are not copied into browser data or this report.

## Verification ledger

- Local isolated Node 22 fixture harness: **12/12 regression tests pass** (source snapshots, deduplication/type gates, privacy projection, escaping, canonical lookup, substantive rendering, schema, template boundaries and repeat-build idempotence).
- This environment did not have a full repository checkout or dependencies; the isolated fixtures are not committed. These local results are **not** a full repository build/typecheck/test claim.
- Full repository typecheck/build/test/assets audit: pending branch QA workflow. It tests both the pinned Phase 1 baseline and candidate without deployment credentials.
- Browser QA: pending candidate workflow; desktop 1440px/mobile 390px, JavaScript on/off, actual preview loads, overflow, native PDF download, clean canonical/attribution, inbound navigation and analytics consent. External requests are stubbed; no production analytics or real leads are submitted.
- Screenshots and machine results: workflow artifact under `.runtime/phase-2-qa/`. Manual screenshot review remains required even when automated checks pass.

## Review gate / next step

Keep the PR in draft until candidate checks pass, baseline differences are understood, preview/mobile screenshots are inspected, and the Alba source discrepancy treatment is accepted. Do not merge, enable auto-merge, push main or deploy in this implementation session. After this pilot is approved, expand P2-001 coverage before moving to separate homepage/comparison work.
