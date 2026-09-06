# P2-002 — Homepage and Buildings commercial SEO batch

Updated: 2026-09-05. Repository: `BrokenFL/WPB_New_Construction`.
Branch: `astra-p2-002-home-buildings`. Review: draft [PR #73](https://github.com/BrokenFL/WPB_New_Construction/pull/73).
Production base: `fb7bf0e9b93a4c4710423dcd900d3e9d185e7605`.
**Exact implementation/test revision: `aebc14f27d452c5870777df34c6f947e1ef2c8dc`.**

This is a separately implemented commercial batch based directly on production, not on PR #72. It does not depend on any unpublished floor-plan route. Later documentation-only commits are not substituted for the exact code revision in test evidence. No merge, deployment, auto-merge or marketing send is authorized.

## Search Console basis and limitations

Read-only GSC connector: organization `X04QcnSxCBt8ouuW3y5A` (Brooke brand), property `sc-domain:wpbnewconstruction.com`, retrieved September 5, 2026. Finalized window **August 6–September 2, 2026**; prior window July 9–August 5. Site totals were 63 clicks / 3,403 impressions, versus 53 / 1,752 in the prior window. These are baseline observations, not results attributable to this unpublished batch.

| Existing canonical page | Clicks | Impressions | Average position |
|---|---:|---:|---:|
| Homepage `/` | 0 | 76 | 51.08 |
| Buildings `/buildings/` | 0 | 171 | 64.75 |

Selected query × page observations from that same retrieval:

| Query | Homepage impressions / position | Buildings impressions / position |
|---|---|---|
| new construction luxury condos in west palm beach | 13 / 84.77 | 2 / 90.00 |
| new condos west palm beach | 3 / 66.67 | 7 / 77.57 |
| new apartments west palm beach | 10 / 78.70 | 22 / 69.41 |

The broad condo intent overlaps; rental-oriented searches also reach the directory. The implementation makes the market overview and browsing roles distinct and explains rental/mixed-use context rather than implying every directory entry is a condo for sale. Small samples and low positions do not prove cannibalization, a CTR-only problem or expected uplift. Unrelated or personal-looking query rows are not republished.

## Implemented page roles and copy

**Homepage owns the broad market overview.**
- Canonical unchanged: `https://www.wpbnewconstruction.com/`
- Title: `West Palm Beach New Construction Condos | Buildings & Plans`
- H1: `West Palm Beach New Construction Condos`
- Description: `Explore West Palm Beach new construction condos by waterfront or downtown location. Compare buildings and floor plans, then request current availability.`
- Opening: `Explore West Palm Beach new construction condos, from Flagler Drive waterfront towers to downtown residences. Compare locations, project stages and released floor plans, then request current availability for your shortlist.`

A new shortlist guide helps compare waterfront versus downtown, pre-construction versus completed buildings and actual layouts. It links existing corridors, buyer answers, project guides, comparison page, Buildings and the existing floor-plan library. It adds no new comparison route.

**Buildings owns directory / browse intent.**
- Canonical unchanged: `https://www.wpbnewconstruction.com/buildings/`
- Title: `West Palm Beach Condo Buildings | New Development Directory`
- H1: `West Palm Beach Condo Building Directory`
- Description: `Browse West Palm Beach condo developments by corridor and project stage. Review building guides, compare layouts and request a current pricing and floor-plan packet.`
- Opening: `Browse condo developments by corridor and project stage. Separate active-sales projects from announced plans, completed comparables and rental developments before comparing layouts or requesting a current pricing packet.`

The directory explains that project stage is not unit availability. Existing corridor/status controls and building cards remain; a native expandable guide separates active sales/construction, announced/planned, completed/rental/mixed-use. Buyer-fit framing is based on location, layouts, building scale, services and timing, not protected characteristics. The compact default presentation keeps filters usable on mobile.

Both introductions have **Request current availability** and **Get pricing + floor-plan packet** actions. Mobile buttons are full width with at least 44px tested touch height. The existing navy/ivory design, approved photos and global navigation are preserved. No useful evergreen research is gated and no price, inventory, incentive, fee or delivery date is invented.

## Implementation boundaries

`src/commercialEntry.ts` **statically imports** unchanged `src/main.ts`, then installs the shared commercial enhancement. The production Maps loader remains in the actual HTML entry bundle; this branch does not borrow the pilot's dynamic bootstrap or manifest lifecycle. Existing generated data, source records, public assets, `vite.config.ts`, lockfile, lead endpoint, analytics adapter and production deployment workflow are unchanged.

`src/lib/commercialContent.ts` is the single source for new copy, actions and guide content. Runtime enhancement survives existing route/filter renders. Postbuild updates only the existing Homepage and Buildings static HTML; it preserves canonical URLs, existing project links, application assets and a single existing JSON-LD graph. Schema page identity is retained. There are no new public routes or sitemap URLs and no links to `/floorplans/olara/residence-d/` or Alba's unpublished page.

The clean `/inquire/` journey uses an explicit context allowlist: `commercial:(home|buildings):(availability|pricing-packet)`. The inquiry bridge restores that context before the legacy submit handler, prefills the relevant existing interest option once and preserves the buyer's chosen project. No arbitrary query text, PII or additional Google tag loader is added.

Tests fill the real browser form and intercept its actual JSON POST to `/api/leads`. They assert selected building, request intent, CTA placement and landing context; dummy contact fields and token must be absent from the analytics queue and data layer. Raw test contact payloads are not stored in evidence. No real lead was sent.

## Source and technical verification

Current official sources checked September 5, 2026:
- Google Search Central title guidance: https://developers.google.com/search/docs/appearance/title-link — distinct descriptive titles and clear main headings; no title stuffing or ranking guarantee.
- Google Maps security guidance: https://developers.google.com/maps/api-security-best-practices — separate restricted review key; production settings unchanged.
- Olara official location: https://www.olarawestpalmbeach.com/location/ — waterfront/Flagler location context for the existing guide link.
- South Flagler House official site: https://www.southflaglerhouse.com/ — West Palm Beach waterfront context for the existing guide link.

No external fact was used to overwrite approved project data. Current unit availability and pricing remain requests for verification, not page claims. Corridor links use the site's existing canonical taxonomy. The rest of the copy explains comparison methods and the meaning/limits of existing filters.

## Verification record

Final implementation run: https://github.com/BrokenFL/WPB_New_Construction/actions/runs/33987101147
Credential-free job: `101362601986`. Required keyed job: `101362601848`.

**Credential-free job: SUCCESS. Required keyed job: blocked before build by K1. Aggregate release gate: blocked, not waived.**

| Check | Result on the exact revision |
|---|---|
| Full TypeScript check and production build | PASS; 99 existing routes, zero new URLs |
| Full candidate `npm test`, explicit no-key mode | PASS, including all existing launch/SEO/GEO/link/copy/privacy/consent/form/performance/Map-fallback/gatekeeper checks |
| Commercial regression tests | 6/6 PASS |
| Explicit no-key regression | 1/1 PASS |
| Existing building-master / article regressions | 6/6 and 15/15 PASS |
| Strict asset audit | PASS: 0 blockers, broken references or local-path leaks; 81 existing advisories |
| Static metadata/schema/canonical/internal-link checks | 2/2 pages PASS |
| Desktop/mobile, JavaScript on/off browser views | 8/8 PASS |
| Actual intercepted inquiry submissions | 8/8 PASS: 2 pages × 2 widths × 2 intents; analytics PII exclusion verified |
| Expanded-guide heading contrast | PASS across all eight configurations; measured 13.46:1 |
| Actual no-key entry preflight | Expected missing-loader rejection PASS |
| Synthetic configured production-entry preflight | PASS; loader inclusion only, not live Maps |
| Required keyed full suite / preflight / actual Google Maps | BLOCKED before build; not executed |
| Release readiness / Brooke approval / deployed / measured | Not established / pending / no / no |

Artifact: https://github.com/BrokenFL/WPB_New_Construction/actions/runs/33987101147/artifacts/9975527964
ZIP SHA-256: `1ca941a249812ed9af6392f2dc1add9166529df8d2d9a662be2e4c7d9d1bed58`.
Its embedded `tested-sha.txt` matches `aebc14f27d452c5870777df34c6f947e1ef2c8dc`. Safe results show eight browser views and eight intercepted submissions. The artifact contains full-page screenshots, expanded directory guidance, first-visit consent captures, presentation contrast results, strict asset audit and entry preflight; it does not contain deployable/credential-bearing bundles.

Final desktop/mobile captures were inspected after the navy-heading correction: readable commercial headings, prominent two-intent actions, loaded existing imagery, useful collapsed/expanded stage guidance and preserved directory controls. No-JavaScript HTML and original consent UI were also inspected. The pre-existing mobile contact bar is retained. The contrast check covers the new guide headings, not a claim of a full-site accessibility audit.

The credential-free workflow explicitly tests no-key fallback behavior and requires expected missing-loader rejection. A synthetic nonempty Maps configuration tests entry-loader inclusion separately, not real map validity. The read-only `commercial-preflight.mjs` verifies the actual HTML-loaded production entry and cannot pass because an unrelated file contains a Maps URL. It never deploys or uploads.

The separate keyed job must build with the approved dedicated review key, run the full candidate suite in keyed mode, run the entry preflight and targeted commercial checks, and verify real Maps loader/tile/zoom behavior on `/` and `/map/`. The key is only a build-step input; no Cloudflare credential or credential-bearing bundle artifact is present. An aggregate release-verification job requires both modes. The missing dedicated review secret is blocker **K1** in `docs/PHASE_2_DELIVERY_TRACKER.md`; production credentials/restrictions are unchanged. Credential-free success alone is not release readiness.

### Iterations and evidence integrity

Initial code `ccc11d24f1fa0f7a39e73b5822e8ac3a3db9a7a8`, run `33986266500`, passed the full credential-free suite and eight browser views/eight submissions. Manual screenshot inspection then caught inherited pale headings in new cards. Runtime CSS was corrected to the existing navy in `4f364dbb3f5451523c8c59a26c9adcb90dff07a1`, with computed contrast checks added.

Run `33986654097` passed typecheck/build/full credential-free suite/audit/preflights but the browser step stopped during a redundant element screenshot with a detached-DOM capture error. It was not reported as a passing final browser run. The final revision uses actual full-page screenshots, including expanded directory guidance, rather than those racing element captures. No contrast, filter, consent, navigation or submission assertion was removed or blanket-ignored.

Both first-visit consent UI and clean declined-consent captures are retained. The latter are made by clicking the actual No thanks control, not deleting or hiding the banner. Normal page scrolling triggers lazy-loaded images before capture. Screenshot review is implementation review, not Brooke's approval.

## Changed files and release coordination

Runtime/copy: `index.html`, `src/commercialEntry.ts`, `src/commercialGrowth.ts`, `src/commercialGrowth.css`, `src/lib/commercialContent.ts`.
Build/test: `package.json`, `research/scripts/prerender-commercial-routes.mjs`, `commercial-growth.test.mjs`, `commercial-preflight.mjs`, `check-commercial-growth.mjs`, `commercial-visual-review.mjs`, `check-commercial-maps-keyed.mjs`, `map-qa-mode.mjs`, `map-qa-mode.test.mjs`, `check-map-functionality.mjs`, `.github/workflows/p2-commercial-qa.yml`.
Documentation: this progress note and `docs/PHASE_2_DELIVERY_TRACKER.md`. A temporary source-only review workflow was removed before the implementation candidate.

Keep PR #73 draft until keyed verification passes and Brooke reviews the copy, layouts and inquiry actions. PR #72 and PR #73 were intentionally created from the production baseline independently: both touch entry/postbuild hooks. Before releasing both, reconcile those hooks on a reviewed integration branch and rerun combined tests. Neither independent result proves combined compatibility and neither may silently overwrite the other's entry point or postbuild tasks.

After authorized deployment, verify live metadata/canonicals/links/consent/inquiry behavior without polluting analytics, then evaluate the 7-day instrumentation, 28-day engagement/search and 60–90-day qualified-conversion windows from the actual release date. No approval, deployment or measured uplift is claimed here.

The unchanged lockfile's four high-severity findings, 81 asset advisories and Vite's chunk-size advisory remain the separate maintenance backlog. No automatic dependency upgrade was attempted; the repository's actual performance budget is the tested guard.
