# Phase 2 delivery tracker — WPB New Construction

Updated September 9, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.
Requirements: `docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md` and Brooke's growth/release instructions.

## Current direction

**Current production/main: `0713e029cc251fc9a49c5e429fdda6ac85e46202`. Batch 5 real-person authorship + trust is IMPLEMENTED / TESTED / APPROVED / MERGED / DEPLOYED / LIVE-VERIFIED, but NOT MEASURED.** PR #83 merged the exact approved documentation-only head `918f3e7ccda5904f624c44e4a6869d33f1a50ef2`; tested application/corrective SHA remains `f8e6b8f3a7bdf7b8a0f0fc880d056af5351909d4`. Exact-head keyed/no-key/aggregate verification `34408524796`, normal production deployment `34410192415`, and post-deployment live acceptance `34410472433` all succeeded. Brooke's September 9 continuation handoff explicitly authorized release. No application changes were made during release and no duplicate deployment was initiated.

**Batch 6 conversion + buyer concierge is a separate audit/architecture review, not a production implementation.** Branch `p2-batch6-conversion-concierge` was created from the current production SHA after Batch 5's live acceptance gate passed. Scope, findings, implementation slices and exact audit/review evidence are recorded in `docs/P2_BATCH6_CONVERSION_CONCIERGE.md`. Any application implementation/release requires its own review; no Batch 6 production change is authorized by the Batch 5 approval.

Batch 4 Rosewood + Maison d’Or remains IMPLEMENTED / TESTED / APPROVED / DEPLOYED / LIVE-VERIFIED, but NOT MEASURED. Its final historical production application was `cdf8240a8a5c6b1bf482f0e48ce9e496fd9b0ebe` after the narrowly scoped PR #81 canonical-link hotfix. PR #80 merged as `9041493a48c573658872d79445c4f1e796643c8c`; the approved tested application was `b0f0f216f73abb4d42466c6c0aeaeb50325f380f`. Later Batch 5 live tests reconfirm its inquiry, source and Maps contracts.

**PR #75 / GA4 Admin diagnosis remains PARKED — blocked / non-critical / revisit separately.** No GA4 configuration was changed and no actual GA4 transport or measured growth is claimed.

Alba’s unpublished HTML state remains preserved. 3D map and Three.js floor-plan implementation remain outside this work.

## Status contract

Planned = scoped. Implemented = code/content exists. Tested = exact revision and evidence recorded. Approved = Brooke authorized presentation/release. Deployed = actual authorized production publication. Live-verified = production behavior checked after deployment. Measured = post-release first-party outcomes observed. Blocked = a specific missing dependency, never a reason to stop independent work. An audit harness or architecture proposal is not a deployed buyer-facing feature.

## Delivery ledger

| Task | Status | Branch / PR | Evidence | Remaining limitation / next action |
|---|---|---|---|---|
| Rosewood + Maison d’Or project SEO / Batch 4 | **Implemented, tested, approved, deployed, live-verified; NOT measured** | `p2-project-seo-rosewood-maison-dor` / PR #80 + PR #81 hotfix | Tested app `b0f0f216`; implementation `34266304318`; PR80 merge `9041493a`; historical prod `cdf8240a`; live `34280040979`; reconfirmed by `34410472433` | Real production lead delivery and outcome measurement remain separate |
| Olara Residence D HTML/discovery | Implemented, tested, approved, deployed, live-verified; not measured | Production main | Six-plan live regression `34410472433`, 12 desktop/mobile views and exact-plan inquiries | Preserve |
| Five additional Olara plans A/C/F/I/L | Implemented, tested, approved, deployed, live-verified; not measured | PR #79, merge `589d2f43151d7e57af6c7a831fe4837b66cb5d3a` / production main | GitHub merged status verified; six-plan live regression `34410472433` | Old PR-body draft language is historical, not current status; Alba remains held |
| Homepage / Buildings | Implemented, tested, approved, deployed; not measured | Production main | Commercial/inquiry regressions remain green | Preserve |
| Downtown / South Flagler / Palm Beach corridors | Implemented, tested, approved, deployed, live-verified; not measured | PR #76 | Production `34152334484`; live `34153465427`; later regressions green | Preserve |
| Corridor availability + pricing/floor-plan packet | Implemented, tested, approved, deployed | PR #76 | Intercepted live request/first-touch context retained by later regressions | Real fulfillment acceptance still separate |
| North/South and Olara/Ritz/Shorecrest comparisons | Implemented, tested, approved, deployed, live-verified; not measured | PR #78 | Candidate `34177737077`; production `34178444416`; live `34178933079`; Batch4/5 live regressions pass | Preserve |
| Compare my shortlist | Implemented, tested, approved, deployed | PR #78 | Existing live/intercepted shortlist regression coverage remains green | Real fulfillment remains manual |
| Real-person authorship / trust layer — Batch 5 | **Implemented, tested, approved, deployed, live-verified; NOT measured** | Merged PR #83 / production `0713e029` | Final app `f8e6b8f3`; candidate `34309439506`; exact doc-head `34408524796`; deployment `34410192415`; live `34410472433` all PASS | Preserve sparse real responsibility; no Scott page-review assignment |
| Conversion + buyer concierge — Batch 6 | **Audit / architecture review; no buyer-facing implementation or deployment** | `p2-batch6-conversion-concierge`, separate draft review | Ten specified production routes at 1440/390px, source analysis, JS/preview/duplicate evidence; exact run records in Batch6 document | Review coherent journey and implement controlled slices from then-current production main |
| Alba Residence D HTML | Implemented source hold; blocked, unpublished | Preserved implementation | Existing source discrepancy; live exclusion retained | Do not publish without source clarification |
| PR #75 / GA4 diagnosis | **PARKED** | Existing #75 untouched | Historical evidence only | Do not make it a Batch6 dependency |

## Batch 4 release and live-verification evidence

### Approved candidate

- Exact tested application: `b0f0f216f73abb4d42466c6c0aeaeb50325f380f`.
- Final implementation workflow: `34266304318` — keyed, no-key, aggregate and live six-page Olara gates passed.
- Documentation-only approved head: `16b206fae117e8b92710d3a1f22eed58bf92b6c1`.
- Documentation-head workflow: `34267585008` — green.

### PR #80 merge and deployment

- PR #80 merge SHA: `9041493a48c573658872d79445c4f1e796643c8c`.
- Normal production workflow: `34277677628`.
- Existing automatic production path was allowed to run once; no duplicate manual deployment was initiated.

### Initial live failure and PR #81 hotfix

The first live acceptance run found one genuine canonical-route defect: Maison d’Or linked to `/projects/south-flagler-house-north/`, while the published canonical South Flagler House route is `/projects/south-flagler-house/`. The failure was retained as evidence and not waived.

PR #81 changed that one internal link and added a focused regression assertion.

- Dedicated hotfix validation: `34278719639` — SUCCESS.
- Final historical Batch4 production SHA: `cdf8240a8a5c6b1bf482f0e48ce9e496fd9b0ebe`.
- PR #81 normal production workflow: `34278996546` — SUCCESS, including Cloudflare deployment.

### Final live acceptance

- Final Batch4 live workflow: `34280040979` — **SUCCESS**.
- PR #80 production verification: SUCCESS.
- Six-page live Olara regression audit: SUCCESS.
- Final Batch 4 acceptance: **PASSED**.

The live acceptance covered canonical documents/metadata/schema/sitemap, buyer summaries and source/status qualification, images/internal links, both inquiry products, exact current interest, alias normalization, forward/reverse same-session switching, Rosewood ↔ Maison switching, first-touch preservation, desktop/mobile overflow, actual Maps and existing commercial/corridor/comparison/Olara journeys.

Two live-QA corrections were verification-harness-only: the browser used an intercepted Turnstile stub, and the harness dismissed/reset the successful lead modal between same-session actions. Neither altered production application SHA `cdf8240a...` or production runtime behavior.

All automated QA lead POSTs were intercepted. **No real lead was sent.** Production Turnstile server validation, inbox/email delivery, database/CRM delivery, actual GA4 transport and measured growth remain unverified.

Full Batch 4 implementation/release ledger: `docs/P2_PROJECT_SEO_BATCH4_PROGRESS.md`.

## Batch 5 authorship + trust review evidence

PR #83 uses a deliberately narrow real-person responsibility model:

- `https://www.wpbnewconstruction.com/about/#brooke-snader` — Brooke Snader stable Person `@id`.
- `https://www.wpbnewconstruction.com/about/#scott-gordon` — Scott Gordon stable Person `@id`.
- Brooke is visibly assigned as author on `/about/` and `/methodology/`.
- Brooke is visibly assigned as reviewer on `/projects/rosewood-residences-west-palm-beach/` and `/projects/maison-dor/`.
- Scott is present as a verified contributor profile but is **not** assigned as author/reviewer until responsibility is specifically confirmed.
- Other project, corridor, answer, update and market-note pages do not inherit mechanical or invented attribution.

Schema and heading contract:

- Attributed pages retain one canonical `wpb-static-structured-data` JSON-LD script and one `@graph`; no standalone authorship graph is emitted.
- Stable Person IDs are reused without page-specific aliases or duplicates.
- Existing WebPage/project/Breadcrumb/Organization relationships remain present.
- The project-heading correction preserves one active/visible H1 and one accessibility-tree H1. The compact duplicate project heading is not treated as a second active semantic H1.
- The stale Batch 4 regression now validates the single active semantic H1 against the canonical project entity while retaining desktop/mobile, JS-on/off, CTA, inquiry, source and layout coverage.

Historical evidence retained:

- `34304036063` — implementation functionally green, final failure caused by workflow typo `qa:agent-skill` vs existing `qa:agent-skills`.
- `34308247126` — workflow typo fixed; exposed stale Batch 4 exact-H1 selector in Existing buyer journeys.
- Corrective regression commit `f8e6b8f3a7bdf7b8a0f0fc880d056af5351909d4` updated only the stale Batch 4 heading QA contract and documented the Batch 5 semantic reason.
- `34309439506` — final implementation GREEN: keyed/no-key/aggregate; existing journeys; Batch4; 48 authorship checks; full suite; assets; SEO/GEO; Agent Skills; accessibility; privacy; keyed preflight/Maps and expected no-key rejection.
- `34408524796` — exact approved documentation head `918f3e7...`: keyed/no-key/aggregate SUCCESS.

Screenshots remain in candidate and live artifacts. Brooke authorized release in the continuation handoff, superseding the previous draft-only status.

### Batch 5 release closeout

- Merge/current production: `0713e029cc251fc9a49c5e429fdda6ac85e46202`, September 9 at 22:02:59 UTC.
- Single normal deployment: `34410192415`, Cloudflare deployment `73e4c622.wpbnewconstruction.pages.dev`, SUCCESS on the first attempt.
- Immediate old-bundle observation was not accepted as live proof; later browser verification established the deployed authorship without a second deployment.
- Live `34410472433`, QA-only harness `adee38875736e56ae40754b34e28a97b3156afd2`: authorship `102663452270`, buyer journeys `102663452512`, Olara `102663452604`, aggregate `102665150736` all SUCCESS.
- Coverage: 48 authorship desktop/mobile JS-on/off views + SPA schema sequence; 4 project document views; 12 same-session sequences/24 intercepted requests; 2 real Maps loader/tile/zoom cases; 8 retained journeys; 6 Olara plans/12 desktop-mobile views/12 intercepted exact-plan requests; Alba exclusion.
- Full SHA-256 artifact records and scope: `docs/P2_AUTHORSHIP_TRUST_PROGRESS.md` and PR #83 closeout.

Real lead CAPTCHA/delivery/duplicate-record acceptance remains manual. `docs/BATCH4_MANUAL_PRODUCTION_LEAD_ACCEPTANCE.md` was not executed. Scott has no page-review assignment; real outcomes are unmeasured; GA4 remains parked.

## Batch 6 controlled scope

Goal: **DISCOVERY → RESEARCH → DECISION → QUALIFIED INQUIRY**. Make existing research and human-request actions feel like one coherent buyer journey; do not merely reposition a button or invent AI capabilities.

Audit these production routes at desktop/mobile: `/`, `/buildings/`, `/map/`, `/floorplans/`, `/projects/olara/`, `/projects/rosewood-residences-west-palm-beach/`, `/projects/maison-dor/`, `/answers/olara-vs-ritz-carlton-vs-shorecrest/`, `/corridors/south-flagler/`, `/inquire/`.

Record labels, location, intent, destination, exact project/plan/corridor/shortlist context, mobile behavior and competing actions; explicitly compare Ask WPB with Contact the Team. The architecture proposal groups Research, Current information and Talk to the team under Ask WPB, while direct contextual CTAs continue to reach the existing inquiry flow without an extra mandatory menu step.

Controlled technical sub-items: absolute HTTPS social-image URLs; measured first-party production JS and narrow lazy-loading opportunities; byte-identical asset footprint without broad deletion. No large `main.ts` rewrite. Cesium/Three.js stay out of the normal initial bundle.

Verification, source references, per-route inventory, metrics, proposed implementation slices and review branch/PR are maintained in `docs/P2_BATCH6_CONVERSION_CONCIERGE.md`. The current draft changes audit/documentation only; live application sources remain byte-identical to production main.

## Other retained release evidence

PR #78 remains approved/deployed/live-verified at merge/deployment `de5fd3d1581df372712d0f02ad54305d8f4f1b4b`; production workflow `34178444416` and live workflow `34178933079` succeeded. PR #76 remains approved/deployed/live-verified at merge/deployment `8128f7a5a24706a8fc743f156f2f1d0505f1b462`; production `34152334484` and live `34153465427` succeeded. Historical failure detail and artifact hashes remain in their dedicated progress/release documents and Git history.

## Measurement baseline

No post-Batch4/5/6 growth claim is made. Existing finalized Search Console baselines remain historical context only; no retrospective GA4 data or manufactured uplift is inferred. Batch 4 and Batch 5 are **not measured** until an appropriate observation window and authorized first-party evidence exist. A conversion audit is not measured conversion uplift.

## Complete remaining roadmap

Independent batches start from then-current production main, use verified sources, full checks, desktop/mobile evidence and exact tested SHAs. Only separately approved batches deploy.

| Item | Status | Scope / evidence | Dependency | Next action |
|---|---|---|---|---|
| P2-001 / Batch 3 Olara plans | Implemented/tested/approved/deployed/live-verified | A/C/D/F/I/L canonical Olara pages retained and regression-tested | None for published plans | Preserve; Alba remains held |
| Additional project plans | Planned | Other projects only with clean current official sources | Defensible drawings/facts | Alba remains held |
| P2-002 priority project SEO | **Rosewood + Maison d’Or complete through live verification**; remaining priority projects planned | Batch4 historical prod `cdf8240a`; live `34280040979`; later Batch5 revalidation | Official facts for later projects | Later project batches remain separate |
| P2-003 further curated comparisons | North/South/trio deployed; others planned | Downtown/waterfront, preconstruction/completed | Comparable source depth | Avoid thin mass pairwise pages |
| P2-004 contextual lead flows / Batch 6 | Existing availability/packet/shortlist deployed; concierge audit/architecture under review | Explicit request and first-touch ownership; coherent research-to-human-request journey | Real fulfillment acceptance separate | Implement separately reviewed slices, preserve PII/consent/identity and manual selections |
| P2-005 Buyer Intelligence Report | Planned | Monthly project changes and verified buyer intelligence | Verified period/owner/fulfillment | Separate future batch |
| P2-005 newsletter/preferences | Planned; no emails sent | Weekly/monthly/project subscriptions | Explicit opt-in/unsubscribe/provider | No unapproved automation |
| P2-006 real authors/reviewers — Batch 5 | **Implemented/tested/approved/deployed/live-verified** | PR #83; production `0713e029`; live `34410472433`; stable real-person assignments/schema | None for released scope | Preserve; Scott remains unassigned to page reviews |
| P2-007 buyer due diligence | Planned | Deposits/contracts/fees/parking/storage/pets/services/delays | Authoritative sources | General education only |
| P2-008 lifestyle/feature guides | Planned | Marina/branded/wellness/private elevators/etc. | Verified project facts | Avoid invented policies/thin pages |
| P2-009 linking/query ownership | Existing discovery/query ownership deployed and live-regressed | Market/browse/place/brand/layout/decision/process/news roles | Useful context | Preserve canonicals/equity |
| P2-010 measurement | Baseline exists; outcomes unmeasured | 7/28/60–90 day evaluation windows | Observation time + authorized first-party data | No manufactured uplift; GA4 remains parked |

## Lead-product register

| Product | State | Fulfillment / next action |
|---|---|---|
| Request current availability | Deployed across approved surfaces including Rosewood/Maison; Batch6 standardization proposed | Current team confirmation, not a live-inventory promise |
| Get pricing + floor-plan packet | Deployed under varying labels; Batch6 standardization proposed | Team-prepared current packet; existing exact same-session switching live-verified |
| Compare my shortlist | Approved/deployed/live-verified | Explicit selected IDs retained; team comparison response |
| Ask about this project / plan | Existing question/inquiry affordances; unified Batch6 intent proposed | Preserve the exact subject and send a human-response request |
| Schedule a conversation or tour | Unified Batch6 intent proposed | Request preferred timing; team confirms, no invented booking availability |
| Project-change alerts | Planned outside core Batch6 five-intent scope | Separate opt-in/preferences/unsubscribe work |
| Monthly Buyer Intelligence Report | Planned | Verified cadence/owner/assembled report and consent |

Existing dependency findings, asset advisories and large-chunk warnings remain separate maintenance; do not turn this work into a dependency upgrade or broad asset cleanup. PR #75 remains parked and GA4 untouched. This documentation-only Batch5 closeout is carried in the separate Batch6 draft, not deployed solely to refresh records.