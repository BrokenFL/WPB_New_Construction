# Phase 2 delivery tracker — WPB New Construction

Updated: September 7, 2026. Repository: `BrokenFL/WPB_New_Construction`.
Complete requirements: `docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md` and Brooke's September 7 growth instruction.

## Current direction

**Independent growth proceeds. PR #75 / GA4 Admin diagnosis is PARKED — blocked / non-critical / revisit separately.** It is not a dependency for corridor, comparison, verified-plan or authorship implementation. Its branch, PR and settings were not modified or diagnosed. Existing production analytics/consent/privacy code is preserved; parked does not mean fixed or measured.

Production baseline: `dd28320f689a3f377b6137671e702b6c58778b67`; deployed application from PR #74: `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7`. Original release evidence and measurement limitations remain in `docs/P2_INTEGRATION_PROGRESS.md`; the earlier complete tracker is retained in [production history](https://github.com/BrokenFL/WPB_New_Construction/blob/dd28320f689a3f377b6137671e702b6c58778b67/docs/PHASE_2_DELIVERY_TRACKER.md). Do not reclassify historical failures as passes or separately merge old input PRs.

Current growth review: [draft PR #76](https://github.com/BrokenFL/WPB_New_Construction/pull/76), independent branch `p2-corridor-seo-downtown-south-flagler-palm-beach`. No merge, deployment, auto-merge, real lead or marketing email.

## Status meanings

**Planned:** scoped but not implemented. **Implemented:** code/content exists. **Tested:** exact revision/evidence and limitations recorded. **Approved:** Brooke reviewed and approved. **Deployed:** authorized workflow actually published. **Measured:** post-release first-party outcome data exists. **Blocked:** a specific missing dependency, never a reason to halt unrelated work. These states are not interchangeable.

## Delivered and current review batches

| Task | Status | Branch / PR | Evidence | Blocker | Next action |
|---|---|---|---|---|---|
| Existing Olara Residence D HTML and discovery | Implemented, tested, approved, deployed through #74; not measured | Production main; #72 history included in #74 | Existing page, sitemap, original PDF/preview and intercepted attribution; original integration ledger | None for retaining scope | Keep existing URLs; expand only in verified-source Batch 3 |
| Alba Residence D HTML | Implemented source-review hold; blocked / unpublished | Preserved implementation, excluded from production HTML | August 2022 source and 10-square-foot discrepancy; no HTML/sitemap/discovery; PDFs intact | Current official source clarification | Resolve drawing/facts before reconsidering publication; no page-count expansion with uncertain plans |
| Homepage + Buildings | Implemented, tested, approved, deployed through #74; not measured | Production main; #73 history included in #74 | Listing-first directory, distinct query roles and availability/packet actions | None for retaining scope | Preserve current presentation while extending corridor request context |
| Batch 1: Downtown + South Flagler + Palm Beach corridor SEO | Implemented, tested; orchestrator review recommends release approval; not approved/deployed/measured | New production-based branch / draft #76 | Exact tested HEAD `04544146bc0187c46ec7fd1c90247fbffc5aee0d`; run 34146486527; current screenshots and progress doc | Brooke's release decision; no GA4 dependency | Review 3 existing routes and release only after explicit approval |
| Corridor availability/packet context | Implemented, tested; not approved/deployed | #76 shared inquiry bridge extension | 18/18 new intercepted POSTs per mode; corridor, selected building, product and first touch preserved; request-family switching passes | Same batch review | Preserve manual selections and PII exclusion; retain distinct products, not generic Contact-only flow |
| Parallel authorship audit | Audit completed; real-person implementation planned separately | Findings in #76 progress doc | Existing Brooke schema, team identity, metadata-strip and content-model audit | Actual per-article responsibility and approved profile data | Explicit author/reviewer fields and visible bylines in a separate batch; Scott/other names only where justified |
| PR #75 / GA4 diagnosis | **Blocked / non-critical / revisit separately; PARKED** | Existing #75 untouched | Historical evidence on its own branch; not rerun here | Separate future authorization/account work | Leave parked; do not delay independent growth or invent retrospective GA4 outcomes |

## Batch 1 current verification — refreshed by orchestrator September 7

**Exact tested HEAD: `04544146bc0187c46ec7fd1c90247fbffc5aee0d`.** [Run 34146486527](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34146486527): keyed `101819538484`, no-key `101819538652`, aggregate `101820510446` all SUCCESS, independently checked through GitHub. Full repository tests and both candidate modes passed. The latest keyed artifact confirms 3 static pages, 12 corridor browser configurations, 18 intercepted corridor/switching submissions and 4 real Maps checks. Existing commercial, floor-plan and combined regressions also passed in CI.

The keyed archive was downloaded; its digest and embedded tested SHA were verified. Latest desktop/mobile corridor screenshots and full-page desktop layouts were inspected, alongside selected source changes. No new release blocker was identified in that scoped review. This does not represent a new run or independent re-verification of every external project fact.

- [Keyed artifact 10027937467](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34146486527/artifacts/10027937467): verified downloaded SHA-256 `74c3035964c6db0124bf1ae9cd8183ee17f7225e9ef7b68f39d31e63840691c3`.
- [No-key artifact 10027928146](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34146486527/artifacts/10027928146): GitHub-reported SHA-256 `f4e01349cfb94c858dd5f2b4c94da65412adbe0516a6249dcef263b2a1b19528`; job success verified, archive not separately downloaded in this review.

The most recent implementation change only corrects browser-test hydration readiness. Any documentation-only successor must remain distinct from the exact tested code. Earlier ledgers are preserved below. **Recommendation: approve for release; actual Brooke approval is still pending.** No main write or deployment occurred. PR #75 remains parked; production CAPTCHA/CRM delivery and GA4 transport remain outside the passing intercepted tests.

## Batch 1 search and historical verification ledger

Finalized Search Console window **2026-08-08–2026-09-04**, retrieved September 7: Downtown corridor 49 impressions / 0 clicks; South Flagler 21 / 0; Palm Beach not present in returned rows, not assumed zero. North Flagler 351 / 8 stays protected. Small query samples support condo-versus-rental and city-core/NORA/Clear-Lake clarity. These are pre-release observations, not measured uplift.

**Earlier tested implementation: `1e9d469907553f28a7abed286784007cd925f6a0`.** [Run 34145165695](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34145165695): keyed `101815507868`, no-key `101815508191`, aggregate `101816509300` all SUCCESS. Both modes passed typecheck, build, complete npm test including 7 corridor contracts, SEO/gatekeeper and standard/strict asset audits. New corridor static checks 3/3; browser configurations 12/12; intercepted inquiries 18/18 per mode. Existing suites added 12 prepared configurations and 24 intercepted submissions per mode. Actual Maps 4/4 and keyed preflight passed; no-key deployment rejection is explicitly enforced. Final desktop/mobile screenshots were inspected. Zero asset blockers; 81 existing advisories.

Historical verified artifacts: [keyed 10027482355](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34145165695/artifacts/10027482355), [no-key 10027463491](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34145165695/artifacts/10027463491). Full digests, sources, review fixes and test limitations are in `docs/P2_CORRIDOR_IMPLEMENTATION_PROGRESS.md`. Current-head evidence is recorded in the refreshed ledger above; historical results are not substituted for it.

Production analytics/consent code and credentials remain unchanged. Client lead/analytics requests are intercepted; real Maps uses the reviewed key only in BUILD. No-JavaScript covers content/navigation, not submission. Local consent/PII/event checks do not imply that parked GA4 transport is fixed. Review artifacts are not deployed previews.

## Complete remaining handoff roadmap

Each implementation batch branches from then-current production main, remains independently reviewable, opens a draft PR, records exact tested SHA/screenshots/limitations and awaits approval before deployment.

| Task | Status | Branch / PR | Evidence / basis | Blocker or dependency | Next action |
|---|---|---|---|---|---|
| Batch 2 / P2-003: high-value buyer comparisons | Planned; no new comparison page shipped | Separate branch after Batch 1 is reviewable; not created in #76 | Existing North-vs-South, downtown-vs-waterfront and preconstruction-vs-completed answers; current GSC and corridor sources | Sufficient comparable verified facts, not GA4 | Evaluate North vs South Flagler first, then Olara/Ritz-Carlton/Shorecrest, Alba/Shorecrest where defensible and waterfront vs downtown. Include buyer fit, location, scale/service, layouts, status/timing, verification list, plan/project links and shortlist CTA. Improve useful existing canonicals rather than duplicate them |
| Batch 3 / P2-001: verified floor-plan expansion | Planned | Separate source-verified branch; none created in #76 | Production Olara entity framework and released PDF archive | Current defensible official drawing; exact preview/PDF/facts agreement | Additional Olara plans first, then clean official project sources. One entity per actual plan, not mirrors/collections. Preserve source PDF, useful facts, building/comparison context, mobile CTA, canonical schema/sitemap/discovery. Alba remains held |
| P2-002: priority project SEO | Planned | Separate project batches | Handoff order Rosewood → Maison d'Or → Fern/Gardenia/464 Fern cluster → Rybovich Marina, revalidated with current GSC | Current official source and page-specific opportunity | Distinguish branded entities, planning and active sales; dated buyer guidance and corridor links; no invented inventory/prices/delivery |
| P2-004: broader contextual lead flows | Partly deployed via #74; corridor extension tested in #76; remaining products planned | Individual product rows below; separate future branches | Existing allowed attribution and inquiry framework | Define each product's fulfillment and consent | Compare-my-shortlist, tour/buyer strategy and low-intent updates without forcing every visitor into generic Contact Us |
| P2-005: Monthly Buyer Intelligence Report | Planned; not implemented/sent | Separate report/product branch | Existing editorial/news workflow | Verified monthly period, owner and fulfillment | What Changed; active-sales comparison; pipeline/status/delivery milestones; dated pricing only if sourced; plan releases; corridor snapshot; due-diligence questions. Gate assembled report, not underlying evergreen research |
| P2-005: newsletter/preferences/repeat visits | Planned; no new email automation | Separate product branch | Existing reporting/signup architecture; What Changed in WPB Construction This Week concept | Explicit opt-in, preferences/unsubscribe and approved provider | Keep project-change and monthly-report subscriptions distinct; no marketing sends without authorization |
| P2-006: real author/reviewer profiles | Planned following completed source audit | Separate authorship batch | Legitimate Brooke/team identities; article metadata gap recorded in #76 | Approved bios/credentials/relationships/profile URLs and actual review responsibility | Explicit authorId/reviewerId, visible bylines, real review dates and matching Person schema. Scott Gordon or other actual members only when justified; no fictional editorial staff |
| P2-007: buyer due-diligence series | Planned | Separate education branch | Before You Buy handoff specification | Current authoritative legal/financial sources; general-education boundaries | Deposits/developer contracts; assignment/resale; fees/closing costs; parking/storage; pets; marina/dock rights; branded services; elevators; delays; floor-plan comparison. Separate general guidance from project terms |
| P2-008: lifestyle/feature comparisons | Planned | Separate comparison/guide branch, not mass tag pages | Marina access, branded, wellness, private elevators, pet policies, downtown walkability, boutique vs larger properties | Enough verified project-specific facts | Evaluate every proposed theme; create only supported useful comparisons. Verify rights, rules and costs; marketing labels do not establish access or pet policy |
| P2-009: query ownership/internal links | Home/Buildings deployed; 3-corridor extension tested in #76; site-wide pass planned | #74, then #76; later contextual-link batch | Home=market; Buildings=browse; corridor=geography; project=brand; plan=layout; comparison=decision; answer=process; update=dated reporting | Fresh GSC and meaningful link context | Preserve winning canonicals; link successful news to durable guides; avoid needless overlap. Query overlap alone is not proven cannibalization |
| P2-010: Search Console / GA4 outcome measurement | Current GSC baseline retrieved; post-batch outcomes not measured | #76 baseline; no measurement automation added | Finalized windows, queries/pages, CTR and position | Deployment plus observation window; GA4 uncertainty parked separately | Use GSC for priorities now. Later 7-day instrumentation, 28-day search/journey and 60–90-day qualified-conversion reviews from actual release dates; no invented retrospective GA4 data |

## Lead products — separate from generic contact

| Product | State | Context / fulfillment | Next action |
|---|---|---|---|
| Send current availability | Home/Buildings/Olara deployed; corridor extension implemented/tested in #76 | Explicit availability request plus building/plan/corridor origin; team confirmation | Review payload and buyer wording; no live inventory promise |
| Pricing + floor-plan packet | Home/Buildings deployed; corridor extension implemented/tested in #76 | Distinct packet intent; current team-supplied documents, not an invented instant download | Review fulfillment and attribution; keep underlying plan research open |
| Compare my shortlist | Planned | Separate decision-assistance product for curated comparisons | Define selected buildings, comparison questions and allowed attribution in Batch 2 |
| Project-change alerts | Planned | Specific project interest and explicit ongoing subscription consent | Preferences/unsubscribe and approved delivery; no automatic email send |
| Monthly WPB New Construction Buyer Intelligence Report | Planned | Monthly assembled buyer report, distinct from contact and transaction inquiries | Verify cadence/owner and fulfillment; release separately |

## Review discipline

Passing tests do not confer approval or deployment. A later release needs explicit review, the normal production workflow and live checks. Four pre-existing high-severity dependency findings, asset advisories and large-chunk advisories remain maintenance items; no unrelated cleanup is mixed in. Unneeded source contradictions are omitted rather than silently fixed. PR #75 stays parked and non-critical for this growth roadmap. Batch 1 is ready for review; comparison, plan and authorship implementations remain separate.
