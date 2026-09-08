# Phase 2 delivery tracker — WPB New Construction

Updated September 7, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.
Requirements: `docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md` and Brooke's September 7 instructions.

## Current direction

**PR #76 is approved, merged, deployed and live-verified. Batch 2 is implemented and tested in draft PR #78, for review only.** Deployed application: `8128f7a5a24706a8fc743f156f2f1d0505f1b462`. Normal production deployment ran once. Main documentation successor: `df77653322cf064f76c9946766609733bdc78490`. See `docs/P2_76_RELEASE_VERIFICATION.md`.

**PR #75 / GA4 Admin diagnosis remains PARKED — blocked / non-critical / revisit separately.** Its code, PR and account configuration are untouched. Parked does not mean fixed; it is not a growth dependency. No GA4 delivery or measured uplift is claimed.

Batch 2 branch `p2-buyer-comparisons-shortlist` was created from updated production main after live success. [Draft PR #78](https://github.com/BrokenFL/WPB_New_Construction/pull/78) is not approved, merged, deployed or measured. Full sources/results: `docs/P2_COMPARISONS_IMPLEMENTATION_PROGRESS.md`.

Historical ledgers remain in `docs/P2_CORRIDOR_IMPLEMENTATION_PROGRESS.md`, `docs/P2_INTEGRATION_PROGRESS.md` and [the post-release main tracker](https://github.com/BrokenFL/WPB_New_Construction/blob/df77653322cf064f76c9946766609733bdc78490/docs/PHASE_2_DELIVERY_TRACKER.md). Earlier failures are not retroactively changed to passes.

## Status contract

Planned = scoped. Implemented = code/content exists. Tested = exact revision/evidence recorded. Approved = Brooke authorized it. Deployed = actual authorized publication. Measured = observed post-release first-party outcomes. Blocked = specific dependency, never a reason to halt unrelated tasks.

## Delivery ledger

| Task | Status | Branch / PR | Evidence | Blocker | Next action |
|---|---|---|---|---|---|
| Olara Residence D HTML/discovery | Implemented, tested, approved, deployed via #74; not measured | Production main | Existing PDF/preview/canonical/sitemap; live switching retained in #76 | None for retention | Verified expansion only in Batch 3 |
| Alba Residence D HTML | Implemented source hold; blocked, unpublished | Preserved implementation | August 2022 / 10-square-foot discrepancy; live 404 and sitemap exclusion | Developer source clarification | Preserve PDFs; no uncertain HTML |
| Homepage / Buildings | Implemented, tested, approved, deployed via #74; not measured | Production main | Distinct intent, listings before guidance, availability/packet | None for retention | Preserve during independent work |
| Batch 1: Downtown / South Flagler / Palm Beach | Implemented, tested, approved, deployed, live-verified; not measured | Merged #76 / `8128f7a5a24706a8fc743f156f2f1d0505f1b462` | Candidate34150578884; production34152334484; live34153465427 | No release blocker | Observe post-release GSC |
| Corridor availability + pricing/floor-plan packet | Implemented, tested, approved, deployed | #76 | 18 live intercepted POSTs; intent/building/corridor/first-touch/switching | Interception is not CRM certification | Retain separate request products |
| Batch 2: North/South Flagler and Olara/Ritz/Shorecrest | Implemented, tested; not approved/deployed/measured | `p2-buyer-comparisons-shortlist` / draft #78 | Existing canonical improved; one new substantive comparison; full ledger below | Brooke's independent copy/source/layout/flow review | No deployment under #76 approval |
| Compare my shortlist | Implemented, tested; not approved/deployed | Draft #78 | Explicit checked IDs survive payload and unchanged server normalizer; visible summary/edit; independent primary choice | Same review | Team fulfillment manual; no CRM claim |
| Authorship audit | Audit complete; implementation separately planned | #76 progress doc | Existing Brooke/team schema; per-article responsibility gap | Approved profile facts and actual responsibility | Real bylines/authorId/reviewerId; no fictional staff |
| PR #75 / GA4 diagnosis | Blocked / non-critical / parked | Existing #75 untouched | Historical evidence on its branch; not rerun | Separate future authorization/account work | Revisit separately |
| Very early / no-JavaScript attribution | Boundary documented; separate hardening planned | Live audit only; no runtime fix | Visible prerender can precede handlers; interactive tests require readiness | Progressive-enhancement design | Keep native navigation; do not confuse fallback visibility with attribution readiness |

## PR #76 release evidence

Approved code `04544146bc0187c46ec7fd1c90247fbffc5aee0d`; docs successor `ef5cf83136f43e85c417fd141b126b933bb978b9`; merge/deployment `8128f7a5a24706a8fc743f156f2f1d0505f1b462`.

Both candidate modes and aggregate passed before merge. Automatic production run **34152334484** succeeded, attempt 1, without duplicate manual deployment. Live run **34153465427** passed at **2026-09-07T18:57:28.444Z**: 3 static corridors, 12 desktop/mobile/JS-on/off views, 18 intercepted inquiries and 33 links/assets. Three sitemap dates are `2026-09-07`; Alba HTML remains 404. Artifact **10030217258**, verified SHA-256 `0ec881f1095640bf0a59243e0ffb9b8b63fb9ca90ad2f341a7d4fd9906aed13b`.

No-JavaScript covers content/navigation, not submissions. Interception does not certify production CAPTCHA or CRM delivery. No real lead or marketing email. Analytics/consent/sanitizer and production credentials remain unchanged. Very early clicks are outside initialized-flow assertions. The release documentation commit triggered no workflow.

## Batch 2 verification and measurement

**Exact tested implementation: `1b4ecc49693dafd09bb2be3abea9b93edff16c21`.** [Run 34159423436](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34159423436) passed: keyed101859747256, no-key101859748088 (successful original no-key result carried forward), aggregate101860776135.

Both modes passed typecheck/build/full npm test (75 unit tests, 8 new comparison contracts), SEO/gatekeeper, standard/strict assets (0 blockers, 81 existing advisories), protected-source checks, existing commercial/floor-plan/integration and corridor journeys. New comparisons: 2 static pages, 8 browser views, 12 intercepted POSTs and 2 discovery navigations per mode. Existing suites: 24 prepared views and 42 intercepted POSTs per mode. Keyed preflight and 4 actual Maps tile/zoom checks passed; no-key missing-loader rejection is explicitly enforced.

An initial keyed attempt at the same SHA timed out resetting an existing commercial status filter. The entire failed job reran unchanged and passed. The underlying timeout cause is unproven, not described as fixed; no assertion waived. Full chronology, sources, screenshots and limits are in the comparison progress document.

Verified archives: [keyed10032381849](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34159423436/artifacts/10032381849), SHA-256 `c3200a913d83bdaad0ecdfb0472ff0db776bbf7024efc0756048f11c97436a6c`; [no-key10032177416](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34159423436/artifacts/10032177416), SHA-256 `5662a0befda64f50e11478908e5c286453daba9fd3f5e7a7cbb536c641aa28ba`. Desktop/mobile pages and pre-contact-entry inquiry screenshots were inspected. No key-bearing compiled bundles or raw contact submissions archived.

These final documents are a documentation-only successor to the tested code, identified in PR #78. No-JavaScript covers research/navigation, not automatic shortlist transfer. No production CRM/CAPTCHA or GA4 transport certification. Brooke's separate #78 review remains required.

Fresh Search Console access was requested and declined; not retried. Last verified finalized **August 8–September 4** data remains baseline, not a fresh Batch 2 retrieval: Downtown49 impressions/0 clicks; South Flagler21/0; Palm Beach absent from returned rows, not assumed zero; North Flagler351/8; existing Olara/Shorecrest Market Note16/1. Official source coverage and Brooke's priorities justify the comparison; no invented exact-match demand or post-release uplift.

## Complete remaining roadmap

Each independent batch starts from then-current production main and gets verified sources, full checks, desktop/mobile evidence, exact tested SHA and draft PR. Only separately approved batches deploy.

| Item | Status | Evidence / scope | Dependency | Next action |
|---|---|---|---|---|
| P2-001 / Batch 3 verified plans | Planned | Additional actual Olara plans first, then clean official project sources | Matching current PDF/preview/facts | One entity per plan; preserve PDFs/context/compare/availability/mobile/schema/sitemap; Alba held |
| P2-002 priority project SEO | Planned | Rosewood, Maison d'Or, Fern/Gardenia/464 Fern, Rybovich | Official facts and GSC | Independent brand-intent work; no invented inventory/pricing/delivery |
| P2-003 curated comparisons | North/South and trio implemented/tested in #78; further work planned | Downtown/waterfront, preconstruction/completed; Alba/Shorecrest only if defensible | Comparable facts, not GA4 | Review #78 separately; no mass pairwise pages |
| P2-004 contextual leads | Availability/packet deployed; shortlist tested/in review; others planned | Explicit project/plan/corridor/shortlist, source and first touch | Product/fulfillment review | Keep PII boundary; tour/strategy requests and alerts separately |
| P2-005 Buyer Intelligence Report | Planned | Monthly changes, active-sales comparisons, pipeline/status, dated pricing where verified, plans, corridor snapshots, buyer questions | Verified period, owner, fulfillment | Gate assembled report only; evergreen research stays crawlable |
| P2-005 newsletter/preferences | Planned; no emails sent | Weekly changes and distinct monthly/project subscriptions | Explicit opt-in, preferences/unsubscribe, approved provider | Reuse editorial workflow; no unapproved automation |
| P2-006 real authors/reviewers | Audit done; implementation planned | Brooke Snader, Scott Gordon, other actual justified members | Approved facts and editorial responsibility | Visible profiles/bylines, explicit ownership and Person schema; truthful dates |
| P2-007 buyer due diligence | Planned | Deposits/contracts, assignments/resale, fees/closing costs, parking/storage, pets, docks, branded services, elevators, delays, plans | Authoritative current sources; general education | Useful linked guides; no individualized legal/financial advice |
| P2-008 lifestyle/feature guides | Planned | Marina access, branded, wellness, private elevators, pet-friendly, walkability, boutique/large-scale | Enough verified project-specific facts | Confirm rights/rules/costs; no thin pages or invented policies |
| P2-009 links/query ownership | Home/Buildings/corridors deployed; comparison discovery tested/in review; broader pass planned | Market=Home; browse=Buildings; geography=corridors; brand=projects; layout=plans; decision=comparisons; process=answers; dated news=updates | Useful context and GSC | Preserve canonical equity; link news to permanent entities; overlap is not proof of cannibalization |
| P2-010 GSC/GA4 measurement | GSC baseline available; outcomes unmeasured | 7-day instrumentation, 28-day search/journeys, 60–90-day conversion evaluation | Observation time; GA4 parked separately | Use GSC when authorized; no retrospective GA4 or fabricated uplift |

## Lead-product register

| Product | State | Fulfillment / next action |
|---|---|---|
| Send current availability | Home/Buildings/Olara/corridors deployed | Team confirmation, not live-inventory promise |
| Pricing + floor-plan packet | Home/Buildings/corridors deployed | Current team packet; open underlying research |
| Compare my shortlist | Implemented, tested, draft #78 review; not deployed | Explicit selected IDs and intent retained; team comparison response |
| Project-change alerts | Planned | Project-specific opt-in, preferences/unsubscribe, approved delivery |
| Monthly WPB New Construction Buyer Intelligence Report | Planned | Verified cadence/owner, assembled report, separate subscription consent |

Four existing high-severity dependency findings, 81 asset advisories and large-chunk warnings remain separate maintenance. No unrelated cleanup. Nothing authorizes #78 deployment or changes parked #75.
