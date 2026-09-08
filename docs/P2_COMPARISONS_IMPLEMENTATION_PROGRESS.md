# Phase 2 buyer comparisons — Batch 2 / PR #78

Release recorded September 8, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.

## Current status

**Brooke approved PR #78. It is merged, deployed once and live-verified for initialized-page journeys. Search/lead growth is not measured.** The approval covers Batch 2 only. Additional Olara plans require a separate branch, draft PR and review before deployment. PR #75 / GA4 configuration remains PARKED — blocked / non-critical / revisit separately; neither its code, PR nor settings were changed or diagnosed.

## Release identity and checks

| Identity | Value |
|---|---|
| Approved implementation | `1b4ecc49693dafd09bb2be3abea9b93edff16c21` |
| Approved documentation successor | `db5b5c0b79f9990cd39a1ec1e16c3f9d0451e4a4` |
| Identical-tree verification commit | `133e01510ce4632002794c53821ad81a71d7b75d` — no files changed |
| Merge / deployed application | `de5fd3d1581df372712d0f02ad54305d8f4f1b4b` |
| Exact release tree | `6f068d62b9c5be3f18d7d807eae8f58d68c17be2` |
| Production base before release | `df77653322cf064f76c9946766609733bdc78490` |
| Candidate run | [34177737077](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34177737077) |
| Final candidate jobs | keyed `101911442455`, no-key `101911442956`, aggregate `101912248497`: SUCCESS |
| Automatic production run | [34178444416](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34178444416), attempt 1, main push |
| Production job | `101912413148`: build, launch QA, gatekeeper and actual Cloudflare deployment SUCCESS |
| Live audit run | [34178933079](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34178933079), job `101913834233` SUCCESS |
| Audit-only revision | `0e007830e72c47c127851e478fcf83d6c46848dc`, branch `p2-78-live-verification` |

Main was rechecked before merging; there was no intervening production change. GitHub comparison confirmed the approved successor changed only the two documentation files. Because that successor skipped CI, a no-file-change commit reran both complete candidate modes on its identical tree. PR #78 was marked ready and merged normally with an expected-head SHA, without a force push or administrative bypass. There was no manual production deployment. This documentation closeout contains no application changes and is committed with `[skip ci]` to avoid another production run.

## Live verification

Production origin: `https://www.wpbnewconstruction.com`.

- `/answers/north-flagler-vs-south-flagler-new-condos/`
- `/answers/olara-vs-ritz-carlton-vs-shorecrest/`
- Discovery on `/answers/`, `/compare/`, `/projects/olara/`, `/projects/ritz-carlton-wpb/`, `/projects/shorecrest/`.
- Existing Downtown, South Flagler and Palm Beach corridor routes; `/floorplans/olara/residence-d/`; `/inquire/`; `/`; `/map/`; `/sitemap.xml`; `/llms.txt`.

| Live check | Result |
|---|---|
| Two comparison static documents | PASS; exact approved content, metadata, clean canonicals, matching schema, one sitemap entry each dated `2026-09-07` |
| Desktop/mobile, JavaScript on/off | 8/8 comparison views PASS; screenshots inspected |
| Shortlist editing / primary-building choice / switching requests | 12/12 intercepted comparison POSTs PASS; explicit selected IDs survive actual payload and local server normalization |
| Native comparison discovery | 2/2 journeys PASS; five static discovery pages match the approved block exactly once |
| Existing corridors | 3 static pages, 12 browser views and 18 intercepted POSTs PASS |
| Existing Olara D HTML, preview and PDF | PASS; live markup matches source and both asset SHA-256 digests match approved repository bytes |
| Google Maps | 4/4 actual loader, rendered tiles and zoom checks PASS on home/map at desktop/mobile; fallback not accepted |
| Alba held page | Live 404; excluded from sitemap |
| Public discovery | New comparison retained in `llms.txt`; linked internal resources returned successful responses |

Comparison results: `2026-09-08T02:10:07.651Z`; corridor results: `2026-09-08T02:12:46.763Z`; detailed discovery/assets: `2026-09-08T02:12:47.657Z`. [Live artifact 10038314335](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34178933079/artifacts/10038314335) was downloaded and SHA-256 verified: `2174f0b8d7659a9b79357c7226d64d21cc44fce6bb700c989682f0540a907fb3`. It includes safe desktop/mobile screenshots, results and deployed-source identity. No compiled key-bearing bundles, raw contact payloads or HARs are archived.

**No real leads were sent.** All lead POSTs and third-party analytics in the buyer journeys were intercepted. Server normalization is exercised locally, not via production CRM. Production CAPTCHA validation, inbox/email delivery, CRM delivery, actual GA4 transport and measured growth are NOT certified. Names/contact values are absent from the inspected local analytics queues. No-JavaScript verifies research and native navigation, not automatic shortlist transfer. Modified/new-tab and pre-hydration attribution remain explicit boundaries.

## Initialization boundary and preserved failure records

The first live audit [34178483898](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34178483898) passed the static comparison pages, the initial desktop shortlist submission, all corridor journeys, asset/discovery checks and real Maps. It timed out returning through **Edit my shortlist** before the lazy navigation enhancement was ready. The form bridge is installed earlier than the comparison-discovery module. A visible form therefore does not establish complete navigation initialization on the real network.

The final audit waits for the initialized shell and completed lazy resource loading before interacting with legacy pages. All original editing, subset, primary-choice, payload, consent/PII, schema and event-count assertions remain. It then passed against the SAME deployed application. This audit-harness change is not a production fix or certification of early-click behavior. Track early-click navigation/attribution hardening separately. The original failed artifact `10038153771` and run remain evidence.

The release candidate's first keyed attempt in run34177737077 did not complete one desktop home Maps check; the other three Maps cases and all repository, comparison, corridor and inquiry checks passed. The failed keyed job was rerun unchanged and passed in full. No source, key restriction, assertion or budget was changed. Its root cause is not established or described as fixed. First keyed artifact `10037915976` is retained, digest `ca7cd2fe498e6c4b5dc52c882f75bca59899aabfbc43de0739fa956e373e5fb3`.

**Historical commercial-filter timeout preserved:** an initial keyed attempt at implementation `1b4ecc49693dafd09bb2be3abea9b93edff16c21`, run34159423436, timed out resetting an existing commercial status filter (`check-commercial-growth.mjs:97`). Full repository, comparison, corridor, asset and Maps checks passed. The entire failed keyed job reran unchanged and passed. The underlying timeout was not established or labeled fixed; no assertion was waived.

Earlier implementation review corrected missing new-route `llms.txt` discovery, forbidden outbound developer anchors, and lazy arrival of the new inquiry-summary styles. The tiny summary stylesheet now loads before the form bridge; larger comparison styles remain lazy. Existing budgets and the immediate heading-color assertion were retained. The disabled-selection regression checks `aria-disabled`, keyboard activation and no navigation/submission.

## Implemented scope and source record

The existing North/South answer canonical was improved, not duplicated. One substantive Olara/Ritz-Carlton/Shorecrest comparison was added, with useful location, service/cost, scale, layout, timing and buyer-verification differences. No mass-generated pairs, fake authors, offers, ratings, inventory/prices/incentives or guaranteed dates were introduced. Source review was September 7, 2026; the release date is not a new fact-review date.

Official-source ledger:
- [Olara residences](https://www.olarawestpalmbeach.com/residences/), [lifestyle](https://www.olarawestpalmbeach.com/lifestyle/), [Gilbane](https://www.gilbaneco.com/projects/olara-residences-gilbane-building/): layouts, amenities and marina positioning. Slip rights, fees and shared amenities require documents. No disputed residence count or current closing date asserted.
- [Ritz-Carlton residences](https://theresidenceswestpalmbeach.com/residences/), [amenities](https://theresidenceswestpalmbeach.com/amenities/), [BH Group](https://www.bhgroupmiami.com/projects/the-ritz-carlton-residences-at-west-palm-beach/): dedicated elevator arrival, services and dated construction guidance. Official 1717/1745 address discrepancy is disclosed. Residence counts do not mean available units; advertised completion is a target.
- [Shorecrest residences](https://www.shorecrestwpb.com/residences), [amenities](https://www.shorecrestwpb.com/amenities), [Related Ross April 3 release](https://www.relatedross.com/press-releases/2026-04-03/related-ross-breaks-ground-shorecrest-ushering-new-chapter-west-palm): two/three bedrooms, smaller published collection, rooftop/club and dated groundbreaking. Current inclusions/timing need confirmation.
- [South Flagler House](https://www.southflaglerhouse.com/), [RAMSA](https://www.ramsa.com/news/article/south-flagler-house-tops-out-west-palm-beach), [La Clara contractor](https://www.jm-a.com/portfolio/la-clara/): loggias, club program, structural milestone versus completed alternative. Conflicting counts omitted; no resale inventory asserted.

The existing outbound-domain policy remains; restricted destinations use visible citation labels and schema/ledger provenance, not disguised redirects or gatekeeper exemptions. Buyer fit compares routines/features, not demographics or investment returns. Core router, production analytics/consent/sanitizer, lead storage, corridors, existing commercial surfaces, plan definitions, generated/public assets/PDFs, functions, package/lockfile and production workflow remained unchanged by Batch 2.

`shortlist.ts` accepts only the two comparison identities and their public IDs; at least two unique buildings, canonical order, bounded length. All 30 valid subsets are tested. Selection is explicit, never inferred from viewing history. Context survives the unchanged normalizer and existing CTA storage/notification fields; no endpoint/database configuration changed. The full list remains independent of the primary-building field; fresh corridor/commercial/plan requests replace stale shortlist metadata while preserving first touch.

## Prior implementation verification and search limitations

Original full passing run [34159423436](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34159423436): keyed101859747256; no-key101859748088 (carried-forward original success); aggregate101860776135. Both modes passed typecheck, build, full npm test (75 units including eight comparison contracts), SEO/GEO, links, privacy, performance, gatekeeper, standard/strict assets (zero blockers; 81 advisories), 8 comparison views/12 intercepted POSTs/2 discovery journeys, 12 corridor views/18 POSTs, 12 commercial/plan/integration views/24 POSTs, keyed preflight/4 real Maps checks and expected no-key rejection.

Historical verified artifacts: keyed10032381849 SHA-256 `c3200a913d83bdaad0ecdfb0472ff0db776bbf7024efc0756048f11c97436a6c`; no-key10032177416 `5662a0befda64f50e11478908e5c286453daba9fd3f5e7a7cbb536c641aa28ba`. The complete pre-release document is preserved in [approved history](https://github.com/BrokenFL/WPB_New_Construction/blob/db5b5c0b79f9990cd39a1ec1e16c3f9d0451e4a4/docs/P2_COMPARISONS_IMPLEMENTATION_PROGRESS.md).

Fresh Search Console authorization was declined and was NOT retried in the release. The last verified August 8–September 4 snapshot remains baseline context, not fresh data or measured uplift: North Flagler8 clicks/351 impressions, South Flagler0/21, Olara/Shorecrest Market Note1/16, small North/South answer query sample2 impressions. The comparison follows source coverage and Brooke's priorities, not invented demand. PR #76's prior live release remains documented in `docs/P2_76_RELEASE_VERIFICATION.md`.
