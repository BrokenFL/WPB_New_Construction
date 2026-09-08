# Phase 2 delivery tracker — WPB New Construction

Updated September 8, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.
Requirements: `docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md` and Brooke's growth/release instructions.

## Current direction

**PR #76 and PR #78 are approved, merged, deployed and live-verified for initialized-page journeys. Batch 3 is authorized for implementation and separate draft review ONLY.** Current deployed application: `de5fd3d1581df372712d0f02ad54305d8f4f1b4b`. PR78's normal production workflow ran once. No duplicate manual deployment. See `docs/P2_COMPARISONS_IMPLEMENTATION_PROGRESS.md` and `docs/P2_76_RELEASE_VERIFICATION.md`.

**PR #75 / GA4 Admin diagnosis remains PARKED — blocked / non-critical / revisit separately.** Its code, PR and account configuration are untouched; parked does not mean fixed. It is not a growth dependency. No actual GA4 transport or measured growth is claimed. Declined Search Console authorization was not retried.

Historical full ledgers remain in the corridor/comparison/integration progress documents and their approved Git history. Earlier timeouts/failures are not retroactively recast as passes. This documentation-only release closeout does not change the deployed application or authorize another production workflow.

## Status contract

Planned = scoped. Implemented = code/content exists. Tested = exact revision and evidence recorded. Approved = Brooke authorized presentation/release. Deployed = actual authorized production publication. Measured = post-release first-party outcomes observed. Blocked = a specific missing dependency, never a reason to stop independent work.

## Delivery ledger

| Task | Status | Branch / PR | Evidence | Blocker | Next action |
|---|---|---|---|---|---|
| Olara Residence D HTML/discovery | Implemented, tested, approved, deployed via #74; not measured | Production main | Live #78 markup and exact preview/PDF hashes pass | None for retention | Add 4–6 defensible distinct plans using the existing framework in Batch 3 |
| Alba Residence D HTML | Implemented source hold; blocked, unpublished | Preserved implementation | August2022 / 10-square-foot discrepancy; live404 and sitemap exclusion | Developer source clarification | Preserve PDFs; no uncertain new HTML |
| Homepage / Buildings | Implemented, tested, approved, deployed via #74; not measured | Production main | Existing commercial and inquiry regressions remain green | None for retention | Preserve during independent work |
| Downtown / South Flagler / Palm Beach | Implemented, tested, approved, deployed via #76; live-verified, not measured | #76 / `8128f7a5a24706a8fc743f156f2f1d0505f1b462` | Production34152334484; live34153465427; repeated live #78 regressions pass | No scoped release blocker | Observe GSC when authorized; preserve current content |
| Corridor availability + pricing/floor-plan packet | Implemented, tested, approved, deployed | #76 | 18 live intercepted POSTs repeated after #78; request/first-touch/selected-building context | Interception is not CRM certification | Retain distinct intent products |
| North/South and Olara/Ritz/Shorecrest comparisons | Implemented, tested, approved, deployed, live-verified; not measured | Merged #78 / `de5fd3d1581df372712d0f02ad54305d8f4f1b4b` | Candidate34177737077; production34178444416; live34178933079 | No initialized-flow release blocker | Retain sources/canonicals and historical caveats |
| Compare my shortlist | Implemented, tested, approved, deployed | #78 | 12 live intercepted POSTs; edit/restore, independent primary choice and server normalization | Team fulfillment remains manual; no inbox/CRM certification | Preserve explicit selected IDs and separate request intent |
| Authorship | Audit complete; implementation planned separately | Corridor progress doc | Brooke/team identity exists; per-article responsibility gap | Approved profile facts and real editorial responsibility | Explicit author/reviewer fields and visible real-person bylines; no invented staff |
| PR #75 / GA4 diagnosis | Blocked / non-critical / parked | Existing #75 untouched | Historical evidence retained on its branch; no diagnostic rerun | Separate future authorization/account work | Revisit independently |
| Very early / no-JavaScript context transfer | Boundary documented; hardening planned separately | Live audit harnesses, no runtime fix | Visible prerender/form can precede click/navigation listeners | Progressive enhancement design | Preserve native navigation; do not call delayed-startup tests a production fix |

## PR #78 release evidence

Approved implementation `1b4ecc49693dafd09bb2be3abea9b93edff16c21`; docs successor `db5b5c0b79f9990cd39a1ec1e16c3f9d0451e4a4`; no-file-change verification commit `133e01510ce4632002794c53821ad81a71d7b75d`; merge/deployment `de5fd3d1581df372712d0f02ad54305d8f4f1b4b`. The successor, verification commit and merge have identical application code; main had no intervening work.

[Candidate run34177737077](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34177737077): final keyed101911442455, no-key101911442956, aggregate101912248497 all SUCCESS. Both full repository modes, assets, source protections, comparisons/corridors/commercial/plans/inquiries passed; keyed preflight and actual Maps passed. Expected no-key deployment rejection remains enforced.

[Production run34178444416](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34178444416), attempt1, normal main push, job101912413148: build, launchQA, gatekeeper and Cloudflare deployment SUCCESS. No manual deploy.

[Live run34178933079](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34178933079), audit job101913834233 SUCCESS: two comparison static documents, 8 comparison desktop/mobile/JS-on/off views, 12 intercepted comparison POSTs, 2 native discovery journeys, five static discovery blocks, 3 corridor documents, 12 corridor views, 18 intercepted corridor POSTs, approved Olara D image/PDF bytes and 4 real Maps loader/tile/zoom checks. Metadata/canonical/schema and comparison sitemap dates `2026-09-07` pass. Alba stays404/excluded. Live detail timestamp `2026-09-08T02:12:47.657Z`.

[Live artifact10038314335](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34178933079/artifacts/10038314335), downloaded/hash-verified: `2174f0b8d7659a9b79357c7226d64d21cc44fce6bb700c989682f0540a907fb3`. Desktop/mobile comparison and inquiry screenshots inspected. Safe source/results/screenshots only, no credential-bearing builds/raw lead payloads.

**Historical failures retained:** original implementation run34159423436 had a commercial-filter-reset timeout at `check-commercial-growth.mjs:97`; full failed keyed job passed unchanged on retry, root cause unproven. Release run34177737077 initially failed one desktop Maps completion check; other cases and complete suite passed; entire keyed job passed unchanged on retry, not claimed fixed. First live run34178483898 hit Edit-shortlist before lazy navigation initialization; final audit waits for full initialized shell/resources. No application correction was deployed, no assertion removed, and early clicks are not certified. Full records and digests are in the comparison progress document.

All buyer-journey POSTs and third-party analytics are intercepted. No real leads/emails sent. Normalizer tests are local; production CAPTCHA, inbox/CRM/email delivery, GA4 transport and measured growth are NOT certified. No-JavaScript covers research/navigation, not automatic shortlist transfer. Production analytics/consent code and credentials/restrictions are unchanged.

## PR #76 history

Approved04544146; docsef5cf831; merge/deploy8128f7a5. Production34152334484 succeeded once. Live34153465427 at2026-09-07T18:57:28.444Z: 3 static corridors, 12 views, 18 intercepted POSTs, 33 links/assets. Corridor sitemap dates2026-09-07; Alba404. Artifact10030217258 digest `0ec881f1095640bf0a59243e0ffb9b8b63fb9ca90ad2f341a7d4fd9906aed13b`. Full identities/limitations retained in `docs/P2_76_RELEASE_VERIFICATION.md`.

## Measurement baseline

The declined fresh Search Console authorization was not retried. Last verified finalized August8–September4 data is baseline context only: Downtown49 impressions/0 clicks; South Flagler21/0; Palm Beach absent from returned rows, not assumed zero; North Flagler351/8; existing Olara/Shorecrest Market Note16/1. Official source coverage and Brooke's priorities justified comparisons. No invented exact-match demand, retrospective GA4 data or post-release uplift.

## Complete remaining roadmap

Independent batches start from then-current production main, use verified sources, full checks, desktop/mobile evidence and exact tested SHAs. Only separately approved batches deploy.

| Item | Status | Scope / evidence | Dependency | Next action |
|---|---|---|---|---|
| P2-001 / Batch 3 Olara plans | Planned; implementation/review authorized, NOT deployment | Target4–6 distinct individual layouts, fewer if sources uncertain | Current official PDF matches approved preview/download/facts | Extend existing entity framework; retain revision uncertainty, actual review dates, plan/building inquiry context and discovery; Alba held |
| Additional project plans | Planned | Other projects only with clean current official sources | Defensible drawings/facts | No duplicate mirrors/version pages or page-count inflation |
| P2-002 priority project SEO | Planned | Rosewood, Maison d'Or, Fern/Gardenia/464 Fern, Rybovich | Official facts and authorized GSC | Independent brand intent; no invented inventory/prices/delivery |
| P2-003 further curated comparisons | North/South/trio deployed; others planned | Downtown/waterfront, preconstruction/completed; Alba/Shorecrest only if defensible | Comparable source depth, not GA4 | No thin mass pairwise pages |
| P2-004 contextual lead flows | Availability/packet/shortlist deployed; further products planned | Explicit project/plan/corridor/shortlist and first touch | Product/fulfillment review | Protect PII, manual selections and deliberate consent; tour/strategy separately |
| P2-005 Buyer Intelligence Report | Planned | Monthly project changes, active-sales comparisons, pipeline, dated pricing when verified, plans/corridors/buyer questions | Verified period, owner, fulfillment | Gate assembled report only; evergreen research remains crawlable |
| P2-005 newsletter/preferences | Planned; no emails sent | Weekly changes and separate monthly/project subscriptions | Explicit opt-in/preferences/unsubscribe/approved provider | Reuse editorial workflow; no unapproved marketing automation |
| P2-006 real authors/reviewers | Audit complete; implementation planned | Brooke Snader, Scott Gordon and justified actual team members | Approved facts/editorial responsibility | Person profiles/bylines, authorId/reviewerId and truthful review dates |
| P2-007 buyer due diligence | Planned | Deposits/contracts, assignments/resale, fees/closing costs, parking/storage, pets/docks/services/elevators/delays/plans | Authoritative current sources | Useful linked general education; no individualized legal/financial advice |
| P2-008 lifestyle/feature guides | Planned | Marina, branded, wellness, private elevators, pet-friendly, walkability, boutique/large-scale | Verified project facts and rights/rules/costs | No invented policies or thin feature pages |
| P2-009 linking/query ownership | Home/Buildings/corridors/comparison discovery deployed; broader work planned | Market=Home; browse=Buildings; place=corridors; brand=projects; layout=plans; decision=comparisons; process=answers; news=updates | Useful context and authorized GSC | Preserve canonicals/equity; news-to-entity links; overlap alone is not cannibalization |
| P2-010 measurement | GSC baseline exists; outcomes unmeasured | 7-day instrumentation, 28-day search/journeys, 60–90-day conversion evaluation | Observation time/authorized GSC; GA4 parked separately | No manufactured uplift or retrospective GA4 |

## Lead-product register

| Product | State | Fulfillment / next action |
|---|---|---|
| Send current availability | Home/Buildings/Olara/corridors deployed | Current team confirmation, not a live-inventory promise |
| Pricing + floor-plan packet | Home/Buildings/corridors deployed | Team-prepared current packet; underlying drawings remain open |
| Compare my shortlist | Approved/deployed/live initialized-flow verified via #78 | Explicit selected IDs retained; team comparison response |
| Project-change alerts | Planned | Project-specific opt-in/preferences/unsubscribe and approved delivery |
| Monthly WPB New Construction Buyer Intelligence Report | Planned | Verified cadence/owner/assembled report and separate subscription consent |

Four existing high-severity dependency findings, 81 asset advisories and large-chunk warnings remain separate maintenance. No unrelated cleanup. Batch3 and later features require separate release approval; PR75 remains untouched.
