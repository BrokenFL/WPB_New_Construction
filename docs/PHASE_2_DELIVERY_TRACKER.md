# Phase 2 delivery tracker — WPB New Construction

Updated: 2026-09-06 UTC. Repository: `BrokenFL/WPB_New_Construction`.
Complete requirements: `docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md`.

## Current release status

**PR #74 remains deployed; PR #75 remains an unmerged draft. Integrated-release acceptance is OPEN for V1/V1-H.** Brooke reports Enhanced Measurement Page views enabled with its advanced browser-history option OFF for `G-0LGBH6MDVX`. Both full candidate modes were rerun twice after that report, but the actual downloaded Google tag still produces an extra history page view containing synthetic query data in its referrer. That request was aborted before transmission. The saved UI report is not disputed; its effective behavior is not yet reflected in runner results.

| Identity / action | State |
|---|---|
| Exact candidate tested after the reported setting change | `a8af3e67e54bfcaba75a08c4a7b8074c19b96a21` |
| Focused wrapper correction commit | `69c4eb2921829081acc47053d890fb6c18e8748d` |
| Corrective branch / PR | `fix/ga4-command-queue` / [#75](https://github.com/BrokenFL/WPB_New_Construction/pull/75), draft |
| Main verified before this documentation closeout | `dd28320f689a3f377b6137671e702b6c58778b67`, unchanged |
| Deployed application / original integrated release | `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7` / #74 |
| Corrective merge / deployment | None / not initiated |
| Corrective actual-production collector acceptance | Not run: failing candidate gate prevents release |
| Outcome measurement | Not started; no measured Phase 2 uplift or retrospective GA4 data claimed |

This is a documentation-only successor to the tested candidate, not a new tested implementation. The complete earlier tracker is retained [at the pre-continuation SHA](https://github.com/BrokenFL/WPB_New_Construction/blob/a8af3e67e54bfcaba75a08c4a7b8074c19b96a21/docs/PHASE_2_DELIVERY_TRACKER.md). All remaining handoff tasks are retained below. No new Phase 2 feature branch or batch was started.

## Status contract

Implemented means code/content exists. Tested identifies exact SHA, scope and exclusions. Approved requires Brooke's authorization; corrective merge/deploy approval remains conditional on green required gates. Deployed records a real production release, not merely a successful build. Live acceptance closes only after every required live check passes. Measured requires actual post-release first-party outcomes, not a simulated submission. A blocked measurement/source task does not forbid independently authorized work, but this particular task does not authorize another batch.

## Delivered scope and corrective acceptance

| Task | Status | Branch / PR | Evidence | Blocker | Next action |
|---|---|---|---|---|---|
| P2-001 Olara Residence D HTML pilot | Implemented, tested, approved and deployed through #74; live route/assets/attribution passed; outcomes unmeasured | `astra-phase-2-growth` / #72, integrated in #74 | Published plan, discovery/sitemap and approved asset byte checks; intercepted inquiry payloads | V1 affects measurement, not plan publication | Preserve released page and existing PDFs; additional plans require a later verified-source batch |
| P2-001 Alba Residence D HTML | Implementation/source review retained; UNPUBLISHED | #72 history in #74 | No generated HTML, public lookup, sitemap or discovery; live route 404; PDFs unchanged | Developer clarification: REV. 8/2022 and 10-square-foot area discrepancy | Obtain current official drawing/area schedule and verify preview/PDF/facts before separate publication approval |
| P2-002 Homepage + Buildings | Implemented, tested, approved and deployed through #74; outcomes unmeasured | `astra-p2-002-home-buildings` / #73, integrated in #74 | Broad-search Homepage versus directory intent, titles/descriptions/opening copy, actions, listing-first Buildings; desktop/mobile checks | V1 affects measurement | Preserve design, clean canonicals, existing geography/project/compare links and inquiry actions |
| Shared startup/postbuild/inquiry integration | Implemented, tested, approved and deployed | `astra-p2-integrated-release` / #74 | One startup/context owner; full suites; 24 candidate POSTs per mode and 12 original live intercepted POSTs | V1 prevents complete integrated acceptance | Preserve first-touch attribution, replace stale commercial/plan defaults, respect manual choices; no separate #72/#73 release |
| K1 restricted-key Maps verification | RESOLVED | #74 and #75 | Required keyed preflight and 4/4 real Maps loader/tile/zoom checks again pass in attempts 2 and 3 | None | Keep review key build-only and production restrictions unchanged |
| V1 native gtag command queue | Implemented, exact-source regression passed, not merged/deployed | `fix/ga4-command-queue` / #75 | Native Arguments wrapper; one initial clean actual-tag candidate view after consent | Effective automatic-history conflict; required aggregate and later live collection | Resolve served configuration discrepancy, pass both candidate modes and gate, merge expected head, allow one automatic deploy and require real Google receipts |
| V1-H effective history tracking | OPEN despite reported saved EM change | #75 actual-tag test; separate read-only diagnostics on existing `p2-74-release-audit` | Attempts 2/3 still block extra `page_view` with private markers in `dr`; fresh public script flags true at 19:47 and 19:53 UTC | Saved UI versus served tag behavior unresolved; no connected account-settings reader/writer | Check same stream's Google tag → Configure tag settings → Show all → Manage automatic event detection → Page views on browser history change OFF; preserve EM history OFF and Page views ON; if both already OFF, inspect saved-state evidence rather than repeatedly toggling |

## Latest exact-SHA verification ledger

[Run 34053296879](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879) resumed against `a8af3e67e54bfcaba75a08c4a7b8074c19b96a21`:

| Attempt | Keyed job | No-key job | Aggregate | Result |
|---|---|---|---|---|
| 2 | `101547054455` | `101547054328` | `101547657692` | FAILED only at added actual-tag navigation/privacy regression |
| 3 | `101548061531` | `101548061690` | `101548765624` | Same failure; no bypass |

Both modes passed typecheck/build, full npm test including actual wrapper command semantics and the existing 60 unit regressions, launch/SEO/GEO/privacy/forms/performance/gatekeeper, assets:audit plus strict audit, both prepared browser suites and combined journeys. Each mode covers 12 prepared page configurations and 24 intercepted inquiry POSTs. Keyed preflight/real Maps pass; no-key deployment rejection is an explicit passing negative assertion.

Actual-tag initial consent checks pass at 1440px and 390px: no tag/collection while unset; after Allow analytics, one primary tag, native Arguments, correct measurement ID, one clean manual page view and all three advertising-consent fields denied. Fresh rejection persists across navigation with zero tag or collection requests. Home → Buildings still generates a third, unsafe automatic page-view attempt beyond two clean manual page views. It is blocked before network transmission. The new actual-tag inquiry-conversion sequence stops at that failure and is not counted as passed by the older client-payload tests. Candidate collector responses are intercepted, not proof of production receipt.

Final keyed artifact [9996057597](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879/artifacts/9996057597), SHA-256 `ec7c5d937e1ee1327b9fa3d7687ff20fd8787c5365e429b64ddd77893f18bc22`; no-key [9996055585](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879/artifacts/9996055585), reported SHA-256 `b58f0d1049b40ddb2489e835d6f76b9aecd750d5ca1b68858cfd1868f44634c0`. Final keyed artifact was downloaded/digest-checked and all 57 files scanned for Google/GitHub credential patterns. Resumed desktop/mobile screenshots were inspected; no visual change was made.

[Public tag diagnosis 34055994842](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34055994842), latest artifact [9996051612](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34055994842/artifacts/9996051612), fetched normal and cache-busted public script responses without collection or settings writes. At 19:53:39 UTC both still showed `vtp_enableHistoryEvents: true` and `vtp_historyEvents: true`. This is served-code evidence, not proof of saved UI state or a guaranteed propagation schedule. Detailed hashes, earlier checks and scoped log audit are in `docs/P2_INTEGRATION_PROGRESS.md`.

## Required corrective release and live acceptance

Only green checks on the then-current release head satisfy Brooke's conditional merge authorization. Mark #75 ready, merge the verified expected SHA normally, and allow the existing main workflow to deploy exactly once. Do not bypass a red gate, reuse/relax production credentials, or issue a duplicate manual deployment.

The post-deployment live workflow must obtain successful real Google collector responses to `G-0LGBH6MDVX` on `/`, `/buildings/`, `/projects/olara/` and `/floorplans/olara/residence-d/` at desktop/mobile widths. Require one intended page view per tracked transition, one tag per document, no PII/query contamination in location/referrer or other fields, correct consent and rejected-consent inactivity. Confirm Maps, site pages, Olara assets/sitemap and actual client inquiry payloads. Lead POSTs, synthetic conversion events and the browser-only challenge fixture remain intercepted; this does not claim production CAPTCHA/CRM delivery.

Record corrective commit, tested candidate, PR, merge SHA, automatic deployment and live network evidence in both documents. Close V1/V1-H and integrated acceptance only after live success, then stop. A loaded Google script, local command queue or mock collector response is insufficient.

## Complete remaining handoff roadmap — no advancement in this continuation

| Task | Status | Branch / PR | Evidence / basis | Blocker or dependency | Next action |
|---|---|---|---|---|---|
| P2-001 Additional verified individual floor-plan pages | Queued; not implemented/tested/approved/deployed/measured | Future separate plan-coverage branch; none created | Olara framework with explicit source/publication gate | Current official source, preview/PDF/fact agreement and useful distinct layout per plan | Select small high-value set, verify logical plan/version, preserve mirror/source deduplication and PDF URLs; exclude collections/indexes/fact sheets from individual entities |
| P2-002 Corridor SEO: Downtown → South Flagler → Palm Beach | Queued | Future separate commercial branch; none created | Handoff order, finalized GSC, existing North Flagler Phase 1 work | Fresh page/query data and project sources | Give each corridor distinct search intent, answer-first buyer guidance, useful links and contextual action while retaining winning URLs |
| P2-002 Priority project SEO: Rosewood → Maison d'Or → Fern/Gardenia/464 Fern cluster → Rybovich Marina | Queued | Future project-SEO batches; none created | Handoff priorities, not guaranteed demand | Current official project facts/status and fresh GSC | Verify opportunity; distinguish brands/entities and pipeline versus active sales; date any verified pricing/delivery guidance |
| P2-003 Curated comparisons | Queued; existing compare links are not new curated pages | Future comparison branch; none created | North vs South Flagler; Olara/Ritz-Carlton/Shorecrest; Alba/Shorecrest; downtown vs waterfront; branded vs non-branded | Sufficient verified facts and genuine decision value | Start with North vs South Flagler; summary, locations/status/delivery/scale/layouts/amenities, dated pricing only if verified, objective buyer fit and comparison request; no mass pairwise generation |
| P2-004 Contextual lead flows | Commercial/plan subset implemented, tested, approved, deployed through #74; broader work queued, outcomes unmeasured | #72/#73 integrated in #74; no new branch | Intercepted payloads, clean inquiry URLs, strict attribution and PII controls | Working GA4 for outcomes; defined product fulfillment/consent | Retain building/plan intent; later add curated-compare help, buyer strategy/tour requests, pricing packets, pipeline alerts and low-intent update signup using permitted non-PII context |
| P2-005 Buyer Intelligence Report | Queued, not implemented | Future report/product branch; none created | Existing editorial architecture and handoff report scope | Period-specific verified sources and fulfillment decision | What Changed, active-sales comparison, pipeline/status/delivery milestones, dated pricing, released plans, corridor snapshot and buyer verification questions; gate assembled packet, not evergreen research |
| P2-005 Newsletter, preferences and repeat visits | Queued; no signup/email sending enabled | Future product branch; none created | What Changed in WPB Construction This Week concept | Explicit subscription consent, preferences/unsubscribe, authorized provider/workflow | Design signup/preferences within existing editorial workflow; no marketing sends or provider/account writes without authorization |
| P2-006 Real author/reviewer profiles | Queued | Future authorship branch; none created | Real expertise model in handoff | Approved real names, credentials, brokerage relationships, bios/URLs and responsibilities | Visible author/reviewer and actual dates: news author, buyer-guide advisor, project review owner; schema matches visible facts, no fictional Review Desk personas |
| P2-007 Buyer due-diligence series | Queued | Future education branch; none created | Before You Buy specification | Current authoritative sources; legal/financial boundaries | Deposits, developer contracts, assignment/resale restrictions, fees/closing costs, parking/storage, pets, marina/dock rights, branded services, elevators, delays and plan comparison; distinguish education from project facts |
| P2-008 Selective feature/lifestyle guides | Queued | Future guide branch; none created | Waterfront, marina/boating, branded, wellness, private elevators, pets, walkability, boutique vs larger | Enough verified project facts for useful comparison | Choose supported theme, objective buyer-use guidance, natural project/compare links and verification notes; no thin tag/doorway pages |
| P2-009 Query ownership and internal links | Homepage/Buildings subset implemented, tested, approved, deployed through #74; broader work queued | #73/#74, later contextual-link pass | Home=broad market; Buildings=browse; corridor=geography; project=brand; plan=layout; compare=decision; answers=process; news=date | Fresh GSC and relevant content inventory | Relevant winning-news links to permanent projects/corridors; preserve canonicals and audit overlap without calling it proven cannibalization |
| P2-010 Search Console / GA4 measurement | Historical GSC baseline retained; outcomes NOT measured | Original input notes and #74; #75 corrects instrumentation; no measurement automation | Finalized 2026-08-06–2026-09-02 GSC baseline | Resolve V1/V1-H with actual live receipts, then accumulate post-release data | 7-day instrumentation, 28-day engagement/CTR/commercial journeys, 60–90-day qualified-conversion prioritization; windows start at confirmed working releases, not planning dates |

## Original release ledger and maintenance

Original #74 candidate `f40b46d16aa9a029f8e8584791198ca46422ae1b` passed required [run 34010467317](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010467317). Merge `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7` deployed once via [34010760203](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010760203), attempt 1, completed 2026-09-06T04:10:39Z. Historical #72/#73 were not separately merged; GitHub marked them merged through #74's ancestry and their refs were preserved.

Original live [34011268700](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34011268700) passed 29 surface checks and 12 intercepted same-session inquiries, but failed two actual-GA4 checks. Stable desktop/mobile visual/log [34011866590](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34011866590) passed. Routes `/`, `/buildings/`, `/floorplans/`, `/floorplans/olara/residence-d/`, `/projects/olara/`, `/inquire/`, `/map/` and `/sitemap.xml` returned 200; the excluded Alba plan returned 404. Canonicals, metadata/H1/schema, discovery and source asset hashes were checked. Original live Maps 4/4 passed. No CAPTCHA/CRM delivery claim was made from intercepted leads.

After actual GA4 acceptance closes, measure organic/AI landing → useful research → building/plan/compare action → form start → successful inquiry, without contact values. No missing historical events can be reconstructed by claiming the tag now loads.

Four existing high-severity dependency audit findings, 81 asset advisories, Vite chunk-size warning, optional enhancement/capture timing and legacy runtime/prerender title variants remain separate maintenance considerations. No dependency upgrade, content/asset change, newsletter send, Alba publication or new feature batch is part of this corrective release.
