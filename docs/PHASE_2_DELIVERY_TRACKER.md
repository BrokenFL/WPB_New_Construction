# Phase 2 delivery tracker — WPB New Construction

Updated: 2026-09-07 UTC (September 6 evening in Florida). Repository: `BrokenFL/WPB_New_Construction`.
Complete requirements: `docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md`.

## Current release status

**PR #74 remains deployed; PR #75 remains an unmerged draft. Integrated-release acceptance is OPEN for V1/V1-H.** Brooke's screenshot and saved-state confirmation establish the reported Enhanced Measurement history option OFF for `G-0LGBH6MDVX`. No further blind account toggle is requested.

The [causal diagnosis](GA4_HISTORY_SOURCE_DIAGNOSIS.md) now identifies the exact emitting code: Google's served per-destination `__ccd_em_page_view` record has `vtp_historyEvents: true`; it reacts to a history change and sets `page_referrer` from the raw previous URL. A blank page with one loader/config and zero manual page-view calls reproduces the unsafe event, ruling out WPB router/manual calls as necessary causes. The associated GT ID is an alias of the same tag, not a second destination. Both documented global send_page_view false forms fail to suppress this handler.

A diagnostic replay with only destination history false eliminates the extra/private-referrer event while preserving manual views, even with tag-wide history ON. The tag-wide control is a veto; it does not override a correctly compiled destination OFF. This corrects the earlier speculative account-toggle guidance. The control changed a replayed remote flag solely to prove causation; it is NOT a supported application patch or release test. The unchanged actual-Google-tag candidate test still fails at desktop/mobile. The remaining unknown is the saved-setting versus generated/served-setting mismatch on Google's side, requiring read-only Admin-setting/publication reconciliation rather than more speculative toggles.

| Identity / action | State |
|---|---|
| Candidate examined and unchanged real-tag test rerun | `f9fe17c55ae4785766fb40a179c7ce76650cd969` |
| Prior full keyed/no-key tested candidate | `a8af3e67e54bfcaba75a08c4a7b8074c19b96a21`, same runtime/test implementation |
| Focused wrapper correction commit | `69c4eb2921829081acc47053d890fb6c18e8748d` |
| Corrective branch / PR | `fix/ga4-command-queue` / [#75](https://github.com/BrokenFL/WPB_New_Construction/pull/75), draft |
| Main verified unchanged | `dd28320f689a3f377b6137671e702b6c58778b67` |
| Deployed application / original integrated release | `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7` / #74 |
| Corrective merge / deployment / live acceptance | None / not initiated / OPEN |
| Outcome measurement | Not started; no Phase 2 uplift or retrospective GA4 data claimed |

Updates in this diagnosis are documentation-only on the corrective branch. Diagnostic workflows are isolated on the existing `p2-74-release-audit` branch. No runtime, privacy assertion, production credential, account setting or feature was changed. No main merge/deployment occurred. Earlier ledger versions are retained [at f9fe17c5](https://github.com/BrokenFL/WPB_New_Construction/blob/f9fe17c55ae4785766fb40a179c7ce76650cd969/docs/PHASE_2_DELIVERY_TRACKER.md) and [at a8af3e67](https://github.com/BrokenFL/WPB_New_Construction/blob/a8af3e67e54bfcaba75a08c4a7b8074c19b96a21/docs/PHASE_2_DELIVERY_TRACKER.md). All remaining roadmap items remain below, without advancement.

## Status contract

Implemented means code/content exists. Tested identifies exact SHA, scope and exclusions. Approved requires Brooke's authorization; corrective merge/deploy approval remains conditional on green required gates. Deployed records a real production release, not merely a successful build. Live acceptance closes only after every required live check passes. Measured requires actual post-release first-party outcomes, not a simulated submission. A blocked measurement/source task does not forbid independently authorized work, but this particular diagnostic task does not authorize another batch.

## Delivered scope and corrective acceptance

| Task | Status | Branch / PR | Evidence | Blocker | Next action |
|---|---|---|---|---|---|
| P2-001 Olara Residence D HTML pilot | Implemented, tested, approved and deployed through #74; live route/assets/attribution passed; outcomes unmeasured | `astra-phase-2-growth` / #72, integrated in #74 | Published plan, discovery/sitemap and approved asset byte checks; intercepted inquiry payloads | V1 affects measurement, not plan publication | Preserve released page and existing PDFs; additional plans require a later verified-source batch |
| P2-001 Alba Residence D HTML | Implementation/source review retained; UNPUBLISHED | #72 history in #74 | No generated HTML, public lookup, sitemap or discovery; live route 404; PDFs unchanged | Developer clarification: REV. 8/2022 and 10-square-foot area discrepancy | Obtain current official drawing/area schedule and verify preview/PDF/facts before separate publication approval |
| P2-002 Homepage + Buildings | Implemented, tested, approved and deployed through #74; outcomes unmeasured | `astra-p2-002-home-buildings` / #73, integrated in #74 | Broad-search Homepage versus directory intent, titles/descriptions/opening copy, actions, listing-first Buildings; desktop/mobile checks | V1 affects measurement | Preserve design, clean canonicals, existing geography/project/compare links and inquiry actions |
| Shared startup/postbuild/inquiry integration | Implemented, tested, approved and deployed | `astra-p2-integrated-release` / #74 | One startup/context owner; full suites; 24 candidate POSTs per mode and 12 original live intercepted POSTs | V1 prevents complete integrated acceptance | Preserve first-touch attribution, replace stale commercial/plan defaults, respect manual choices; no separate #72/#73 release |
| K1 restricted-key Maps verification | RESOLVED in prior full candidate runs | #74 and #75 | Keyed preflight and 4/4 actual Maps loader/tile/zoom passed in resumed full attempts 2 and 3 | None; latest diagnosis did not alter Maps | Keep review key build-only and production restrictions unchanged |
| V1 native gtag command queue | Implemented, exact-source regression passed, not merged/deployed | `fix/ga4-command-queue` / #75 | Native Arguments wrapper; initial clean actual-tag candidate view after consent | Independent remote history conflict; required aggregate and later live collection | Preserve wrapper/manual tracking; no release until unchanged actual-tag test and full gates pass |
| V1-H effective history tracking | Execution source PROVEN; configuration-publication discrepancy OPEN | #75 baseline; causal workflows on `p2-74-release-audit` | Runs 34074593905 and 34074795479: zero-manual-view reproduction; same-tag aliases; one-flag causal control; unchanged 1440px/390px privacy failures | Served destination history true despite saved UI OFF; authenticated saved-resource value and Google publication state not read | Read-only resolve exact measurementId stream and retrieve EnhancedMeasurementSettings.pageChangesEnabled; reconcile with Google-generated handler/support. Do not request another blind toggle or use private runtime flags |

## Latest diagnostic evidence — not release acceptance

[Causal run 34074593905](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34074593905), artifact [10001626798](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34074593905/artifacts/10001626798), ZIP SHA-256 `4e03ad062fcee0e370c74288ebca512f1fb6ae27cdc1e948b7fdfae5a979832d`.

[Source-isolation run 34074795479](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34074795479), artifact [10001703934](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34074795479/artifacts/10001703934), ZIP SHA-256 `54467367a2848546a89659f1ffe3dfc238574a2a0eeb708ba927f38565a8ebee`.

One config/loader with zero manual page views plus pushState emits one automatic private-referrer view. Two manual views plus pushState emit three views, one unsafe. Both documented global send_page_view forms and the associated GT-ID loader leave that behavior unchanged. With no history change, the same two manual commands produce only two clean views. Two explicitly labeled one-flag replay controls also produce only two clean views. Those source-modified controls prove the responsible configuration; they do not pass the actual unmodified Google-tag gate.

The unchanged candidate f9fe17c5 was built and the original real-tag privacy test rerun after the controls. At 1440px and 390px it still blocks one unsafe extra history view at Home to Buildings and exits 1. Initial consented manual views and fresh rejection pass; later real-tag inquiry conversions are not reached. All collections/leads were intercepted; no actual private data, production lead or marketing message was sent.

Fresh and cache-busted G-ID responses at 01:56:46 and 02:00:46–47 UTC September 7 retained the same `0120fe9f...` full-source hash observed at 19:53:39 UTC September 6. More than six hours, current Date headers and private max-age=900 rule out a stale browser cache as sole cause, but not Google upstream publication/caching. G-0LGBH6MDVX and GT-M3LVS6X8 both expose the same destination/flags. Complete safe details and official Google documentation are in the causal report. An authenticated Admin settings read has not been obtained; no saved API value or backend bug is fabricated.

## Historical full-candidate verification ledger

[Run 34053296879](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879) resumed against `a8af3e67e54bfcaba75a08c4a7b8074c19b96a21`:

| Attempt | Keyed job | No-key job | Aggregate | Result |
|---|---|---|---|---|
| 2 | `101547054455` | `101547054328` | `101547657692` | FAILED only at added actual-tag navigation/privacy regression |
| 3 | `101548061531` | `101548061690` | `101548765624` | Same failure; no bypass |

Both modes passed typecheck/build, full npm test including actual wrapper command semantics and 60 existing unit regressions, launch/SEO/GEO/privacy/forms/performance/gatekeeper, assets:audit plus strict audit, prepared browser suites and combined journeys. Each covers 12 prepared configurations and 24 intercepted inquiry POSTs. Keyed preflight/real Maps pass; no-key rejection is a passing explicit negative assertion. These historical full-suite passes do not override current failed real-tag behavior.

Initial actual-tag consent checks pass at 1440px and 390px: no loader/collection while unset, one primary tag/native Arguments/correct ID/clean manual view after approval, advertising fields denied. Fresh rejection persists across navigation. Home to Buildings still produces the unsafe extra history view; new real-tag inquiry conversions stop at that failure. Candidate 204s are intercepted, not production receipts. No failed privacy/duplicate assertion was weakened.

Historical keyed artifact [9996057597](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879/artifacts/9996057597), SHA-256 `ec7c5d937e1ee1327b9fa3d7687ff20fd8787c5365e429b64ddd77893f18bc22`; no-key [9996055585](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879/artifacts/9996055585), reported digest `b58f0d1049b40ddb2489e835d6f76b9aecd750d5ca1b68858cfd1868f44634c0`. The keyed ZIP was verified and all 57 files passed scoped credential-pattern scans. Resumed screenshots were inspected without visual changes. Earlier public configuration [34055994842](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34055994842) supplies the cache-comparison baseline; full ledger retained in linked historical documents.

## Required corrective release and live acceptance

Only green checks on the then-current release head satisfy conditional release authorization. A green diagnostic workflow is not a passing release gate. No merge or deployment is part of this source-diagnosis pass.

A later authorized release must mark #75 ready, merge the verified expected SHA normally and allow the existing main workflow to deploy exactly once. Do not bypass a red gate, change/relax production credentials, use private Google suppression hacks or issue duplicate manual deployments.

The live workflow must obtain successful real Google collector responses to G-0LGBH6MDVX on `/`, `/buildings/`, `/projects/olara/` and `/floorplans/olara/residence-d/` at desktop/mobile. Require one intended page view per tracked transition, one tag per document, no PII/query contamination in any payload field, proper consent and rejection inactivity. Confirm Maps, pages, Olara assets/sitemap and inquiry attribution. Synthetic conversion/lead POSTs and challenge fixtures stay intercepted; no CAPTCHA/CRM delivery claim.

Record correction, exact candidate/PR/merge, automatic deployment and live receipts in both documents. Only then close V1/V1-H and integrated acceptance, and stop. A loaded script, local queue, replayed source control or mock collector response is insufficient.

## Complete remaining handoff roadmap — no advancement in this diagnosis

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

Original #74 candidate `f40b46d16aa9a029f8e8584791198ca46422ae1b` passed required [34010467317](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010467317). Merge `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7` deployed once via [34010760203](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010760203), attempt 1, completed 2026-09-06T04:10:39Z. Historical #72/#73 were not separately merged; GitHub marked them merged through #74's ancestry and their refs were preserved.

Original live [34011268700](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34011268700) passed 29 surface checks and 12 intercepted same-session inquiries but failed two actual-GA4 checks. Stable visual/log [34011866590](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34011866590) passed. Routes `/`, `/buildings/`, `/floorplans/`, `/floorplans/olara/residence-d/`, `/projects/olara/`, `/inquire/`, `/map/`, `/sitemap.xml` returned 200; excluded Alba plan 404. Canonicals/metadata/H1/schema/discovery/asset hashes and original Maps 4/4 were checked. No CAPTCHA/CRM delivery claim from intercepted leads.

After actual GA4 acceptance closes, measure organic/AI landing → useful research → building/plan/compare action → form start → successful inquiry without contact values. Missing historical events cannot be reconstructed by claiming the tag now loads.

Four existing high-severity dependency findings, 81 asset advisories, Vite chunk-size warning, optional enhancement/capture timing and legacy runtime/prerender title variants remain separate maintenance considerations. No dependency upgrade, content/asset change, newsletter send, Alba publication or new Phase 2 batch is part of this diagnosis.
