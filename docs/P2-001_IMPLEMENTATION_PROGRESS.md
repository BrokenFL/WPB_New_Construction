# P2-001 — Olara-only pilot release preparation

Updated: 2026-09-05
Repository: `BrokenFL/WPB_New_Construction`
Branch / review: `astra-phase-2-growth` / draft PR #72
Production baseline (read-only): `fb7bf0e9b93a4c4710423dcd900d3e9d185e7605`
Original pilot reviewed HEAD: `44c79d24dfc124dc6c4571adf68318bf85d9b429`
Start of this pass: `1f93e9025b0e31214cd74be7d445da13cef0b04d`
**Exact tested implementation SHA: `0c4dc7a1a60f2e09c16ddbb43761c9dc8585dfab`.**

Status: implemented and credential-free tested; NOT release-verified, approved, deployed or measured. The later documentation commit does not change the tested implementation. The user has authorized independent Phase 2 work, superseding the older no-next-batch restriction; no merge or deployment is authorized.

## Publication scope

The candidate generates only `/floorplans/olara/residence-d/`. Alba's new `/floorplans/alba-palm-beach/residence-d/` page remains **unpublished, pending developer clarification**. It is absent from generated HTML, the sitemap, discovery ItemLists/links and public entity lookup. A standalone postbuild rerun also removes stale Alba HTML and stale discovery/sitemap entries.

`buildFloorplanEntities()` retains both reviewed source snapshots and the shared renderer. `publishedFloorplanEntities()` is the explicit Olara-only release scope. Alba's facts, disclosure, preview and implementation remain reviewable in source. All existing PDFs/approved assets and project pages are unchanged, including the indexed legacy Olara D PDF. No indexed document is redirected, removed or made noindex.

The already-tested dependency-aware deployment preflight, normal-flow mobile availability CTA, and validated building/plan inquiry bridge are preserved. This pass does not repeat their implementation or reopen completed source inspection.

## QA structure: negative testing is not release approval

The credential-free job runs the full candidate `npm test` with explicit `WPB_MAP_QA_MODE=no-key`. That mode first rejects key-configured or loader-bearing builds, then requires fallback behavior, no Google Maps requests and no rendered Google map. It also explicitly asserts the production preflight's expected missing-loader rejection. These are passing negative-case tests, not a deliberately failing job.

The separate required keyed job receives `P2_REVIEW_GOOGLE_MAPS_API_KEY` **only at build time**. It must run the full candidate suite in keyed mode, the shared deployment preflight, targeted pilot/browser/submission checks, and real Google loader/tile/interaction checks on `/` and `/map/`. No Maps responses are mocked in the real-map check. No production credential is referenced or changed; no credential-bearing bundle is archived.

`P2-001 release verification` requires both jobs to succeed. There is no blanket ignore, continue-on-error, production-guard bypass or fallback-as-live substitute. Once both modes pass on the same reviewed candidate, the intentional no-key test will not keep the workflow red. Branch-protection administration was not changed; this is an explicit workflow release gate, not a claim that repository protections were configured.

### Remaining key blocker (single reference)

Run `33985593830`, keyed job `101358394457`, stopped before checkout/build: the dedicated review secret is absent and the restriction-review variable is false. Required setup is unchanged:

- Add repository Actions secret `P2_REVIEW_GOOGLE_MAPS_API_KEY` containing a separate billing-enabled Maps JavaScript API key, restricted to Maps JavaScript API and HTTP referrer `http://127.0.0.1:4173/*`.
- After checking those restrictions, set repository Actions variable `P2_REVIEW_MAPS_KEY_RESTRICTIONS_CONFIRMED=true`.
- Re-run the failed jobs for the latest reviewed candidate, including the aggregate release-verification job. Inspect actual map results before approval. Do not reuse, loosen or paste the production key into chat/commits.

This blocks release, not independent development: Homepage + Buildings work proceeds separately in PR #73, based directly on production main.

## Results on the exact implementation SHA

Run: https://github.com/BrokenFL/WPB_New_Construction/actions/runs/33985593830
Credential-free job: `101358394589` — **SUCCESS**.

| Check | Result |
|---|---|
| Typecheck and production build | PASS; 99 existing routes + 1 Olara HTML route |
| Full candidate suite, explicit no-key mode | PASS, including launch, SEO, links, public-copy/privacy, analytics, forms, performance and Maps fallback expectations |
| Shared preflight regressions | 11/11 PASS |
| Floor-plan regressions, including Alba publication exclusion | 16/16 PASS |
| Explicit no-key-mode regression | 1/1 PASS |
| Existing building / article regressions | 6/6 and 15/15 PASS |
| Gatekeeper and untracked assets | PASS |
| Strict asset audit | PASS: 0 blockers / broken references / local-path leaks; 81 pre-existing advisories |
| Olara desktop/mobile, JavaScript on/off | 4/4 browser views PASS |
| Actual intercepted inquiry submissions | 4/4 PASS: desktop/mobile × introductory/facts CTA |
| Actual no-key production preflight | Correctly rejected; expected-rejection assertion PASS |
| Synthetic-config split-bundle preflight | PASS; only loader inclusion, not key validity or live Maps |
| Required keyed full suite and working Maps | BLOCKED before build; not executed |
| Aggregate release verification | BLOCKED by keyed job; no readiness claim |

The actual JSON POST to `/api/leads` was intercepted. Building `olara` and context `floorplan:olara:residence-d` reach the submission payload; clean inquiry navigation, CTA placement and landing context remain intact. Synthetic contact values and token are excluded from the analytics queue/data layer. No real lead or marketing email was sent.

Artifact: https://github.com/BrokenFL/WPB_New_Construction/actions/runs/33985593830/artifacts/9975071990
ZIP SHA-256: `10879d9ecaf96c8855829bdcded11cac18bc7247d3eb44266570330999954aa9`.
Its embedded `tested-sha.txt` matches the implementation SHA. Contains four screenshots, safe result JSON, asset audit and split-preflight log; no deployable build.

Desktop and mobile screenshots were inspected: the availability CTA precedes the loaded drawing, the second CTA/facts remain readable, and no horizontal overflow or overlay obscures the plan. JavaScript-on/off screenshot pairs are byte-identical for this capture. This visual review is not Brooke's approval.

## Preserved source-review record

Official source retrieval and visual/PDF consistency review were completed in the preceding review-gap pass on September 5, 2026. They were not presented as newly confirmed sales inventory in this pass.

- Olara source page: https://www.olarawestpalmbeach.com/floorplans
- Olara D source PDF: https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_D.pdf
- Alba source pages: https://www.albapalmbeach.com/residences/ and https://www.albapalmbeach.com/downloads/
- Alba D PDF: https://www.albapalmbeach.com/wp-content/uploads/Alba-Floorplans-D_Unbranded.pdf

Both retrieved PDFs matched the approved downloads byte-for-byte. Their rendered pages and approved previews agreed. Olara D: 2 bedrooms + den, 2 baths + powder, floors 7–26; 1,774 interior + 381 exterior = 2,155 total square feet. PDF SHA-256 `bdafa9399566df69f665551ecd332cdbb8b34923db310c1c07b5a000d9d8deae`.

Alba D: 3 bedrooms / 3 baths, floors 7–18, 1,786 interior and 578 terrace, but 2,374 reported total (components sum to 2,364). Its disclaimer is marked **REV. 8/2022**. No newer drawing was established. PDF SHA-256 `0f6cf9771eaaf8a8231056c70fffac8c6e628f121806815f30db82c22afb8c38`. Neither the reported total nor revision was silently changed. Obtain the current drawing and area schedule before considering publication; retrieval date alone does not establish drawing revision.

Full prior source/guard/submission history: https://github.com/BrokenFL/WPB_New_Construction/blob/1f93e9025b0e31214cd74be7d445da13cef0b04d/docs/P2-001_IMPLEMENTATION_PROGRESS.md
The previous final review run was `33982094565` at code `e2d022ef21bcb5c019e0c5356794fc16963eb1a7`. Earlier guard reproduction run `33980469689` proved the original index-only failure; the production guard now follows genuine reachable Vite manifest imports/dynamicImports. The build-only private manifest remains outside public `dist/`.

## Release decisions / continuation

Keep PR #72 draft. Brooke must review the Olara presentation and lead flow after actual keyed verification passes. Alba clarification is not an Olara release prerequisite now that its new HTML is excluded. Additional plan coverage stays a separate source-reviewed task.

PR #73 independently changes entry/build hooks from the same production baseline. Reconcile those shared hooks and rerun combined QA before releasing both; neither branch may silently overwrite the other. No merge, deployment, auto-merge or main change is authorized here.

The four existing high-severity dependency findings, asset-library advisories and advisory Vite chunk size remain a separate maintenance backlog. No lockfile/production credential/source-feed changes were made. The full remaining growth roadmap is tracked in `docs/PHASE_2_DELIVERY_TRACKER.md`.
