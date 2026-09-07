# Phase 2 corridor SEO — Batch 1 / PR #76

Updated: September 7, 2026 (UTC). Repository: `BrokenFL/WPB_New_Construction`.
Branch: `p2-corridor-seo-downtown-south-flagler-palm-beach`.
Production baseline: `dd28320f689a3f377b6137671e702b6c58778b67`.

## Current verified candidate — September 7 orchestrator review

**Exact tested HEAD: `04544146bc0187c46ec7fd1c90247fbffc5aee0d`.** This supersedes the earlier verification ledger below; earlier results are retained as history, not erased.

[No-deploy run 34146486527](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34146486527) was checked directly through GitHub:

| Job | ID | Result |
|---|---:|---|
| Corridor candidate (keyed) | 101819538484 | SUCCESS |
| Corridor candidate (no-key) | 101819538652 | SUCCESS |
| Corridor batch review verification | 101820510446 | SUCCESS |

Both modes passed typecheck, production build, complete npm test, standard/strict assets, existing commercial/floor-plan/combined regressions, and corridor checks. The keyed job passed the deployment preflight and real Maps checks; the no-key job passed explicit expected deployment rejection.

The latest keyed artifact was downloaded and independently inspected during this orchestrator review. Its `tested-sha.txt` and corridor `results.json` both identify `04544146bc0187c46ec7fd1c90247fbffc5aee0d`. Results include 3 static corridor checks, 12 desktop/mobile JavaScript-on/off views, 18 intercepted corridor/request-switching submissions, and 4 real Maps checks. Its desktop/mobile corridor screenshots, top sections and full-page desktop layouts were visually reviewed. This is review of recorded CI evidence and selected source changes, not a new execution of the application or a new verification of every external project fact.

- [Keyed artifact 10027937467](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34146486527/artifacts/10027937467): downloaded SHA-256 verified as `74c3035964c6db0124bf1ae9cd8183ee17f7225e9ef7b68f39d31e63840691c3`.
- [No-key artifact 10027928146](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34146486527/artifacts/10027928146): GitHub-reported SHA-256 `f4e01349cfb94c858dd5f2b4c94da65412adbe0516a6249dcef263b2a1b19528`; job success verified, archive not separately downloaded in this review.

The last implementation commit changes browser-test readiness to wait for the hydrated application. Screenshots and safe results from the current run now supplement the earlier application-revision visual review. No additional code correction was identified in this scoped review.

**Recommendation: ready for Brooke's release decision.** This recommendation is not Brooke's approval. PR #76 remains draft, unmerged, undeployed and unmeasured. Main and PR #75 remain untouched. Lead POSTs and analytics were intercepted; neither production CAPTCHA/CRM delivery nor GA4 transport is certified by these tests. Any documentation-only successor to the tested HEAD must be distinguished from that tested code revision.

Next: Brooke reviews the screenshots and authorizes or declines release. Following approval, verify the then-current diff/checks, use one normal main-branch deployment and check the three live corridor routes plus inquiry navigation. Batch 2 comparisons can proceed independently from then-current production main; improve existing comparison canonicals rather than duplicating them. PR #75 is not a growth dependency.

## Review status

**Implemented and tested; draft PR #76 awaits Brooke's review. Not approved, deployed or measured.** The current instruction parks PR #75 / GA4 Admin diagnosis as **blocked / non-critical / revisit separately**. Its branch, PR and tests were not modified or diagnosed. Production analytics and consent source files remain byte-for-byte unchanged; this independent growth batch does not depend on the parked correction.

A clean branch was created from the exact production baseline. Changes and verification use the connected repository and isolated GitHub Actions runners, not Brooke's Mac/SSD checkout. No local user work was overwritten. Review artifacts are not production deployments.

## Search Console basis

Read-only retrieval September 7: `sc-domain:wpbnewconstruction.com`; finalized all-device window **August 8–September 4, 2026**, compared with July 11–August 7. The planning connector does not represent a complete per-corridor export. Absent pages are not assigned zero impressions. No unrelated/personal query rows are republished.

| Existing page | Clicks | Impressions | Average position | Decision |
|---|---:|---:|---:|---|
| Downtown corridor | 0 | 49 | 42.29 | Clear city-core/NORA/Clear Lake distinctions and condo-shopping intent |
| South Flagler corridor | 0 | 21 | 24.90 | Waterfront purchase comparison, including completed alternatives |
| Palm Beach corridor | Not returned | Not returned | Not returned | User-prioritized island page; no invented performance baseline |
| North Flagler corridor | 8 | 351 | 12.09 | Preserve this existing winner; no rewrite |
| Closest-new-condos-to-Palm-Beach answer | 1 | 12 | 35.67 | Relevant related-answer link |

Examples: “downtown west palm beach condos” had 6 impressions at position 39; “new construction downtown west palm beach” had 1 at position 24. A rental-oriented downtown query had 4 at position 53.5. These small samples guide wording; they do not prove cannibalization or predict rankings. None are results caused by this undeployed batch.

## Page audit and implementation

The original pages used shared corridor definitions, generic authority tables and a separate static renderer. The new shared content adapter aligns visible copy, metadata and collection schema while retaining clean canonical paths. No new route was created.

| Existing canonical route | Distinct purpose | Researched examples |
|---|---|---|
| `/corridors/downtown-west-palm-beach/` | City core vs NORA vs Clear Lake; daily routine, layouts and location trade-offs | Mr. C, Nora House, Berkeley |
| `/corridors/south-flagler/` | Mainland Intracoastal offerings vs a completed-building alternative | South Flagler House, Maison d'Or, La Clara |
| `/corridors/palm-beach/` | Palm Beach island South End; ocean/lagoon access, offered vs proposed developments | OLIN, 3031 S. Ocean |

All three pages have distinct titles, descriptions, H1s and opening answers, two early availability/packet actions before the image, source-linked project cards and concise buyer-fit guidance. Marketed sales are distinguished from construction progress, planned/pipeline, completed, rental and mixed-use status. Further project links are research context, not additional current inventory. Existing answers, comparison tools and the open floor-plan library remain linked.

Dated reporting remains below evergreen guidance. Its inherited selector can include mainland stories on the island page, so the retained block is now accurately labeled **Regional development reporting**; original article links are preserved. No new pricing, inventory, incentives, delivery guarantees or fictional editorial staff are introduced.

## Official-source ledger

Sources checked September 7, 2026. Marketing evidence describes an offering, not residence-specific availability; historical milestones are identified as such.

| Source | Use and limitation |
|---|---|
| [Mr. C official residences](https://www.mrcresidenceswpb.com/residences/) | Layouts, terraces and service positioning; no unsupported occupancy date |
| [Nora House official site](https://norahouse.com/) | NORA setting, two- to four-bedroom layouts and two amenity rooftops; construction stage needs confirmation |
| [Berkeley official site](https://www.theberkeleypalmbeach.com/) | Clear Lake location and two- to five-bedroom offering |
| [Developer-issued July 6, 2026 construction release](https://www.prweb.com/releases/the-berkeley-palm-beach-breaks-ground-in-west-palm-beach-302817309.html) | Dated Berkeley milestone, not a guaranteed completion date |
| [South Flagler House](https://www.southflaglerhouse.com/) and [RAMSA topping-out report](https://www.ramsa.com/news/article/south-flagler-house-tops-out-west-palm-beach) | Loggias/club-style positioning and November 2025 milestone; conflicting residence counts omitted |
| [Maison d'Or official residences](https://livemaisondor.com/the-residences/) | Two- to four-bedroom layouts and elevator lobby arrangement; no current unit price or completion promise |
| [La Clara contractor record](https://www.jm-a.com/portfolio/la-clara/) | Completed-building comparison; resale inventory still requires confirmation |
| [OLIN developer portfolio](https://www.okogroup.com/portfolio/olin) | Pre-construction sales, 32 residences, OMA/GACHOT and ocean-to-lagoon setting |
| [Town of Palm Beach March 25, 2026 agenda, item 5](https://palmbeachfl.api.civicclerk.com/v1/Meetings/GetMeetingFileStream(fileId=15075,plainText=false)) | Five-story / 12-unit 3031 S. Ocean redevelopment application; not proof of current sales or all final approvals |

Nora area figures, Berkeley historical floor/schedule descriptions, differing South Flagler House totals and Forté's stale construction language were not silently normalized. Unneeded disputed figures are omitted; global project facts remain unchanged. Alba stays held, with existing PDFs intact and no new HTML publication.

## Architecture and protections

`src/lib/corridorGrowthContent.ts` owns copy, sources, exact path lookup, six allowed request contexts and matching CollectionPage/BreadcrumbList/ItemList schema. `src/corridorGrowth.ts` installs once in the existing bootstrap and idempotently enhances only the three active target routes. Existing organization, advisor, person and website identities remain; the page graph does not fabricate authorship, offers, ratings or FAQs.

The single `src/lib/inquiryContext.ts` bridge adds `corridor:<key>:<availability|pricing-packet>`. The existing lead store continues to own first touch. Explicit requests replace stale request metadata while preserving manual building selections. Corridor/product context reaches the actual submission payload. Existing commercial and Olara request meanings remain intact.

`package.json` and its postbuild order stay unchanged; the commercial adapter composes the corridor prerender pass before the existing floor-plan pass. Only the three existing corridor sitemap entries receive the content-review date. Corridor CSS is a separate dynamic dependency; static HTML links its exact stylesheet via the private Vite manifest. This preserves no-JavaScript rendering without raising the shared CSS budget. [Vite manifest guidance](https://vite.dev/guide/backend-integration.html).

CI verifies unchanged production surfaces: core `src/main.ts`; analytics, consent and sanitizer; lead-capture store; commercial content/runtime/styles; floor-plan definitions; generated/public/project data and PDFs; functions; package/lockfile; production deployment workflow. North Flagler and unrelated pages are not rewritten.

## Historical verification ledger — superseded by the current candidate above

**Tested implementation: `1e9d469907553f28a7abed286784007cd925f6a0`.**
[Historical no-deploy run 34145165695](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34145165695): keyed job `101815507868` SUCCESS; no-key job `101815508191` SUCCESS; aggregate **Corridor batch review verification** `101816509300` SUCCESS.

| Check | Result |
|---|---|
| `npm run typecheck`, `npm run build`, complete `npm test` | PASS in both modes; existing SEO/GEO/privacy/forms/performance/gatekeeper checks retained |
| Added corridor unit contracts | 7/7 PASS, including exact identities/context allowlist, source treatment, schema, prerender idempotence and regional-label/link preservation |
| Standard and strict asset audits | PASS in both modes; 0 blockers; 81 existing advisories |
| Added static corridor checks | 3/3 PASS; clean canonical/sitemap/schema and working internal/asset references |
| Added corridor browser matrix | 12/12 PASS per mode: 3 pages × desktop/mobile × JavaScript on/off |
| Added actual intercepted inquiry submissions | 18/18 PASS per mode, including all 6 corridor products and switches to/from Olara and commercial requests |
| Existing commercial/floor-plan/integration browser suites | PASS; 12 prepared configurations and 24 intercepted POSTs per mode |
| Keyed deployment preflight | PASS on actual key-configured build |
| Actual Google Maps | 4/4 PASS: home and map at desktop/mobile; real loader, tile imagery and zoom; fallback not accepted |
| Credential-free deployment preflight | Expected missing-loader rejection explicitly asserted; PASS |
| Source/artifact credential-pattern scans | PASS; no key-bearing compiled bundles or raw contact submissions archived |

Both historical artifacts were downloaded and their SHA-256 digests verified in the earlier implementation review:
- [Keyed artifact 10027482355](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34145165695/artifacts/10027482355): `1f133057fc4ce5f506ef6bada5ccf8f00fe1be310c499130ad007b96af78dadf`.
- [No-key artifact 10027463491](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34145165695/artifacts/10027463491): `57a72afd44bf09048c3936af77e999ae3150c771e6ae39d1433533f58c8a8ae1`.

Final desktop/mobile screenshots were visually inspected. Earlier review exposed a shared CSS-budget limit, metadata-readiness race, header overlap, narrow inherited headings and pale no-JavaScript update links. These were corrected without raising budgets or disabling assertions. The final reporting-label correction also passed the complete rerun. Prior all-green implementation `b9048a69c27d83b397e3ad9e377823b1733c7498`, run 34144222812, remains historical evidence; the final screenshots and results above supersede it.

All lead POSTs and third-party analytics in client-journey tests are intercepted. A browser-only challenge fixture does not prove server CAPTCHA validation or CRM delivery. No-JavaScript checks cover research/navigation, not form submission. Existing consent/local-event/PII checks pass, but actual GA4 transport is not represented as verified: that diagnosis is parked. Review Maps credentials are BUILD-only; production credentials/restrictions are unchanged.

This documentation-only closeout is not a new application implementation; its precise diff and any current-head rerun are recorded in PR #76. No test pass constitutes publication approval.

## Parallel authorship audit

Current production `src/lib/contact.ts` already defines Brooke Snader / Brooke Matthew Snader, Broker Associate, The Scott Gordon Group and Douglas Elliman. Team image metadata names Scott Gordon, Mindy Gordon and Brooke but does not establish article-level authorship. `src/main.ts` creates Brooke's Person entity and broadly assigns it to article/news author and guide reviewer schema. `MarketNote` has dates and source links but no explicit per-article author/reviewer fields. Visible article/update metadata strips lack an explicit real-person byline matching each responsibility.

The separately planned model is approved real-person records, explicit `authorId`, optional `reviewerId`, verified review dates and visible profile links matching schema. Reuse Brooke's legitimate identity after editorial confirmation. Assign Scott Gordon or another actual team member only where responsibility is confirmed—not merely because of team membership. No fictional Review Desk or blanket retroactive review. This corridor PR preserves existing identities and About links; it does not mix a new profile implementation into Batch 1.

## Remaining decisions

Brooke reviews the three pages' copy, source treatment, project shortlists, mobile/desktop presentation and two request products. PR #76 remains draft; nothing is approved, deployed or measured. A later approved release requires current checks and ordinary live route/inquiry verification. Comparison pages, verified plan expansion, real-person profiles and additional lead products remain separate batches from then-current main; the complete tracker retains them. No new Phase 2 batch was started during this closeout.
