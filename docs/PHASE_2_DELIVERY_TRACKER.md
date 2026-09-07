# Phase 2 delivery tracker — WPB New Construction

Updated September 7, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.
Requirements: `docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md` and Brooke's September 7 growth/release instructions.

## Current direction

**PR #76 is approved, merged, deployed and live-verified. Batch 2 is authorized for implementation/review only.** Deployed application: `8128f7a5a24706a8fc743f156f2f1d0505f1b462`. The normal production workflow ran once. See `docs/P2_76_RELEASE_VERIFICATION.md` for exact identities, evidence, test limits and live routes. This documentation-only closeout does not change the deployed application.

**PR #75 / GA4 Admin diagnosis remains PARKED — blocked / non-critical / revisit separately.** Its code, PR and account configuration are untouched; it is not a growth dependency. Parked does not mean fixed. No GA4 delivery or measured growth is claimed here.

Historical full ledgers are retained in `docs/P2_CORRIDOR_IMPLEMENTATION_PROGRESS.md`, `docs/P2_INTEGRATION_PROGRESS.md` and [the pre-release tracker](https://github.com/BrokenFL/WPB_New_Construction/blob/ef5cf83136f43e85c417fd141b126b933bb978b9/docs/PHASE_2_DELIVERY_TRACKER.md). Earlier failures are not retroactively changed to passes.

## Status contract

Planned = scoped. Implemented = code/content exists. Tested = exact revision and evidence recorded. Approved = Brooke authorized the presentation/release. Deployed = actual authorized production publication. Measured = post-release first-party outcomes observed. Blocked = specific dependency, never a reason to halt independent tasks.

## Delivery ledger

| Task | Status | Branch / PR | Evidence | Blocker | Next action |
|---|---|---|---|---|---|
| Olara Residence D HTML entity/discovery | Implemented, tested, approved, deployed via #74; not measured | Production main | Existing source PDF/preview, canonical/sitemap and inquiry tests; live switching retained in #76 | None for retaining pilot | Expand only with verified sources in Batch 3 |
| Alba Residence D HTML | Implemented source hold; blocked, unpublished | Preserved implementation; no public HTML | August 2022 source / 10-square-foot discrepancy; live 404 and sitemap exclusion confirmed after #76 | Developer source clarification | Preserve all existing PDFs; do not publish uncertain HTML |
| Homepage / Buildings commercial SEO | Implemented, tested, approved, deployed via #74; not measured | Production main | Distinct market/directory intent, listings before guidance, availability/packet requests | None for retention | Preserve during comparison work |
| Batch 1: Downtown / South Flagler / Palm Beach | Implemented, tested, approved, deployed, live-verified; not measured | Merged #76; `8128f7a5a24706a8fc743f156f2f1d0505f1b462` | Candidate run 34150578884, production 34152334484, live 34153465427; release record | No release blocker | Observe post-release GSC; preserve canonicals and source boundaries |
| Corridor availability + pricing/floor-plan packet | Implemented, tested, approved, deployed | #76 | 18/18 live intercepted POSTs; exact intent, chosen project, corridor, first touch and request-family switching; no real leads | No CRM-delivery certification from interception | Continue using distinct request products |
| Batch 2: North vs South Flagler; Olara/Ritz-Carlton/Shorecrest | Planned; implementation authorized, NOT deployment | New branch from updated production main, after #76 live verification | Existing North/South answer canonical, current official sources and fresh GSC | Source sufficiency and independent review | Improve existing comparison; create only justified additional canonical; test selected-building inquiry; open draft PR |
| Authorship audit | Audit complete; implementation planned separately | Audit in #76 progress doc | Existing Brooke Person/team schema; visible per-article responsibility gap | Approved profile facts and actual editorial responsibility | Real authorId/reviewerId and matching visible bylines; no fictional staff or blanket review claims |
| PR #75 / GA4 diagnosis | Blocked / non-critical / parked | Existing #75 untouched | Historical evidence on its own branch | Separate future authorization/account work | Revisit separately; do not block independent growth |
| Very early / no-JavaScript attribution | Boundary documented; hardening planned separately | Live audit branch only, no runtime fix | Static content can be clicked before JS listeners; final tests require genuine app readiness | Deliberate progressive-enhancement design | Preserve native navigation; do not confuse prerender visibility with attribution readiness |

## Latest release evidence and measurement baseline

#76 approved code: `04544146bc0187c46ec7fd1c90247fbffc5aee0d`; documentation successor `ef5cf83136f43e85c417fd141b126b933bb978b9`; merge/deployment `8128f7a5a24706a8fc743f156f2f1d0505f1b462`.

Both candidate modes and aggregate passed before merge. Automatic production run **34152334484** succeeded, attempt 1, without a duplicate manual deploy. Final live run **34153465427** passed at **2026-09-07T18:57:28.444Z**: 3 static corridors, 12 desktop/mobile JavaScript-on/off views, 18 intercepted inquiries and 33 live links/assets. All three sitemap dates are `2026-09-07`; Alba HTML stays 404. Final archive **10030217258**, verified SHA-256 `0ec881f1095640bf0a59243e0ffb9b8b63fb9ca90ad2f341a7d4fd9906aed13b`.

No-JavaScript covers content/navigation, not submissions. Intercepted tests do not certify production CAPTCHA or CRM delivery; no real leads or marketing emails were sent. Current analytics/consent/PII protections and production credentials remain unchanged. Very early pre-initialization clicks are outside the successful interactive-flow assertions; see release record.

Pre-release finalized GSC window **August 8–September 4, 2026**: Downtown 49 impressions / 0 clicks; South Flagler 21 / 0; Palm Beach absent from returned rows, not assumed zero; North Flagler 351 / 8 retained. These are baseline observations, not results caused by the new release. Post-release outcomes remain unmeasured.

## Complete remaining roadmap

Every independent implementation batch starts from then-current production main, has source-backed facts, full checks, desktop/mobile evidence, exact tested SHA and a draft PR. Only reviewed and explicitly approved batches deploy.

| Item | Status | Evidence / scope | Dependency | Next action |
|---|---|---|---|---|
| P2-001 / Batch 3 verified plan expansion | Planned | Olara entity framework; additional actual Olara plans first, then defensible official project drawings | Current source, matching preview/PDF/facts | One canonical per actual plan; preserve PDFs, context, comparison/availability links, mobile layout, schema and sitemap. Alba held |
| P2-002 priority project SEO | Planned | Rosewood, Maison d'Or, Fern/Gardenia/464 Fern, Rybovich | Current official facts and GSC opportunity | Independent brand-intent pages, stage/geography clarity, buyer verification; no invented inventory/prices/delivery |
| P2-003 curated comparisons | Batch 2 planned | North/South, Olara/Ritz/Shorecrest, downtown/waterfront, preconstruction/completed; Alba/Shorecrest only if defensible | Comparable verified facts, not GA4 | Useful location/scale/service/layout/status differences, verification list, project/plan links, shortlist CTA; no mass pairwise pages |
| P2-004 contextual lead flows | Availability/packet deployed; shortlist and other products planned | Distinct intent with selected project/plan/corridor, source and first touch | Product definition and fulfillment | Shortlist next; tour/strategy requests and project alerts separately; PII stays out of analytics |
| P2-005 Buyer Intelligence Report | Planned | Monthly What Changed, active-sales comparison, pipeline/status milestones, dated pricing only when verified, plan releases, corridor snapshot, buyer questions | Verified period, owner, fulfillment | Gate assembled report only; keep evergreen facts crawlable |
| P2-005 newsletter and preferences | Planned; no emails sent | Weekly development changes, separate monthly and project subscriptions | Explicit opt-in, unsubscribe/preferences, approved provider | Reuse existing editorial workflow; no unapproved marketing automation |
| P2-006 real people / authorship | Audit done; implementation planned | Brooke Snader, Scott Gordon, other actual members only where justified | Approved credentials/bios and actual responsibility | Visible profiles/bylines, explicit author/reviewer fields and matching Person schema; truthful review dates |
| P2-007 buyer due diligence | Planned | Deposits/contracts, assignment/resale, fees/closing costs, parking/storage, pets, dock rights, branded services, elevators, delays, plan comparison | Current authoritative sources and general-education boundaries | Focused guides linked to relevant research; no individualized legal/financial advice |
| P2-008 lifestyle/feature guides | Planned | Marina access, branded, wellness, private elevators, pet-friendly, walkability, boutique/large scale | Enough verified project-specific data | Confirm rights/rules/costs; no thin tag pages or invented policies |
| P2-009 internal links/query ownership | Home/Buildings/corridors deployed; broader pass planned | Market=Home; browse=Buildings; geography=corridors; brand=projects; layout=plans; decision=comparisons; process=answers; dated reporting=updates | Fresh GSC and useful context | Link winning news to enduring entities; preserve canonical equity; overlap is not proof of cannibalization |
| P2-010 GSC / GA4 measurement | GSC baseline available; outcomes unmeasured | 7-day instrumentation, 28-day search/journeys, 60–90-day qualified conversions after actual releases | Observation time; GA4 issue parked separately | Use GSC now; no retrospective GA4 claims or fabricated uplift |

## Lead-product register

| Product | State | Fulfillment / next action |
|---|---|---|
| Send current availability | Home/Buildings/Olara/corridors deployed | Team confirmation, not live inventory promise |
| Pricing + floor-plan packet | Home/Buildings/corridors deployed | Current team-supplied packet; open underlying research |
| Compare my shortlist | Planned; authorized in Batch 2 only | Preserve explicit building selection and comparison intent; independent review |
| Project-change alerts | Planned | Project-specific opt-in, preferences/unsubscribe and approved delivery |
| Monthly WPB New Construction Buyer Intelligence Report | Planned | Verified cadence/owner, assembled report and separate subscription consent |

Existing four high-severity dependency findings, asset advisories and large-chunk warnings remain separately tracked maintenance. No unrelated cleanup is mixed into the growth batches. Nothing in this tracker authorizes Batch 2 deployment or changes parked #75.
