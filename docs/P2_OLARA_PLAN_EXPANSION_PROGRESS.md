# Phase 2 verified Olara plans — Batch 3 / draft PR #79

Recorded September 8, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.
Branch: `p2-olara-verified-plan-expansion`.
Production base: `b3f3af776af5dadbdb68fb302ea1db74012cef01`.

## Status and authorization

**Implemented and tested; draft PR #79 awaits Brooke's separate review. NOT approved, merged, deployed or measured.** This branch was created after the approved PR #78 release completed its one automatic deployment and live verification. PR #78's approval does not authorize publishing these additional plans.

PR #75 and analytics configuration remain **PARKED — blocked / non-critical / revisit separately** and were not modified or diagnosed. The declined Search Console authorization was not retried. No real leads, marketing emails, inbox/CRM delivery certification or measured-growth claims.

## Five added individual layouts

All routes reuse `/floorplans/olara/residence-{letter}/`. Existing Residence D remains published; no mirror/version or collection pages are added. All areas below are source-reported square feet, with interior and outdoor space kept separate.

| Added plan | Bedrooms / den | Bathrooms | Interior | Terrace / exterior | Reported total | Drawing floor range | Distinct comparison use |
|---|---|---|---:|---:|---:|---|---|
| A | 2 + separate den | 2 + 1 powder room | 1,857 | 466 | 2,323 | 7–18 | Two bedrooms plus workspace; long terrace across living frontage |
| C | 3 + separate den | 3 + 1 powder room | 3,286 | 1,225 | 4,511 | 7–26 | Larger three-bedroom-plus-den interior and substantial two-sided terrace |
| F | 4 + separate den | 4 + 1 powder room | 3,805 | 793 | 4,598 | 7–26 | Four-bedroom layout; drawing labels a private lobby, gallery and pantry |
| I | 3; no separately labeled den | 3 + 1 powder room | 2,358 | 922 | 3,280 | 7–18 | Three-bedroom layout and terrace wrapping the great-room corner |
| L | 2; no separately labeled den | 2 + 1 powder room | 1,483 | 354 | 1,837 | 7–26 | More compact two-bedroom interior; verify amenity-deck-side exposure |

Each source total equals its reported interior plus exterior area. A den is not presented as another bedroom, a powder room is not another full bathroom, and terrace area is not interior living area. Labels such as private lobby do not establish elevator rights or services. Floor ranges, drawings and marketing do not prove availability, inventory, pricing or completion timing.

Retained Residence D: 2 bedrooms + den, 2 bathrooms + powder, 1,774 interior + 381 exterior = 2,155 total; floors 7–26. Its original source-review/content dates remain September 5. Alba's August 2022 drawing and 10-square-foot discrepancy remain held: no Alba HTML, sitemap entry or discovery; existing PDFs preserved.

## Official source and document review

Official index: [Olara floor plans](https://www.olarawestpalmbeach.com/floorplans).
Each current PDF is linked by that page, not inferred merely from a plausible filename:

| Plan | Official linked drawing | Verified PDF SHA-256 |
|---|---|---|
| A | [Residence A](https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_A.pdf) | `91d4416ee455668724d4f224e9922e7762f17f3ff4d83d20314f677f40983eb0` |
| C | [Residence C](https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_C.pdf) | `a141730dc0e04ddc8b89564f06e94b1c96bac554f62a497dd2651bbc3eb7e193` |
| F | [Residence F](https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_F.pdf) | `1b05fbfe7627ad116f0f1e6ed1cf0dfc68a152274a035a992086377cc5770b90` |
| I | [Residence I](https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_I.pdf) | `ad6c832ae91d104dada99226e480ee8949319df74dd7985c5bed5c1d29abae77` |
| L | [Residence L](https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_L.pdf) | `d149eec50ccd79b38e69956a20ea5af04eb2e3aa71dbc86d9ad2161c2f038c6d` |

Initial retrieval began `2026-09-08T02:19:29.456Z`; all five current PDFs matched their existing approved archive bytes. Official PDF pages, archived PDFs and approved JPEG previews were visually compared: layout geometry, title, floor range, bedroom/den/bathroom labels and printed areas agree. No image or PDF asset was changed.

**None of these five drawings states a printed revision date or revision code.** `printedRevisionDate` is explicitly null. Filename `31126`, PDF creation/modification metadata and archive identifier `v01` are NOT certified developer revision dates. Their actual metadata is retained privately for provenance, not substituted for a printed date. Public pages state that limitation and display the actual source-review date **2026-09-08**. A release/source check is not proof the layout will remain unchanged.

Exact approved PDF/JPEG paths, SHA-256 hashes, HTTP timestamps, document metadata, expected fact snapshots and visual-review notes are in `research/source-material-review/olara-plan-expansion-verified.json`. A, C and F preserve their existing `olara-floorplans-olara-floorplan-s-digital-31126-{letter}-v01.pdf` URLs; I and L preserve `olara-floorplans-olara-residence-plan-{letter}-v01.pdf`. No URL redirect or duplicate mirror entity was introduced.

`review-olara-plan-sources.mjs` now checks all five official index links, current PDF hashes, approved archive/preview hashes and expected facts against that reviewed ledger. It fails closed if any source, asset or fact changes; it does not silently republish replacements. The final keyed/no-key CI reretrieved and passed this check. Source review is not delegated to filename matching alone.

## Existing framework reused

- Five allowlisted data entries in `src/data/olaraPlanExpansion.ts` extend `reviewedPlans` in the existing `floorplanEntities.ts`. Facts still resolve through the unchanged approved library and its fail-closed snapshots. Hashes/research notes remain outside the public projection.
- The existing renderer, route lookup, early availability action, plan facts, preview/download, metadata, WebPage/CreativeWork/BreadcrumbList schema and footer are reused. One contextual link to the now-live Olara/Ritz-Carlton/Shorecrest comparison was added to Olara plan pages; no second renderer was built.
- The existing floor-plan prerender pass publishes the six allowed Olara entities, updates canonical sitemap entries and adds one discovery block/schema node on the floor-plan library and matching project. New entity dates are September 8; D's original date remains unchanged. No new publishing pipeline or package script.
- The unchanged page runtime and shared inquiry bridge already derive `floorplan:olara:residence-{letter}` from the actual entity. Tests verify exact building, plan, interest, CTA placement and first touch in the client submission payload, not merely session storage.
- The production core router, bootstrap, plan runtime/styles, inquiry bridge, analytics/consent/sanitizer, lead storage, comparison/corridor/commercial code, approved library, generated/public assets/PDFs, functions, package/lockfile and production deploy workflow are byte-identical to the base. CI enforces these boundaries.

## Exact tested revision and final checks

**Tested implementation: `30191b911d90a5299d6abf7adbd91587bc2d6cf8`.**
[No-deploy run 34180784091](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34180784091):
- **Keyed candidate 101919301482: SUCCESS**.
- **No-key candidate 101919301613: SUCCESS**.
- **Olara plan batch review verification 101920410287: SUCCESS**.

| Check | Final result |
|---|---|
| Current official-source verification | 5/5 PASS in both modes; current downloads still match approved PDFs/previews and reviewed facts |
| Typecheck, build and complete `npm test` | PASS both modes; 79 unit tests including four new source/entity contracts |
| SEO/GEO, metadata, links, public-data/PII, consent, performance and gatekeeper | PASS; no weakened assertions or increased budgets |
| Standard / strict asset audit | PASS both modes; 0 blockers, 0 strict blockers, 81 existing advisories |
| Existing floor-plan static checks | 6/6 published Olara entities PASS; Alba held/excluded; preserved PDF URLs |
| Plan desktop/mobile × JavaScript on/off | 24/24 views PASS per mode, including retained D |
| Exact plan inquiry submissions | 36/36 intercepted POSTs PASS per mode: 24 fresh requests across both CTA placements + 12 same-session plan switches |
| Additional native project-to-plan discovery | 10/10 PASS per mode, beyond the retained D navigation checks |
| Corridor regressions | 12 browser views + 18 intercepted POSTs PASS per mode |
| Comparison regressions | 8 browser views + 12 intercepted POSTs + 2 discovery journeys PASS per mode |
| Existing commercial / integration regressions | PASS; 8 commercial views / 8 intercepted POSTs and 12 integration POSTs per mode |
| Keyed preflight and actual Maps | PASS; 4/4 real loader, rendered tiles and zoom checks on home/map at desktop/mobile |
| No-key preflight | Expected missing-loader deployment rejection explicitly asserted; not a working-Maps claim |
| Protected-source and evidence credential scans | PASS; no compiled key-bearing bundles or raw lead payloads archived |

The source-bearing data is added through the production framework; tests do not replace it with alternate content. Six plan identities are checked explicitly; collection/mirror/unknown/held routes and contaminated inquiry contexts are rejected. Same-session requests deliberately retain the original D landing page while replacing the current A/C/F/I/L/D plan context. Each submit/success event is counted once and synthetic contact data is absent from the inspected analytics queues.

## Evidence and visual review

Both final artifacts were downloaded, their embedded tested SHA checked and ZIP SHA-256 independently verified:
- [Keyed artifact 10038941437](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34180784091/artifacts/10038941437): `4a6089df074dc75aacdb45c3e33eee6a323f8ef41db5aefe36edf6e74eaa992d`.
- [No-key artifact 10038946464](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34180784091/artifacts/10038946464): `6214d4134e42e7ba93e0baff7e5d8e39d582c18dda6e30dd1306d9021dc23122`.

Source evidence: `olara-source-review/`; exact tested source/SHA/asset audit: `olara-plan-review/`; all six plan screenshots and request results: `phase-2-qa/`. Plan screenshot names now contain both project and plan slug, avoiding accidental overwriting when several pages belong to Olara. Keyed source reretrieval began `2026-09-08T02:39:33.157Z`; comparison regression finished `2026-09-08T02:45:03.039Z`; both artifacts completed by 02:45:39 UTC.

All five new desktop/mobile page previews and their mobile source-note/footer layouts were visually inspected; the approved drawing previews, early CTAs, separate area/bathroom facts, source qualifications and comparison links are visible without overlap. Desktop/mobile inquiry screenshots were also inspected and precede contact entry. The page design and form styling remain the existing production framework. No rendering correction was needed after that final review. Full recorded JavaScript-disabled screenshots are retained in the artifacts.

## Failure history and limits

First Batch 3 run34180598352 at `b135b85e8730c17c2445e4de1564b78887a77388` failed an overlooked inherited integration assertion that expected exactly one published Olara plan. It correctly detected the expanded six-plan scope. The follow-up replaces that old expectation with the exact six project/slug pairs, not a permissive count or removed assertion. The complete keyed/no-key suites then passed at the final SHA. The first failed run remains historical evidence.

Prior comparison-release timeouts remain in `docs/P2_COMPARISONS_IMPLEMENTATION_PROGRESS.md`: the original commercial status-filter reset timeout, one incomplete Maps case that passed unchanged on rerun, and the live edit-shortlist startup boundary. No unrelated runtime or analytics correction was mixed into this batch. This plan expansion does not certify pre-hydration, new-tab or JavaScript-disabled automatic attribution.

All lead POSTs and third-party analytics in browser journeys are intercepted. No real leads were sent; a browser-only challenge fixture is not production CAPTCHA validation. Inbox/CRM/email delivery, actual GA4 transport and measured traffic/lead growth are NOT tested or claimed. No-JavaScript tests cover content and native navigation, not form submission. The dedicated review Maps key is BUILD-only; production credentials/restrictions remain unchanged.

The declined Search Console authorization was not retried. Older finalized August 8–September 4 data remains labeled baseline context in the delivery tracker; these five plans were chosen for verified source quality and distinct buyer layouts, not invented keyword volume or measured uplift.

## Remaining release decision

Brooke reviews the five plan pages, source qualifications and exact-plan inquiry flow before separate release approval. Alba stays held regardless of this review. Any later documentation-only successor is not substituted for the exact tested implementation; PR #79 records the precise successor/diff. No Batch 3 merge/deployment or further feature batch was started.
