# Phase 2 delivery tracker — WPB New Construction

Updated September 8, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.
Requirements: `docs/ASTRA_PHASE_2_GROWTH_HANDOFF.md` and Brooke's growth/release instructions.

## Current direction

**Batch 4 Rosewood + Maison d’Or is IMPLEMENTED / TESTED / APPROVED / DEPLOYED / LIVE-VERIFIED, but NOT MEASURED.** Current production application: `cdf8240a8a5c6b1bf482f0e48ce9e496fd9b0ebe` after the narrowly scoped PR #81 canonical-link hotfix. PR #80 merged as `9041493a48c573658872d79445c4f1e796643c8c`; the approved exact tested application was `b0f0f216f73abb4d42466c6c0aeaeb50325f380f`.

Final live acceptance workflow `34280040979` completed successfully after the hotfix. The PR #80 production verification and six-page live Olara regression audit were both successful. The final live audit used only intercepted QA submissions; no real lead was sent.

**PR #75 / GA4 Admin diagnosis remains PARKED — blocked / non-critical / revisit separately.** No GA4 configuration was changed and no actual GA4 transport or measured growth is claimed.

Batch 3 / PR #79 remains a separate review-gated batch. Alba’s unpublished HTML state remains preserved. 3D map and Three.js floor-plan implementation remain outside this work.

## Status contract

Planned = scoped. Implemented = code/content exists. Tested = exact revision and evidence recorded. Approved = Brooke authorized presentation/release. Deployed = actual authorized production publication. Live-verified = production behavior checked after deployment. Measured = post-release first-party outcomes observed. Blocked = a specific missing dependency, never a reason to stop independent work.

## Delivery ledger

| Task | Status | Branch / PR | Evidence | Remaining limitation / next action |
|---|---|---|---|---|
| Rosewood + Maison d’Or project SEO / Batch 4 | **Implemented, tested, approved, deployed, live-verified; NOT measured** | `p2-project-seo-rosewood-maison-dor` / PR #80 + PR #81 hotfix | Tested app `b0f0f216`; implementation run `34266304318`; PR80 merge `9041493a`; final prod `cdf8240a`; final live `34280040979` SUCCESS | Real production lead delivery and outcome measurement remain separate |
| Olara Residence D HTML/discovery | Implemented, tested, approved, deployed; not measured | Production main | Existing live markup, preview/PDF and regression evidence retained | Preserve |
| Five additional Olara plans A/C/F/I/L | Implemented, tested; NOT approved/deployed/measured | `p2-olara-verified-plan-expansion` / draft #79 | Exact SHA `30191b911d90a5299d6abf7adbd91587bc2d6cf8`; run `34180784091` | Separate Brooke review before release |
| Homepage / Buildings | Implemented, tested, approved, deployed; not measured | Production main | Commercial/inquiry regressions remain green | Preserve |
| Downtown / South Flagler / Palm Beach corridors | Implemented, tested, approved, deployed, live-verified; not measured | PR #76 | Production `34152334484`; live `34153465427`; later regressions green | Preserve |
| Corridor availability + pricing/floor-plan packet | Implemented, tested, approved, deployed | PR #76 | Intercepted live request/first-touch context retained by later regressions | Real fulfillment acceptance still separate |
| North/South and Olara/Ritz/Shorecrest comparisons | Implemented, tested, approved, deployed, live-verified; not measured | PR #78 | Candidate `34177737077`; production `34178444416`; live `34178933079`; Batch4 live regressions pass | Preserve |
| Compare my shortlist | Implemented, tested, approved, deployed | PR #78 | Existing live/intercepted shortlist regression coverage remains green | Real fulfillment remains manual |
| Real-person authorship / trust layer — Batch 5 | **In progress, separate draft release gate** | New branch/draft PR from current production main | Audit and implementation follow Batch4 closeout | Verify every public professional fact; no invented identities |
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

## Other retained release evidence

PR #78 remains approved/deployed/live-verified at merge/deployment `de5fd3d1581df372712d0f02ad54305d8f4f1b4b`; production workflow `34178444416` and live workflow `34178933079` succeeded. PR #76 remains approved/deployed/live-verified at merge/deployment `8128f7a5a24706a8fc743f156f2f1d0505f1b462`; production `34152334484` and live `34153465427` succeeded. Historical failure detail and artifact hashes remain in their dedicated progress/release documents and Git history.

## Measurement baseline

No post-Batch4 growth claim is made. Existing finalized Search Console baselines remain historical context only; no retrospective GA4 data or manufactured uplift is inferred. Batch 4 is **not measured** until an appropriate observation window and authorized first-party evidence exist.

## Complete remaining roadmap

Independent batches start from then-current production main, use verified sources, full checks, desktop/mobile evidence and exact tested SHAs. Only separately approved batches deploy.

| Item | Status | Scope / evidence | Dependency | Next action |
|---|---|---|---|---|
| P2-001 / Batch 3 Olara plans | Implemented/tested; separate approval required | Five additional A/C/F/I/L pages in draft #79; D retained | Brooke review | No deployment before approval |
| Additional project plans | Planned | Other projects only with clean current official sources | Defensible drawings/facts | Alba remains held |
| P2-002 priority project SEO | **Rosewood + Maison d’Or complete through live verification**; remaining priority projects planned | Batch4 final prod `cdf8240a`; live `34280040979` | Official facts for later projects | Later project batches remain separate |
| P2-003 further curated comparisons | North/South/trio deployed; others planned | Downtown/waterfront, preconstruction/completed | Comparable source depth | Avoid thin mass pairwise pages |
| P2-004 contextual lead flows | Availability/packet/shortlist deployed; Batch4 live exact switching verified | Explicit request and first-touch ownership | Real fulfillment acceptance separate | Preserve PII/consent boundaries |
| P2-005 Buyer Intelligence Report | Planned | Monthly project changes and verified buyer intelligence | Verified period/owner/fulfillment | Separate future batch |
| P2-005 newsletter/preferences | Planned; no emails sent | Weekly/monthly/project subscriptions | Explicit opt-in/unsubscribe/provider | No unapproved automation |
| P2-006 real authors/reviewers — Batch 5 | **Started separately from current production main** | Real-person profiles, compact bylines, review/update metadata, stable Person schema and About/Methodology connections | Verified public professional facts + genuine responsibility | Draft PR only; no deployment before Brooke review |
| P2-007 buyer due diligence | Planned | Deposits/contracts/fees/parking/storage/pets/services/delays | Authoritative sources | General education only |
| P2-008 lifestyle/feature guides | Planned | Marina/branded/wellness/private elevators/etc. | Verified project facts | Avoid invented policies/thin pages |
| P2-009 linking/query ownership | Existing discovery/query ownership deployed and live-regressed | Market/browse/place/brand/layout/decision/process/news roles | Useful context | Preserve canonicals/equity |
| P2-010 measurement | Baseline exists; outcomes unmeasured | 7/28/60–90 day evaluation windows | Observation time + authorized first-party data | No manufactured uplift; GA4 remains parked |

## Lead-product register

| Product | State | Fulfillment / next action |
|---|---|---|
| Send current availability | Deployed across approved surfaces including Rosewood/Maison | Current team confirmation, not a live-inventory promise |
| Pricing + floor-plan packet | Deployed across approved surfaces including Rosewood/Maison | Team-prepared current packet; exact same-session switching live-verified |
| Compare my shortlist | Approved/deployed/live-verified | Explicit selected IDs retained; team comparison response |
| Project-change alerts | Planned | Separate opt-in/preferences/unsubscribe work |
| Monthly Buyer Intelligence Report | Planned | Verified cadence/owner/assembled report and consent |

Four existing high-severity dependency findings, existing asset advisories and large-chunk warnings remain separate maintenance. No unrelated cleanup is folded into Batch 5. PR #75 remains parked and GA4 untouched.