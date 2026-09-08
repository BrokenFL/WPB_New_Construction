# Phase 2 buyer comparisons — Batch 2 / draft PR #78

Updated September 7, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.
Branch: `p2-buyer-comparisons-shortlist`.
Base: `df77653322cf064f76c9946766609733bdc78490`.

## Decision and authorization

**Implemented and tested; draft PR #78 awaits Brooke's separate review. Not approved, merged, deployed or measured.**

PR #76 was approved, merged as `8128f7a5a24706a8fc743f156f2f1d0505f1b462`, deployed once by automatic run 34152334484, and live-verified by run 34153465427 before this branch was created. Its 3 corridors, 12 desktop/mobile/JavaScript configurations, 18 intercepted inquiry POSTs and 33 links/assets are recorded in `docs/P2_76_RELEASE_VERIFICATION.md`. Main's documentation-only successor triggered no additional workflow.

Brooke's release approval covers #76 only. PR #75 remains **PARKED — blocked / non-critical / revisit separately**. Its branch, PR and analytics configuration were not changed or diagnosed here. No real leads, marketing emails, CRM-delivery certification or Batch 2 deployment.

## Canonical scope

- Improve the existing `/answers/north-flagler-vs-south-flagler-new-condos/`: individual block/bridge routines, layouts, service/cost differences and new-development versus completed alternatives.
- Add one substantive `/answers/olara-vs-ritz-carlton-vs-shorecrest/` for a three-project buyer decision, not mass-generated pairs.
- Add discovery from existing Answers, Compare and Olara/Ritz-Carlton/Shorecrest project guides. Preserve the existing Olara/Shorecrest Market Note URL.
- Link actual Olara Residence D HTML and preserved PDF/library, plan-comparison and fee answers. No new floor-plan entity; Alba remains held and excluded.

Each page has one H1, differentiated title/description, a clean canonical, matching WebPage/BreadcrumbList/ItemList, source citations and a truthful source-review date. Sitemap dates are September 7; generated `llms.txt` includes the new canonical. No fictional authors, offers, ratings, live inventory or guaranteed delivery. Global project facts remain unchanged.

## Official-source ledger

Sources checked September 7, 2026. Marketing is not available-unit inventory; completion guidance is dated and qualified.

| Source | Use and qualification |
|---|---|
| [Olara residences](https://www.olarawestpalmbeach.com/residences/) / [lifestyle](https://www.olarawestpalmbeach.com/lifestyle/) | Layout/terrace orientation, marketed 80,000+ sq. ft. amenities and marina. Slip rights, allocation, fees and shared amenities require documents. |
| [Gilbane Olara](https://www.gilbaneco.com/projects/olara-residences-gilbane-building/) | 1919 North Flagler, two- to four-bedroom-plus-den layouts and construction description. No disputed count or current closing date asserted. |
| [Ritz-Carlton residences](https://theresidenceswestpalmbeach.com/residences/) / [amenities](https://theresidenceswestpalmbeach.com/amenities/) | Dedicated elevator arrival, foyers, balconies, 10/11-foot ceiling description and service positioning. Verify selected-line and included/optional service details. |
| [BH Group](https://www.bhgroupmiami.com/projects/the-ritz-carlton-residences-at-west-palm-beach/) | 138 residences, selling/under construction, February 2026 groundbreaking and 2028 target. Counts are not available units. Official 1717/1745 street-number discrepancy is disclosed, not guessed away. |
| [Shorecrest residences](https://www.shorecrestwpb.com/residences) / [amenities](https://www.shorecrestwpb.com/amenities) | Two/three bedrooms, rooftop pool, spa, concierge and Lifestyle Director. Confirm current inclusions and partnership scope. |
| [Related Ross April 3 release](https://www.relatedross.com/press-releases/2026-04-03/related-ross-breaks-ground-shorecrest-ushering-new-chapter-west-palm) | Dated groundbreaking, 98 residences, four per floor and 1865 North Flagler. Reported 2027 completion requires a current update. |
| [South Flagler House](https://www.southflaglerhouse.com/) / [RAMSA](https://www.ramsa.com/news/article/south-flagler-house-tops-out-west-palm-beach) | Loggias, two- to five-bedroom offering, 50,000 sq. ft. club program, November 2025 topping out. Conflicting counts omitted; structural milestone is not occupancy. |
| [La Clara contractor](https://www.jm-a.com/portfolio/la-clara/) | Completed alternative; contractor records 2024 completion. No resale inventory, original finish condition or fee quote asserted. |

Buyer-fit guidance compares features and routines, not demographics or investment returns. Detailed cards are limited to this sourced set; broader corridor guides retain other projects. The existing outbound-domain policy is preserved: restricted developer sources have visible citation labels and full schema/ledger provenance rather than forbidden outbound anchors. No gatekeeper exemption or disguised redirect.

## Search Console limitation

The fresh retrieval required authorization and was declined; it was not retried. The last verified finalized August 8–September 4 snapshot is baseline context, not a new API result: North Flagler 8 clicks/351 impressions; South Flagler 0/21; existing Olara/Shorecrest Market Note 1/16; small North/South answer query sample of 2 impressions. The trio follows Brooke's priorities and source coverage, not invented exact-match demand. No post-release uplift or GA4 outcome claimed.

## Shortlist and implementation

`src/lib/shortlist.ts` permits only two comparison identities and their public project IDs. Minimum two distinct buildings, canonical order, bounded length; duplicate, arbitrary, cross-page and contaminated input is rejected. All 30 valid subsets are tested. Context such as `shortlist:trio:olara,shorecrest` stays within the existing analytics and server field limits.

The explicit checked IDs survive `lead_capture_context`/`cta_context` and the unchanged `normalizeLead()` function. Existing storage and notification code already consume CTA context; no database or endpoint change. The inquiry displays all selected names and an edit link. Its primary-building field does not delete the full list. New corridor/commercial/plan requests replace stale shortlist context; first touch and manual selections remain intact. Selection is not inferred from viewing history.

Shared content/schema: `src/lib/comparisonContent.ts`. Page startup/styles: `src/comparisonPage.ts` / `.css`. Discovery: `src/comparisonDiscovery.ts`. Bootstrap routes these two exact pages before the unchanged legacy core and retains native document navigation. Small `src/shortlistSummary.css` loads eagerly before the form bridge; the larger comparison styles remain lazy.

`research/scripts/prerender-comparisons.mjs` composes into the existing commercial postbuild adapter before floor-plan generation, using the private Vite manifest for static stylesheet references. Package scripts/lockfile stay unchanged. New contracts run through the existing integration test entry; browser verification lives in `check-comparisons.mjs`. The new branch-only workflow has read-only repository permission and no deployment action; the reviewed Maps key is supplied only to BUILD.

CI verifies byte-identical protected production surfaces: `src/main.ts`; analytics, consent, sanitizer and lead storage; corridor content/runtime/styles; existing commercial content/runtime/styles; floor-plan definitions; generated/public assets and PDFs; functions; package/lockfile; production deployment workflow.

## Exact tested revision and final results

**Tested implementation: `1b4ecc49693dafd09bb2be3abea9b93edff16c21`.**

[Run 34159423436](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34159423436): keyed **101859747256 SUCCESS**, no-key **101859748088 SUCCESS** (carried forward from initial successful job 101857931290), aggregate **101860776135 SUCCESS**.

| Check | Result |
|---|---|
| Typecheck, build, complete npm test | PASS both modes; 75 unit tests including 8 new comparison contracts |
| SEO/GEO, links, public-data/PII, performance, gatekeeper | PASS; no relaxed assertions or budgets |
| Standard/strict assets | PASS; 0 blockers, 81 existing advisories |
| Comparison static and browser checks | 2/2 static, 8/8 desktop/mobile/JS-on/off views per mode |
| Comparison intercepted submissions | 12/12 per mode; subset, edit/restore, primary choice and family switching |
| Corridor regressions | 12 views and 18 intercepted POSTs per mode |
| Existing commercial/floor-plan/integration | 12 prepared views and 24 intercepted POSTs per mode |
| Comparison discovery | 2/2 native journeys per mode |
| Keyed preflight and actual Maps | PASS; 4/4 loader/tile/zoom checks on home/map |
| No-key preflight | PASS expected missing-loader rejection; not working Maps |
| Protected-source/credential scans | PASS |

Final downloaded archives have verified SHA-256 hashes:
- [Keyed artifact 10032381849](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34159423436/artifacts/10032381849): `c3200a913d83bdaad0ecdfb0472ff0db776bbf7024efc0756048f11c97436a6c`.
- [No-key artifact 10032177416](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34159423436/artifacts/10032177416): `5662a0befda64f50e11478908e5c286453daba9fd3f5e7a7cbb536c641aa28ba`.
- Comparison timestamps: keyed `2026-09-07T20:41:15.905Z`; no-key `2026-09-07T20:31:26.851Z`.

Desktop/mobile comparison and inquiry screenshots were inspected. The inquiry shows Olara and Shorecrest while Shorecrest independently remains primary; screenshots precede synthetic contact entry. Consent prompts are shown as actually rendered. No key-bearing compiled bundles or raw contact payloads are archived.

## Review fixes and historical failures

Initial run 34157894443 caught missing new-route `llms.txt` discovery; fixed the generator, not the check. The disabled-shortlist test now explicitly checks `aria-disabled` and keyboard activation, retaining no-navigation/no-submission assertions. Run 34158318304 caught forbidden outbound developer anchors; source labels/provenance were retained without changing global policy. Visual review caught pale inquiry heading inheritance.

Run 34158945303 exposed summary styles arriving after the form bridge. The final code eagerly loads only the tiny summary stylesheet, preserving the shared performance budget and immediate color/width assertion rather than waiting to conceal the defect.

An initial keyed attempt of the final SHA timed out in an existing commercial status-filter reset (`check-commercial-growth.mjs:97`). Full repository checks, new comparisons, corridors, assets and Maps passed. The entire failed keyed job reran unchanged and passed. Its underlying timeout cause was not established or labeled fixed; the earlier result/artifact remains historical evidence. No assertion was waived.

## Limitations and next approval

All lead POSTs and third-party analytics in journey tests are intercepted. Server normalization is exercised locally; production CAPTCHA, CRM/email delivery and actual GA4 transport are not certified. No real leads or marketing emails were sent. No-JavaScript verifies research/navigation, not automatic shortlist transfer; modified/new-tab and pre-hydration context transfer are not certified. The comparison controls stay disabled until initialized, with honest no-JavaScript instructions.

Brooke reviews the two pages' copy/source qualifications, desktop/mobile presentation and selected-building flow before any separate release approval. This document and the tracker are a documentation-only successor to the tested code; PR #78 records that successor. Documentation CI skipping does not imply a newly tested application. Future plans, authorship and lead products remain separate. No next feature batch was begun.
