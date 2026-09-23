# Revenue-weighted SEO — Batch 2

September 23, 2026. Branch `codex/revenue-seo-batch2-review-2026-09-23`. Depends on unmerged Batch 1 PR #123, starting commit `1a5c9f90125580037e5b44c6e90ec8f53aeccd63`. Main was `572f109282bc63f2e012185efa14abf0dae9bfc2`. Moving to Batch 2 is not production release authorization.

## Scope

South Flagler House and Shorecrest publish sales-gallery contact/appointment paths. The South Flagler corridor supports the building-to-plan buyer journey. Active sales does not prove available units, broker registration, commissions or appointments. No The Sound/rental optimization, 3D work, redesign, new keyword pages or outreach. This branch is stacked against Batch 1 so its incremental changes are reviewable. The SSD's uncommitted Codex work was inaccessible and untouched.

## Phase 1: actual search evidence

The GSC planner was reread September 23 and still returned finalized **August 24–September 20, 2026**: whole-site 4,472 impressions, 50 clicks, 1.118% CTR, average position 15.79. This is not a post-change measurement. Missing top rows are not zero traffic; one-impression observations are hints, not proven cannibalization.

| Query/page | Impressions | Clicks | CTR | Position | Intent/action |
|---|---:|---:|---:|---:|---|
| Olara vs Shorecrest comparison, all queries | 25 | 3 | 12% | 11.64 | A/B: preserve comparison, link current guides |
| sales team south flagler house → dated buyer article | 1 | 0 | 0% | 61 | A: support canonical project and contextual inquiry |
| south flagler house phone number → buyer article | 1 | 0 | 0% | 9 | A/B: contact intent, not developer impersonation |
| south flagler house faq → North vs South answer | 1 | 0 | 0% | 70 | B: retain decision page, support project |
| south flagler house faq → waterfront event article | 1 | 0 | 0% | 78 | B: news is not the current offering |
| south flagler luxury condos → corridor | 2 | 0 | 0% | 92.5 | A: corridor discovery |
| south flagler west palm beach → corridor | 1 | 0 | 0% | 92 | B: geographic owner |
| Shorecrest project | Not returned | Not returned | — | — | Chosen for commercial relevance; no invented volume |

A means purchase research, B related research, C unrelated/rental. Targets were chosen for business relevance, not maximum impressions. Small samples may not support CTR conclusions.

## Phase 2: query ownership

Shorecrest name/prices/plans/sales → `/projects/shorecrest/`. South Flagler House name/prices/plans/sales → `/projects/south-flagler-house/`. South Flagler geographic comparison → `/corridors/south-flagler/`. Olara vs Shorecrest keeps its existing market-note URL. Historical articles retain their facts, dates and self-canonicals while linking to current project research. No cross-canonicals or redirects between distinct projects.

## Phase 3: metadata

Exact title changes, with middle dots standing for actual pipe separators:

| Page | Before | After |
|---|---|---|
| Shorecrest | Shorecrest West Palm Beach · Related Ross Waterfront Condos | Shorecrest West Palm Beach · Condos & Floor Plans |
| South Flagler House | South Flagler House · Flagship Waterfront Condos | South Flagler House West Palm Beach · Prices & Floor Plans |
| South Flagler | South Flagler New Condos · Waterfront & Completed Comparisons | South Flagler New Construction Condos · Plans & Buyer Guide |

New descriptions:
- Shorecrest: Explore Shorecrest West Palm Beach condos, released floor plans, rooftop amenities and North Flagler comparisons. Request current pricing before a sales-gallery visit.
- South Flagler House: Research South Flagler House prices, released floor plans, loggias and private-club amenities. Compare the waterfront residences before a sales-gallery appointment.
- South Flagler: Compare South Flagler new construction condos, South Flagler House floor plans and completed waterfront alternatives. Build a buyer shortlist before a sales-gallery visit.

H1s and design remain unchanged. Metadata must survive hydration. Google may rewrite titles/snippets; improved rankings or CTR are not promised.

## Phase 4: source review and consistent commercial fields

Official pages read September 23, 2026:

### Shorecrest

- https://www.shorecrestwpb.com/inquire — residence location **1901 N Flagler Drive**; separate gallery **616 Hibiscus Street**. Earlier 1865 references remain historical notes, not current address fields.
- https://www.shorecrestwpb.com/residences — two-/three-bedroom layouts, terraces and Rottet Studio interiors.
- https://www.shorecrestwpb.com/amenities — rooftop pool, wellness, work/dining spaces and services. Optional services are not all assumed included.
- https://www.relatedross.com/our-company/properties/shorecrest — for-sale offering and **100 units**, conflicting with earlier 98 references. Preserve disagreement; no new numeric schema approval.
- The former official `/floorplans` URL returned 404; existing approved local plans remain accessible.

No current numeric price or occupancy date was verified in those sources. Remove old $3.6M–$9.6M/$3.69M and 2Q 2027 as current guidance; request the current budget and deposit schedule instead of carrying forward exact unverified terms. Conflicting 27–28-story references remain qualified.

### South Flagler House

- https://www.southflaglerhouse.com/contact — appointment-only gallery **615 S Rosemary Avenue**.
- https://www.relatedross.com/our-company/properties/south-flagler-house — residences **1355 S Flagler Drive**, 28 stories and **108 units**.
- https://www.southflaglerhouse.com/residences — currently **105 residences**, Signature tier advertised from **$7.98M**, separate higher tiers/penthouses. Advertised tier pricing is not a live available-unit quote. One-bedroom guest suites are restricted to residence owners.
- https://www.southflaglerhouse.com/amenities — residents-only indoor/outdoor restaurant; remove the outdated Compare claim that a restaurant is unannounced. No private-marina entitlement was verified or promised.
- https://www.ramsa.com/news/article/south-flagler-house-tops-out-west-palm-beach — historic topping-out report **November 25, 2025**, with an older 109 count. This does not confirm occupancy.

Remove 1Q 2027 as current delivery guidance. Current canonical/copy/cards/Compare fields agree while count conflicts remain visible. No blanket re-verification of all building policies. Human/automated overrides, identity and schemaSafe approval files are unchanged.

## Phases 5–7: plans, links and inquiries

Reuse the approved library: **Shorecrest 4 layouts, South Flagler House 8**, not available-unit counts. Collapse the SFH north/south harvest aliases into one canonical public plan group so it is not counted twice. Full and buyer-only generation use the same projection. All approved source plans and 3D files remain untouched.

The existing byte-checked build registry preserves 70 Batch 1 document URLs plus 4 Shorecrest PDFs and 3 South Flagler shared site-plan images: **77 existing URLs**. No indiscriminate directory preservation or new plan approval.

Shared live/static research links connect projects, plan groups, comparisons and project-contextual inquiry. The South Flagler corridor links directly to SFH plans and a completed-building comparison. Both related market notes keep their historical facts and support the canonical guides. Requests go to The Scott Gordon Group, not directly to developer forms. No test submits leads.

## Verification and release boundary

A durable marker makes the source migration one-time; dated facts are not replayed in subsequent runs. Normal generators create derived files. Validation includes repeat generation, typecheck, build/postbuild, full npm test, focused schema/facts/links/plan preservation, Chromium/WebKit desktop/tablet/mobile and Batch 1 browser regressions. Asset audit reports are evidence only; tracked historical reports are restored.

Actual results, classified advisory counts, screenshots, tested tree and final SHA belong in the CI artifact and final PR receipt; this document does not assert success before execution. The guarded workflow may commit verified generated outputs only to the Batch 2 branch. It does not merge or deploy, exercise production-keyed Maps, deliver real leads, prove indexing or measure revenue.

## Measurement and dependencies

After separately authorized deployment and recrawl, compare matched finalized 28-day project/query cohorts: qualified clicks, CTR, position, destination-page ownership and existing consented plan/comparison/inquiry engagement. Separate rank/search-mix effects from snippet changes. Real appointments and brokerage outcomes require lead data.

Out-of-scope advisory findings remain unresolved, not certified harmless. Release Batch 1 first, then retarget/reconcile and revalidate Batch 2, or explicitly authorize a reviewed combined release. Do not silently merge Batch 2 into the unmerged Batch 1 branch.
