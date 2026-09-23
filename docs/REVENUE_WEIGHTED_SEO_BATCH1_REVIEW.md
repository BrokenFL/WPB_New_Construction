# Revenue-weighted SEO — Batch 1 review

Prepared September 23, 2026. Base `572f109282bc63f2e012185efa14abf0dae9bfc2`.
Branch `codex/revenue-seo-batch1-review-2026-09-23`.

## Scope and provenance

Qualified for-sale buyer discovery for NORA House, Banyan Tree, Olara,
Ritz-Carlton West Palm Beach and North Flagler. The Sound and rental-search
optimization are excluded. This reconstructs the assignment from verified
GitHub source: Codex's uncommitted SSD files were not accessible or modified.

## Phase 1: observed search demand

Connected GSC, finalized August 24–September 20, 2026: 4,472 impressions,
50 clicks, CTR 1.118%, position 15.79. Prior July 27–August 23: 2,540 impressions,
67 clicks, CTR 2.638%, position 25.51. These are whole-site totals, not this cohort.

| Query/page | Impressions | Clicks | CTR | Position | Intent/action |
|---|---:|---:|---:|---:|---|
| North Flagler corridor, all queries | 342 | 7 | 2.05% | 10.11 | A/B: corridor owner; link specific plans/projects |
| north flagler drive | 7 | 0 | 0% | 10.57 | B: corridor |
| north flagler drive west palm beach | 10 | 0 | 0% | 11.40 | B: corridor |
| north flagler west palm beach | 5 | 0 | 0% | 4.60 | B: corridor |
| nora house condos for sale | 3 | 0 | 0% | 70.67 | A: dated article currently ranks; strengthen project |
| nora house west palm beach | 1 | 0 | 0% | 74.00 | A/B: canonical project |
| nora west palm beach homes for sale | 1 | 0 | 0% | 76.00 | A: condominium, not hotel |
| olara west palm beach | 1 | 0 | 0% | 5.00 | A/B: observed on distinct 2085 page; clarify identity |
| Banyan approval article, all queries | 80 | 1 | 1.25% | 8.14 | B: retain event page; support current project |
| Olara/Shorecrest comparison | 25 | 3 | 12% | 11.64 | A/B: preserve useful comparison |
| Olara Residence D PDF | 2 | 0 | 0% | 6.50 | A: support existing HTML guide; preserve PDF |

A = purchase research, B = relevant research, C = unrelated/rental traffic.
Missing top rows are not zero traffic. One-impression observations do not prove
cannibalization. No keyword-volume estimates or guaranteed uplift are claimed.

## Phase 2: page ownership

Project-name, price, layout and sales queries belong to the canonical project.
North Flagler location queries belong to the corridor. NORA District and Hotel
retain separate identities. Articles remain self-canonical with current-guide
links. No redirects or cross-canonicals between different developments.

## Phase 3: exact title changes

| Page | Before | After |
|---|---|---|
| NORA House | Nora House West Palm Beach · Nora District Luxury Condos | NORA House West Palm Beach · Prices & Floor Plans |
| Banyan Tree | Banyan Tree Residences West Palm Beach · Downtown Condos | Banyan Tree Residences West Palm Beach · Buyer Guide |
| Olara | Olara West Palm Beach · Waterfront Resort Condos | Olara West Palm Beach · Prices, Floor Plans & Condos |
| Ritz-Carlton | Ritz-Carlton Residences West Palm Beach · Waterfront Condos | Ritz-Carlton Residences West Palm Beach · Floor Plans |
| North Flagler | North Flagler Condos · West Palm Beach Buyer Guide | North Flagler New Construction Condos · Compare & Floor Plans |

The table uses a middle dot to display the actual title's pipe separator.
Exact title and description changes are in the Git diff. H1s are unchanged.
The metadata is preserved after JavaScript hydration, not just in crawler HTML.
Google may rewrite titles and descriptions; a ranking/CTR improvement is not promised.

New descriptions:
- NORA: Explore NORA House condos in West Palm Beach: published starting prices, released floor plans, rooftop amenities and buyer guidance before a sales-gallery visit.
- Banyan: Research Banyan Tree Residences West Palm Beach: corner layouts, OMA design, wellness amenities and an appointment-only sales gallery. Request current pricing.
- Olara: Compare Olara West Palm Beach floor plans, published starting pricing, marina amenities and North Flagler alternatives before requesting current availability.
- Ritz: Review Ritz-Carlton Residences West Palm Beach floor plans, branded services, North Flagler location and buyer questions before a private sales appointment.
- North Flagler: Compare North Flagler condos including Olara and Ritz-Carlton: released floor plans, waterfront settings, active sales and buyer guidance before a gallery visit.

## Phase 4: source consistency

Official sources checked September 23, 2026:
- https://norahouse.com/ — marketed condos from the low $2Ms. 955 N Railroad
  Avenue, Suite B is the sales gallery, not proof of the residence address.
  Current building address and delivery remain qualified.
- https://www.banyantreeresidenceswpb.com/ — appointment gallery at 400 Hibiscus,
  88 corner residences marketed. Earlier municipal 86 remains a conflict.
  No unverified $1.9M start or 2028/quarter-specific delivery is retained as current.
- https://www.olarawestpalmbeach.com/residences/ — $1.7M advertised start,
  300 Butler gallery. Existing reviewed 2028 override is preserved, not newly
  approved. Compare aligns to existing canonical 275; old 257 is recorded as
  historical conflict, not current inventory.
- https://theresidenceswestpalmbeach.com/residences/ — 1745 N Flagler residences,
  separate 340 Royal Poinciana Way M302 gallery. A developer legal entity's 1717
  name is not the published residence address. Current pricing by request;
  existing 2028 estimate is explicitly qualified, not freshly verified.

Active sales does not prove available units, commission, registration eligibility
or a guaranteed introduction. No such promises are added. Human/automated
approval files and schemaSafe approvals remain untouched; no Offer schema.
Current canonical source, presentation fallback, copy and Compare values align.
CSV is LF-normalized; regression tests preserve every unrelated row's values.

## Phases 5–7: plans, links and commercial engagement

Reuse `/floorplans/olara/residence-d/` and the existing approved library. All source
plans, asset URLs, approval data and 3D code remain untouched. The last parity
check found that the old harvest catalog disagreed with the approved library
used by the SPA. The generator now projects that same approved set into public
JSON and static pages for this cohort, in both full and buyer-only generation.
It does not remove source assets or approve new plans. The approved counts are:
NORA 32, Banyan 7, Olara 26, Ritz 12. These are layout records, not available units.
Banyan links directly to its seven-layout section rather than requesting a
packet as though no public layouts exist.

Shared buyer research appears in static HTML and the SPA. Links connect project,
corridor, comparison, plans and project-contextual inquiry. NORA's buyer/district
articles support the project. Downtown no longer groups marketed Banyan with
non-offering proposals. Existing consent controls remain. No real leads,
production analytics or marketing messages are generated by tests.

## Final consistency gate

The original 95-item advisory queue was triaged as 12 P0, 0 P1, 71 P2 and 12 P3
for this release scope. After the commercial corrections, the 94-item queue was
0 P0, 0 P1, 71 P2 and 23 P3. Reconcile with the latest run artifact: the diagnostic
audit deliberately retains historical-source conflicts and schema-review flags.
The 71 P2 items are outside Batch 1 and unresolved, not certified harmless.
No mass cleanup, new schemaSafe approval, rental optimization, 3D production or
rewriting of historical article facts is part of this task.

## Implementation, QA and release

The initial source migration is committed. Review runs no longer replay its
historically dated fact assignments. A bounded idempotent finalizer maintains
source fixes, and the existing generators produce derived outputs. The narrow
`--buyer-content-only` path avoids a full asset-warehouse refresh.

Validation includes repeated deterministic generation, typecheck, build and all
postbuild stages, full npm test, launch/links/schema/privacy/performance gates,
focused revenue tests, and Chromium plus WebKit at 1440px, 834px and 390px. The
browser checks five project/corridor views, preserved NORA inquiry context,
current NORA/Banyan Compare values and Banyan's seven-layout destination.
Actual outcomes, exact tested tree and final committed SHA are recorded in CI
artifacts and the PR receipt, not inferred from this document.

This review is no-key and makes no production-map claim. External requests are
blocked in its browser checks. The strict repository asset audit is separate;
blocked external images in a preview do not prove a production asset failure.

The workflow commits verified generated/source changes only to this dedicated
review branch. It never commits to main or deploys. Main and the SSD's uncommitted
Codex work remain separate. Do not blindly layer the old local patch over this
implementation. Owner release authorization is still required.

## Measurement and deferred scope

After deployment and recrawl, compare matched finalized 28-day windows for fixed
query/page cohorts: qualified clicks, CTR, position and landing-page ownership.
Separate rank/search-mix changes from snippet changes. Inspect existing consented
plan, comparison and inquiry engagement. Whole-site rental traffic is not success.
No present claim of leads, revenue or ranking uplift is made. South Flagler House
and Shorecrest remain Tier 2 candidates; no Tier 2 rewrite or mass floor-plan
route production is included.
