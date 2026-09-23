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

## Phase 3: metadata and hydration

New titles (exact before/after source values are in the Git diff):
- NORA House West Palm Beach | Prices & Floor Plans
- Banyan Tree Residences West Palm Beach | Buyer Guide
- Olara West Palm Beach | Prices, Floor Plans & Condos
- Ritz-Carlton Residences West Palm Beach | Floor Plans
- North Flagler New Construction Condos | Compare & Floor Plans

Existing H1s remain unchanged. Descriptions promise material actually covered.
Project titles/descriptions survive JavaScript hydration rather than existing
only in a crawler's static response. Google may rewrite either in search.

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
  existing 2028 estimate explicitly qualified, not freshly verified.

Active sales does not prove available units, commission, registration eligibility
or a guaranteed introduction. No such promises are added. Human/automated
approval files and schemaSafe approvals remain untouched; no Offer schema.

Canonical source, presentation fallback, copy and Compare current values align.
CSV is normalized to LF; regression tests preserve every unrelated row's values.
The 95-item baseline audit remains an honest review queue. Artifacts retain full
before/after queues and release-impact P0/P1/P2/P3 classifications. P2 outside
this batch is unresolved, not certified harmless. P3 differentiates matching
current values from intentionally retained historical-source/schema flags.
Original audit priority numbers are not equivalent to these release severities.

## Phases 5–7: plans, links and commercial engagement

Reuse `/floorplans/olara/residence-d/`; preserve every plan asset, count and URL.
NORA/Olara/Ritz link existing released-plan sections. Banyan has no published
packet in this library, so its action requests one instead of promising a file.
No 3D production changes. Only stale project-type metadata in the library refreshes.

Shared semantic buyer research appears in both static HTML and the SPA. Links
connect project, corridor, comparison and project-contextual inquiry. The NORA
buyer article and district article support the current project. Downtown no
longer groups marketed Banyan with non-offering proposals. Existing consent
controls remain; tests never submit real inquiries or production analytics.

## Implementation, QA and release

An exact-match idempotent source migration operates only on this review branch.
It never edits generated output. The existing generator adds a narrow
`--buyer-content-only` mode: no full asset-warehouse refresh or lost plan inventory.

Run model generator, Compare parser, schema generator and targeted buyer content;
repeat to confirm deterministic results. Then typecheck, build/postbuild, full
suite, focused source/prerender checks and Chromium/WebKit desktop/tablet/mobile
journeys. Logs, audit queues, tested-tree SHA and screenshots are the evidence.
This report alone is not a claim of passing checks.

The workflow can commit passing source/generated files only to its dedicated
review branch, never main; production credentials and deployment are absent.
Main and the user's uncommitted SSD work remain separate. Reconcile local work
before integration; do not blindly layer that separate patch over this branch.

After deployment and recrawl, compare matched finalized 28-day windows for fixed
query/page cohorts: qualified clicks, CTR, position and landing-page ownership.
Separate rank/search-mix changes from snippet changes. Inspect consented plan,
comparison and inquiry engagement where existing analytics permits. No present
claim of more leads, revenue or Google ranking improvements.
