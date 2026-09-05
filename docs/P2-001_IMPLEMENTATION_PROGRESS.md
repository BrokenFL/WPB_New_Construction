# P2-001: individual floor-plan HTML pilot

Date: 2026-09-05
Branch: `astra-phase-2-growth`
Starting branch HEAD: `63a267111bc672f531033eaaf48f65be903cb26e`
Read-only Phase 1 baseline: `fb7bf0e9b93a4c4710423dcd900d3e9d185e7605`
Review: https://github.com/BrokenFL/WPB_New_Construction/pull/72 (draft)
Status: first implementation pilot, not the complete P2-001 rollout. No merge or deployment authorized. Final candidate evidence and remaining review gates are recorded on PR #72.

## Scope and behavior

Two individual reference pages, not all plans or two project indexes:

- `/floorplans/olara/residence-d/`
- `/floorplans/alba-palm-beach/residence-d/`

The existing approved library remains the fact/asset authority. An explicit publication allowlist selects one existing PDF/preview pair per plan and checks the reviewed fact snapshot. Source changes, duplicates and collection/index/fact-sheet records fail closed. IDs follow the existing canonical plan identity; `v01` is the library asset edition, not an inferred developer revision date.

Implemented: complete HTML with preview, PDF download, plan facts, review/source notes, project/library links, comparison action and current-availability inquiry; clean self-canonicals, unique titles/descriptions/H1, WebPage/CreativeWork/MediaObject/Breadcrumb schema; discovery ItemLists merged into the existing page graph; stable, meaningful sitemap dates; crawlable links on the library and both project pages before and after hydration.

The additive bootstrap handles only the two reviewed routes; every other route loads unchanged `src/main.ts`. Existing PDF viewers, approved assets, source records, lead endpoint and production workflow remain unchanged. Native entity navigation is preserved alongside the legacy SPA router. Postbuild uses the existing prerender end marker rather than the first nested closing div. HTML, discovery and sitemap transforms are idempotent.

Existing analytics sanitizer/consent adapter and session-based lead attribution are reused. No additional Google loader, PII event fields or query-string attribution. Plan context uses existing `cta_context` (`floorplan:project:plan`) with clean `/inquire/`. Tests stub external requests and submit no real leads.

Public source actions open the approved local archived developer PDF, preserving the site's existing outbound-project-link policy. Original official URLs remain in provenance (`isBasedOn`) and this review document. No blocked developer host was allowlisted. The gatekeeper's existing technical-context exception now recognizes `main-*.js` as well as `index-*.js`, because the unchanged legacy app is lazily loaded; visible-copy and outbound-host rules are unchanged.

## Files

`index.html`, `package.json`, `src/bootstrap.ts`, `src/lib/floorplanEntities.ts`, `src/floorplanPage.ts`, `src/floorplanEntities.css`, `research/scripts/prerender-floorplan-entities.mjs`, `research/scripts/floorplan-entities.test.mjs`, `research/scripts/check-floorplan-entities.mjs`, `research/scripts/qa-gatekeeper-surface.mjs`, `.github/workflows/phase-2-qa.yml`, this progress note.

The extra gatekeeper-file change is a build-output naming compatibility correction discovered by real full-repository QA, not a relaxation of business rules. New routes/discovery/sitemap are generated in `dist/`; no generated research feed, approved asset, lockfile, main branch or production setting is intentionally changed.

## Official source checks and caveats

Sources inspected on 2026-09-05:

- https://www.olarawestpalmbeach.com/floorplans
- https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_D.pdf
- https://www.albapalmbeach.com/residences
- https://www.albapalmbeach.com/wp-content/uploads/Alba-Floorplans-D_Unbranded.pdf

Olara D text and rendered source sheet match 2 bedrooms + den, 2 baths + powder, floors 7–26, 1,774 interior / 381 exterior / 2,155 total square feet. Do not infer an effective date from the PDF filename.

**Alba D discrepancy:** the source reports 1,786 interior and 578 terrace square feet, but 2,374 total. The components sum to 2,364: a 10-square-foot difference. The page preserves the reported values and visibly explains the mismatch, rather than silently changing approved data. The source carries **REV. 8/2022**, displayed plainly. There is no current-availability or unchanged-current-drawing claim. Official PDF text was readable; its web screenshot fetch failed. The local approved Residence D preview loaded in browser tests and was visually inspected in the first-run screenshots; review the final candidate screenshots and source before accepting publication.

Technical guidance reviewed: Google canonical consolidation, URL structure and meaningful sitemap `lastmod`. HTML pages self-canonicalize; existing PDFs retain their treatment, including the indexed legacy `/projects/olara/docs/floorplans/olara-residence-plan-d.pdf`.

## Search Console baseline

Read-only property: `sc-domain:wpbnewconstruction.com`.
Finalized window: 2026-08-06 through 2026-09-02; prior window 2026-07-09 through 2026-08-05.
Site totals: 63 clicks / 3,403 impressions; prior 53 / 1,752.
Olara D's legacy PDF: **0 clicks, 2 impressions, average position 3.5**. This supports URL preservation and an HTML buyer journey, not a claim of meaningful floor-plan demand or expected conversion uplift. Raw queries are not republished.

## Verification history and remaining blocker

Real GitHub Actions compare the pinned Phase 1 baseline with each branch candidate. Read-only workflow permissions; no deployment credentials or deploy command. Tests retain the original mandatory Google Maps CI check, plus an explicitly labeled fallback-mode check and independent remaining gates so a missing Maps key cannot hide later failures.

Run 1 (`33972615177`, candidate `04e9560a...`): full typecheck/build and all 8 entity browser views passed. Full QA correctly found duplicate discovery JSON-LD scripts; fixed by merging the existing graph. It also exposed asset-scanner issues from interpolated asset paths; fixed with explicit approved paths.

Run 2 (`33973173581`, candidate `3fb546585e6a8ed868c073c49cd4dd3299de8611`): typecheck/build, 13 floor-plan tests, 6 building-master tests and 15 article tests passed. SEO, GEO (77 priority routes), internal links (246), privacy/analytics, form accessibility, performance, homepage visuals and other launch checks before the Maps gate passed. Strict asset audit passed: 0 blockers, 0 broken asset references, 0 local-path leaks, 81 existing warnings. Static entity QA and all 8 desktop/mobile JavaScript-on/off views passed, including actual preview loads, PDF download, inquiry attribution, inbound links and one merged JSON-LD graph. The inherited heading-width issue was also corrected.

Run 2 exposed two outbound Alba links and technical-string false positives caused by the unchanged application's new `main-*` filename. This revision changes source actions to the approved archive, preserves official provenance, and extends only the existing chunk-name match. A 14th regression test protects that source-link policy. Local isolated tests: 14/14 pass; the new pure entity module passes strict TypeScript checking. Full-repository results for this final correction are on the subsequent PR workflow run; local fixtures are not committed or represented as full application tests.

**Unresolved environment verification:** baseline and candidate both fail the original full `npm test` at `/` and `/map/` because this credential-free CI build has no Google Maps key and cannot render Google tiles. Explicit fallback checks pass. Do not call the full suite green, disable the original guard, or equate fallback rendering with authenticated/live map verification. Supply an appropriate review environment for that remaining check before treating the entire application as verified.

Dependency installation also reports 4 high-severity findings on the unchanged lockfile. No automatic dependency upgrades were attempted in this floor-plan batch. The existing app chunk still exceeds Vite's advisory 500 kB threshold; the repository's actual performance budget passes.

## Review gate and continuation

PR #72 remains draft. Inspect final workflow logs and desktop/mobile artifacts, accept the Alba source/revision treatment, and complete the Maps verification/disposition and Brooke's first-batch review before any merge/deploy. Artifacts include `tested-sha.txt`, eight page screenshots, browser results and strict asset audit. The QA artifact is evidence, not a public deployment.

After approval, expand P2-001 plan coverage using the same source-review gate before starting separate homepage/comparison work. Never assume this two-plan pilot completes P2-001 or the broader Phase 2 roadmap.
