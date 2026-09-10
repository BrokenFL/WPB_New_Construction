# Phase 2 delivery tracker — WPB New Construction

Current continuation state: [authoritative Codex handoff](WPB_CODEX_MASTER_HANDOFF.md), updated September 10, 2026. PR #93 is the current approved and deployed buyer-facing Batch 6 correction; representative live checks pass, but a fresh first-visit consent ownership defect keeps whole Batch 6 from LIVE-VERIFIED. PR #89 is approved, merged and deployed as internal tooling only, with no buyer-facing bundle change. Use the handoff and [corrective live evidence](evidence/batch6-corrective-live-2026-09-10/README.md) before continuing.

Updated September 10, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.
Requirements: `docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md` and Brooke's growth/release instructions.

## Current direction

**Batch 4 Rosewood + Maison d’Or is IMPLEMENTED / TESTED / APPROVED / DEPLOYED / LIVE-VERIFIED, but NOT MEASURED.** Current production application: `cdf8240a8a5c6b1bf482f0e48ce9e496fd9b0ebe` after the narrowly scoped PR #81 canonical-link hotfix. PR #80 merged as `9041493a48c573658872d79445c4f1e796643c8c`; the approved exact tested application was `b0f0f216f73abb4d42466c6c0aeaeb50325f380f`.

Final live acceptance workflow `34280040979` completed successfully after the hotfix. The PR #80 production verification and six-page live Olara regression audit were both successful. The final live audit used only intercepted QA submissions; no real lead was sent.

**Batch 5 real-person authorship + trust is IMPLEMENTED / TESTED / APPROVED / DEPLOYED / LIVE-VERIFIED; NOT MEASURED.** Production merge/deployment is `0713e029cc251fc9a49c5e429fdda6ac85e46202`; live acceptance `34410472433`. Historical corrective test SHA `f8e6b8f3a7bdf7b8a0f0fc880d056af5351909d4` and workflow `34309439506` remain recorded below.

**Batch 6 concierge/intents is IMPLEMENTED / TESTED / APPROVED / MERGED / DEPLOYED; current representative live checks pass, but final live acceptance is BLOCKED by a fresh first-visit consent ownership defect and it is not LIVE-VERIFIED.** PR #93 head `ae076dc5926baeebedb30b8d45b23a2ade710c05` carries application source `f761a0057460a98a45c333b2ffb16fad5b22e59d`; it reached production via merge commit `2469a470c4d7cd0391682e9566ef79d44ee417e4` through normal deploy `34534298501` at `https://de109853.wpbnewconstruction.pages.dev`; no manual or duplicate deploy occurred. The representative live review passed 9 route/viewport cases and 7 intercepted inquiry proofs, including five canonical intents, legacy prefills, manual selection, floor-plan context and first-touch preservation. After consent dismissal the original native-control collision is clear and fresh denied-consent zoom-in/out contexts pass. On a fresh 390×844 first visit, consent owns the Zoom-out center and covers the launcher; see the [corrective live evidence](evidence/batch6-corrective-live-2026-09-10/README.md). The original PR #86 collision remains historical evidence.

**PR #89 Phase A is APPROVED / MERGED / DEPLOYED — INTERNAL TOOLING ONLY.** Verified source revision `7953d4a66e13b37e4d9ffc02447ca19735d603bf` passed the focused 45-test safety set, four offline rows, typecheck, unchanged-canonical/bundle checks and all 12 CI jobs. It merged as current main `baac91f5aa1a25d1013dcc762528cad558668512` and deployed once through `34535997309` at `https://05e16046.wpbnewconstruction.pages.dev`; buyer-facing bundles match the PR #93 baseline. `apply:false`, review-only output and no Phase B/Sheet/fact/publication side effects remain required.

**PR #75 / GA4 Admin diagnosis remains PARKED — blocked / non-critical / revisit separately.** No GA4 configuration was changed and no actual GA4 transport or measured growth is claimed.

Alba’s unpublished HTML state remains preserved. The MapLibre-selected 3D city map and separate Three.js floor-plan/property dollhouse remain outside this work.

## Status contract

Planned = scoped. Implemented = code/content exists. Tested = exact revision and evidence recorded. Approved = Brooke authorized presentation/release. Deployed = actual authorized production publication. Live-verified = production behavior checked after deployment. Measured = post-release first-party outcomes observed. Blocked = a specific missing dependency, never a reason to stop independent work.

## Delivery ledger

| Task | Status | Branch / PR | Evidence | Remaining limitation / next action |
|---|---|---|---|---|
| Rosewood + Maison d’Or project SEO / Batch 4 | **Implemented, tested, approved, deployed, live-verified; NOT measured** | `p2-project-seo-rosewood-maison-dor` / PR #80 + PR #81 hotfix | Tested app `b0f0f216`; implementation run `34266304318`; PR80 merge `9041493a`; final prod `cdf8240a`; final live `34280040979` SUCCESS | Real production lead delivery and outcome measurement remain separate |
| Olara Residence D HTML/discovery | Implemented, tested, approved, deployed; not measured | Production main | Existing live markup, preview/PDF and regression evidence retained | Preserve |
| Five additional Olara plans A/C/F/I/L | Implemented, tested, approved, deployed; not measured | PR #79 / production main | Existing six-page Olara regression remains green in later workflows | Preserve; Alba remains held |
| Homepage / Buildings | Implemented, tested, approved, deployed; not measured | Production main | Commercial/inquiry regressions remain green | Preserve |
| Downtown / South Flagler / Palm Beach corridors | Implemented, tested, approved, deployed, live-verified; not measured | PR #76 | Production `34152334484`; live `34153465427`; later regressions green | Preserve |
| Corridor availability + pricing/floor-plan packet | Implemented, tested, approved, deployed | PR #76 | Intercepted live request/first-touch context retained by later regressions | Real fulfillment acceptance still separate |
| North/South and Olara/Ritz/Shorecrest comparisons | Implemented, tested, approved, deployed, live-verified; not measured | PR #78 | Candidate `34177737077`; production `34178444416`; live `34178933079`; Batch4 live regressions pass | Preserve |
| Compare my shortlist | Implemented, tested, approved, deployed | PR #78 | Existing live/intercepted shortlist regression coverage remains green | Real fulfillment remains manual |
| Real-person authorship / trust layer — Batch 5 | **Implemented, tested, approved, deployed, live-verified; NOT measured** | Production merge/deployment `0713e029`; live acceptance `34410472433`; historical corrective test SHA `f8e6b8f3`; final green workflow `34309439506` | 48 authorship/schema/browser checks PASS; production outcomes remain unmeasured | Preserve; no retroactive attribution |
| Concierge/intents — historical Batch 6 / PR #86 | **Implemented, tested, approved, merged, deployed; final live acceptance blocked** | Approved PR head `e8483fc3`; merge/production `2d0175ee`; normal deploy `34523585398` SUCCESS; all nine CI jobs green | Historical production manifest records route/Olara/Maps/shortlist/metadata probes; focused 390px `/map/` check failed with 1,495px² Ask WPB/Zoom-out overlap and pointer interception | Superseded on buyer-facing production by PR #93; preserve as historical evidence |
| Mobile Maps controls correction — PR #93 | **Approved, merged, deployed; representative live checks passed; whole Batch 6 live verification blocked** | Approved head `ae076dc5926baeebedb30b8d45b23a2ade710c05`; application source `f761a0057460a98a45c333b2ffb16fad5b22e59d`; merge/production `2469a470c4d7cd0391682e9566ef79d44ee417e4`; normal deploy `34534298501` SUCCESS at `https://de109853.wpbnewconstruction.pages.dev`; current buyer-facing baseline | 9 route/viewport cases and 7 intercepted inquiry proofs pass; after consent dismissal native-control ownership passes and fresh denied-consent zoom contexts pass. Fresh 390×844 first visit still lets consent own Zoom-out center and cover the launcher; [corrective evidence](evidence/batch6-corrective-live-2026-09-10/README.md) | Review `fix/batch6-consent-control-ownership`; no release approval/deployment yet |
| Development intelligence Phase A — PR #89 | **Approved, merged, deployed — internal tooling only** | Verified source `7953d4a66e13b37e4d9ffc02447ca19735d603bf`; merge/current main `baac91f5aa1a25d1013dcc762528cad558668512`; normal deploy `34535997309` SUCCESS at `https://05e16046.wpbnewconstruction.pages.dev` | 45 focused tests, four offline rows, typecheck, unchanged-canonical/bundle checks and all 12 CI jobs pass; buyer-facing bundles unchanged; `apply:false`, review-only | Preserve no Phase B, Sheet writeback, canonical fact application or publication |
| Alba Residence D HTML | Implemented source hold; blocked, unpublished | Preserved implementation | Existing source discrepancy; live exclusion retained | Do not publish without source clarification |
| PR #75 / GA4 diagnosis | **PARKED** | Existing #75 untouched | Historical evidence only | Do not revisit in Batch5 |

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
- Final production SHA: `cdf8240a8a5c6b1bf482f0e48ce9e496fd9b0ebe`.
- PR #81 normal production workflow: `34278996546` — SUCCESS, including Cloudflare deployment.

### Final live acceptance

- Final live workflow: `34280040979` — **SUCCESS**.
- PR #80 production verification: SUCCESS.
- Six-page live Olara regression audit: SUCCESS.
- Final Batch 4 acceptance: **PASSED**.

The live acceptance covered canonical documents/metadata/schema/sitemap, buyer summaries and source/status qualification, images/internal links, both inquiry products, exact current interest, alias normalization, forward/reverse same-session switching, Rosewood ↔ Maison switching, first-touch preservation, desktop/mobile overflow, actual Maps and existing commercial/corridor/comparison/Olara journeys.

Two live-QA corrections were verification-harness-only: the browser used an intercepted Turnstile stub, and the harness dismissed/reset the successful lead modal between same-session actions. Neither altered production application SHA `cdf8240a...` or production runtime behavior.

All automated QA lead POSTs were intercepted. **No real lead was sent.** Production Turnstile server validation, inbox/email delivery, database/CRM delivery, actual GA4 transport and measured growth remain unverified.

Full Batch 4 implementation/release ledger: `docs/P2_PROJECT_SEO_BATCH4_PROGRESS.md`.

## Batch 6 release and blocked live acceptance

The original PR #86 record below is retained as historical evidence. PR #93 is the current buyer-facing corrective release; PR #89 later changed only internal tooling and left its bundles identical.

PR #86 approved head `e8483fc3a7a43aabd1827b98667f60f64ff0deb1` was merged at
`2026-09-10T19:58:49Z` as merge commit/production `2d0175eed5157afa58b57cfb8327ec590e2dda95`.
The single normal deploy `34523585398` succeeded at
`https://c0498f38.wpbnewconstruction.pages.dev`; no manual or duplicate deploy
was run. Concierge `34468567260`, Batch 5 `34468567325`, and social
`34468567278` were all green, nine jobs total.

The retained manifest at
`/Volumes/ExternalSSD/WPB_PR86_Review/.runtime/batch6-live-2026-09-10/manifest.json`
records 11 representative routes × desktop/mobile, six Olara plans ×
desktop/mobile, real Maps tile/zoom checks, an explicit shortlist submission,
hydrated metadata checks, and intercepted inquiries only. Those probes pass.
A focused 390px `/map/` Ask WPB/Maps Zoom-out check failed: the launcher
overlaps the native Zoom-out control by 1,495px², and the center/top-left
pointer checks hit Ask WPB. Batch 6 must not be marked LIVE-VERIFIED; a bounded
fix and retest are required. See the [durable live evidence](evidence/batch6-live-2026-09-10/README.md).

### PR #93 corrective release — deployed, consent follow-up remains

PR #93 (`fix/batch6-mobile-map-controls`) is **approved, merged and deployed**.
Approved head `ae076dc5926baeebedb30b8d45b23a2ade710c05` carries application source
`f761a0057460a98a45c333b2ffb16fad5b22e59d`; it merged as
`2469a470c4d7cd0391682e9566ef79d44ee417e4` and deployed through
[34534298501](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34534298501)
at `https://de109853.wpbnewconstruction.pages.dev`. The production representative
review passed 9 route/viewport cases and 7 intercepted inquiry proofs covering
the five canonical intents, legacy prefills, manual selection, floor-plan
context and first-touch preservation. After consent dismissal the original
native-control collision is clear, and fresh denied-consent zoom-in/out contexts
pass their real-tile, pan, concierge, focus/Escape, safe-area and overflow checks.

The remaining blocker is a fresh 390×844 first visit: consent owns the Zoom-out
center and covers the launcher while the background control remains actionable.
The selected [corrective live evidence](evidence/batch6-corrective-live-2026-09-10/README.md)
records the exact hit target and three screenshots. Whole Batch 6 remains
**NOT LIVE-VERIFIED / NOT MEASURED**. Review-only candidate branch
`fix/batch6-consent-control-ownership` contains the next proposed fix; it is not
release-approved or deployed. The conditional live proof is already authorized
after one separately approved corrective release.

## Historical Batch 5 authorship + trust review evidence

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
- `34309439506` — **FINAL GREEN**: keyed candidate SUCCESS, no-key candidate SUCCESS, aggregate Batch 5 review verification SUCCESS. Existing buyer journeys, Batch 4 regression, 48 Batch 5 browser/schema checks, complete repository suite, assets, SEO/GEO, Agent Skills, accessibility, gatekeeper, privacy/PII, keyed deployment preflight/actual Maps and expected no-key rejection all passed.

Screenshots are retained in the keyed/no-key workflow artifacts under the Batch 5 authorship and Batch 4 project-SEO evidence directories. This section is historical test/review evidence; the current deployed/live-verified state is recorded above.

Remaining limitations: visible responsibility is intentionally sparse rather than retroactively assigned; Scott has no page-review assignment yet; production outcomes are unmeasured; real lead fulfillment and actual GA4 transport are outside this Batch 5 review.

## Other retained release evidence

PR #78 remains approved/deployed/live-verified at merge/deployment `de5fd3d1581df372712d0f02ad54305d8f4f1b4b`; production workflow `34178444416` and live workflow `34178933079` succeeded. PR #76 remains approved/deployed/live-verified at merge/deployment `8128f7a5a24706a8fc743f156f2f1d0505f1b462`; production `34152334484` and live `34153465427` succeeded. Historical failure detail and artifact hashes remain in their dedicated progress/release documents and Git history.

## Measurement baseline

No post-Batch4 or Batch5 growth claim is made. Existing finalized Search Console baselines remain historical context only; no retrospective GA4 data or manufactured uplift is inferred. Batch 4 and Batch 5 are **not measured** until an appropriate observation window and authorized first-party evidence exist.

## Complete remaining roadmap

Independent batches start from then-current production main, use verified sources, full checks, desktop/mobile evidence and exact tested SHAs. Only separately approved batches deploy.

| Item | Status | Scope / evidence | Dependency | Next action |
|---|---|---|---|---|
| P2-001 / Batch 3 Olara plans | Implemented/tested/approved/deployed | A/C/D/F/I/L canonical Olara pages retained and regression-tested | None for published plans | Preserve; Alba remains held |
| Additional project plans | Planned | Other projects only with clean current official sources | Defensible drawings/facts | Alba remains held |
| P2-002 priority project SEO | **Rosewood + Maison d’Or complete through live verification**; remaining priority projects planned | Batch4 final prod `cdf8240a`; live `34280040979` | Official facts for later projects | Later project batches remain separate |
| P2-003 further curated comparisons | North/South/trio deployed; others planned | Downtown/waterfront, preconstruction/completed | Comparable source depth | Avoid thin mass pairwise pages |
| P2-004 contextual lead flows | Availability/packet/shortlist deployed; Batch4 live exact switching verified | Explicit request and first-touch ownership | Real fulfillment acceptance separate | Preserve PII/consent boundaries |
| P2-005 Buyer Intelligence Report | Planned | Monthly project changes and verified buyer intelligence | Verified period/owner/fulfillment | Separate future batch |
| P2-005 newsletter/preferences | Planned; no emails sent | Weekly/monthly/project subscriptions | Explicit opt-in/unsubscribe/provider | No unapproved automation |
| P2-006 real authors/reviewers — Batch 5 | **Implemented/tested/approved/deployed/live-verified; not measured** | PR #83; production merge/deployment `0713e029`; live `34410472433`; historical final tested corrective SHA `f8e6b8f3`; final green `34309439506`; real-person profiles, compact bylines/review labels, stable Person schema and About/Methodology connections | Measurement and ongoing responsibility review | Preserve; no retroactive attribution |
| P2-007 buyer due diligence | Planned | Deposits/contracts/fees/parking/storage/pets/services/delays | Authoritative sources | General education only |
| P2-008 lifestyle/feature guides | Planned | Marina/branded/wellness/private elevators/etc. | Verified project facts | Avoid invented policies/thin pages |
| P2-009 linking/query ownership | Existing discovery/query ownership deployed and live-regressed | Market/browse/place/brand/layout/decision/process/news roles | Useful context | Preserve canonicals/equity |
| P2-010 measurement | Baseline exists; outcomes unmeasured | 7/28/60–90 day evaluation windows | Observation time + authorized first-party data | No manufactured uplift; GA4 remains parked |
| P2-011 first-visit consent control ownership | **Candidate review only; not release-approved/deployed** | `fix/batch6-consent-control-ownership`, reviewed application commit `c14c5b3ff542b98a5b91737cbcdbed6a7c2d2f93`; local typecheck/build, analytics checks and 9/10 broader layout cases pass; fresh keyed CI and final PR checks pending. The 320px homepage `.home-section-jump` 12px overflow is a pre-existing maintenance limitation. | Batch 6 first-visit live-pass; Brooke release approval | Review candidate, then use the already-authorized conditional live proof only after one approved corrective release |

## Lead-product register

| Product | State | Fulfillment / next action |
|---|---|---|
| Send current availability | Deployed across approved surfaces including Rosewood/Maison | Current team confirmation, not a live-inventory promise |
| Pricing + floor-plan packet | Deployed across approved surfaces including Rosewood/Maison | Team-prepared current packet; exact same-session switching live-verified |
| Compare my shortlist | Approved/deployed/live-verified | Explicit selected IDs retained; team comparison response |
| Project-change alerts | Planned | Separate opt-in/preferences/unsubscribe work |
| Monthly Buyer Intelligence Report | Planned | Verified cadence/owner/assembled report and consent |

Four existing high-severity dependency findings, existing asset advisories and large-chunk warnings remain separate maintenance. No unrelated cleanup is folded into Batch 5. PR #75 remains parked and GA4 untouched.
