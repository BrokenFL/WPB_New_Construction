# P2-001: pilot implementation and review-gap closure

Updated: 2026-09-05
Repository: `BrokenFL/WPB_New_Construction`
Working branch: `astra-phase-2-growth`
Draft review: https://github.com/BrokenFL/WPB_New_Construction/pull/72
Original reviewed HEAD: `44c79d24dfc124dc6c4571adf68318bf85d9b429`
Read-only production baseline: `fb7bf0e9b93a4c4710423dcd900d3e9d185e7605`

**Exact tested implementation SHA: `e2d022ef21bcb5c019e0c5356794fc16963eb1a7`.**
This document is a documentation-only follow-up to that tested code. Do not confuse the subsequent documentation commit with the implementation SHA embedded in the evidence.

**Status: review fixes implemented; merge and deployment remain blocked.** Actual key-configured Maps verification has not run because the dedicated review key is absent. Alba current-drawing confirmation and Brooke's approval also remain open. No additional Phase 2 batch is authorized by this pass.

## Preserved pilot and boundaries

The review branch still contains only the original two individual-plan HTML pilots:

- `/floorplans/olara/residence-d/`
- `/floorplans/alba-palm-beach/residence-d/`

Approved PDFs/previews, approved plan facts, existing PDF URLs, canonical plan identities, source-of-truth data, the lead endpoint, consent adapter, analytics allowlist, lockfile, production deployment workflow and `src/main.ts` remain unchanged in this review-gap pass. No production branch write, merge, deployment, real lead, production analytics event or production key-restriction change was performed.

Publication remains a review decision, not a consequence of passing local tests. Both pilot implementations are preserved on the branch; there is not yet an Olara-only publication switch. Do not merge this two-page build while Alba's publication gate remains open.

## 1. Production deployment guard: reproduced and corrected

The original guard in `research/scripts/deploy-cloudflare-pages-with-retry.mjs` inspected only the `index-*.js` entry. At original SHA `44c79d2`, a real Vite build with a clearly synthetic nonempty Maps configuration placed the loader in reachable dynamic chunk `assets/main-DehAGrkM.js`, not the entry. The original guard failed despite the loader being reachable.

Reproduction run: https://github.com/BrokenFL/WPB_New_Construction/actions/runs/33980469689
The diagnostic checked out the exact original reviewed SHA. Its synthetic key established build-layout behavior only, never working Google Maps. The temporary reproduction workflow was removed after collecting evidence.

The production script now imports `verifyProductionMapBundle()` from `research/scripts/production-map-preflight.mjs`. It starts from the actual HTML-loaded manifest entry and recursively follows Vite `imports` and `dynamicImports`. Unreachable manifest entries and stray/stale files cannot satisfy the guard. Missing dependencies/files, malformed manifests, stale HTML-entry mismatches, unsafe paths and missing reachable loaders fail closed. Cyclic dependencies terminate safely.

Vite produces its real manifest during the build, then a build-only hook moves it to `.runtime/build/manifest.json`, outside public `dist/`. The hook clears stale metadata before building. Public copy/privacy checks are not relaxed. The manifest lifecycle is scoped to builds so development-server startup/shutdown does not consume or delete production metadata.

Read-only command, after a build:

```sh
npm run qa:deploy-preflight
```

This command does not build, spawn Wrangler, fetch a remote endpoint or upload anything. The production deployment path still invokes the same guard before diagnostics/upload, including when normal build/QA checks are skipped by the existing production workflow.

Regression coverage: 11 tests covering split/nested imports, single bundles, unrelated Maps files, missing loader/dependency/file, cycles, stale entry, malformed paths/lists/manifest, read-only CLI and private metadata. The final actual no-key build was correctly rejected. The final synthetic-config split build passed with the loader found only in `assets/main-CEoKhXKu.js` among 15 reachable chunks. Neither result is proof of a valid key or working map tiles.

## 2. Key-configured Maps verification: exact blocker and required action

`.github/workflows/phase-2-qa.yml` now contains a separate **Restricted-key Maps verification (no deploy)** job. It has read-only repository permissions and receives no Cloudflare/deployment credentials. Only its BUILD step receives the dedicated Maps key. No key-bearing bundle is included in its artifacts.

The job runs the standalone preflight, the full existing test suite, and `npm run qa:maps-keyed`. The dedicated browser check requires a real Google loader response, loaded Google map tile imagery, ready state without Google API errors, and an exercised zoom control on both `/` and `/map/`. Google Maps responses are not mocked; fallback rendering cannot pass this check. Error evidence omits request URLs/keys. Existing mandatory map QA retains its requirement; only a fixed review port and safer error reporting were added.

Final code run `33982094565`, job `101349013576`, failed BEFORE checkout/build with:

```text
Missing repository Actions secret P2_REVIEW_GOOGLE_MAPS_API_KEY.
HAS_REVIEW_KEY: false
RESTRICTIONS_CONFIRMED: false
```

**Brooke must complete these settings before this gate can close:**

1. In Google Cloud, create a separate review API key in a billing-enabled project with Maps JavaScript API enabled. Restrict the key to **Maps JavaScript API** and Website/HTTP-referrer **`http://127.0.0.1:4173/*`**. Leave production-key restrictions unchanged. Do not paste the key into chat or commit it.
2. In this GitHub repository, **Settings → Secrets and variables → Actions → Secrets**, add `P2_REVIEW_GOOGLE_MAPS_API_KEY` with that dedicated key.
3. After reviewing those restrictions, under **Actions → Variables**, set `P2_REVIEW_MAPS_KEY_RESTRICTIONS_CONFIRMED` to `true`. This is an explicit human restriction-review attestation, not an automated inspection of Cloud settings.
4. Re-run the **Restricted-key Maps verification (no deploy)** job for the latest reviewed code. Resolve any real API/billing/referrer/tile failure without relaxing the production key. Keep PR #72 draft until the actual map evidence passes.

The credential-free full `npm test` was also executed on both baseline and candidate. Both stop at the mandatory map checks because Google Maps was not requested by their no-key bundles. No fallback test is substituted, no failure is suppressed, and the overall workflow is NOT green.

## 3. Source review: asset consistency proved, Alba freshness still unresolved

Current read-only official retrieval succeeded for five resources on 2026-09-05:

- https://www.albapalmbeach.com/residences/
- https://www.albapalmbeach.com/downloads/
- https://www.albapalmbeach.com/wp-content/uploads/Alba-Floorplans-D_Unbranded.pdf
- https://www.olarawestpalmbeach.com/floorplans
- https://d3af2gfyi5943v.cloudfront.net/app/layout-pdfs/Olara_Floorplans_Digital_31126_D.pdf

Official-site searches and the fetched Alba residences/downloads pages did not establish a newer Residence D drawing. HTTP retrieval dates, file modification dates and PDF filenames are not treated as drawing revisions or evidence of current availability.

Both freshly retrieved official PDFs are byte-for-byte identical to their existing approved downloadable assets:

| Plan | Official and approved PDF SHA-256 |
|---|---|
| Alba Residence D | `0f6cf9771eaaf8a8231056c70fffac8c6e628f121806815f30db82c22afb8c38` |
| Olara Residence D | `bdafa9399566df69f665551ecd332cdbb8b34923db310c1c07b5a000d9d8deae` |

The downloaded PDFs were rendered locally and visually compared with the approved previews. Alba's preview matches the drawing on PDF page 2; its cover/disclaimer page 1 visibly carries **REV. 8/2022**. The web PDF screenshot service failed with a cache miss; locally rendering the successfully retrieved original PDF closed the previous visual-inspection gap without OCR. The source/preview numbers also agree with the page facts:

| Plan | Beds / baths | Drawing floors | Interior | Exterior | Reported total |
|---|---|---|---:|---:|---:|
| Olara D | 2 + den / 2 + powder room | 7–26 | 1,774 | 381 | 2,155 |
| Alba D | 3 / 3 | 7–18 | 1,786 | 578 | 2,374 |

Areas are square feet. Alba's components sum to **2,364**, not its reported **2,374**. The 10-square-foot discrepancy and August 2022 revision remain plainly disclosed. No total, source date, asset or fact was silently corrected.

**Recommendation requiring Brooke's decision:** keep Alba's new HTML entity unpublished until the developer confirms the current drawing/area schedule, and submit the source-verified Olara pilot for publication review after the Maps gate passes. Preserve all existing PDFs. The branch intentionally retains both pilot implementations; this recommendation does not claim that Alba has already been selectively removed from the build or that either page is approved to deploy.

## 4. Mobile CTA and actual inquiry payload

Added a prominent, normal-flow **Request current availability** button immediately after introductory copy, before the drawing. It is full-width on mobile; no sticky overlay obscures the plan. The existing facts-panel CTA remains.

The old storage-only test missed a real bug: the legacy inquiry page reset the hidden origin context to `contact_page`, and the submit handler overwrote the saved plan origin. The additive `src/lib/floorplanInquiry.ts` bridge restores only validated pilot context before submission, prefills the building, preserves explicit query/manual building selections and leaves the endpoint, validation and production Turnstile behavior unchanged. `src/main.ts` was not rewritten.

Final browser tests use the actual inquiry UI, browser validation and submit handler, intercepting the resulting JSON POST to `/api/leads`. Test-only contact values and a test-only hidden Turnstile token never reach the real endpoint. Eight submissions pass: two plans × desktop/mobile × intro/facts CTAs.

Verified payload fields include `project`, `cta_context`, `lead_capture_context`, `landing_page`, `submission_page` and `cta_location`. Example non-PII context: `floorplan:olara:residence-d`. The inquiry URL remains clean `/inquire/`. Both local analytics events and the GA4 data layer exclude synthetic name, email, phone, message and token. No raw test contact payload is saved in evidence.

## 5. Final tested results and evidence

Implementation SHA: `e2d022ef21bcb5c019e0c5356794fc16963eb1a7`
Run: https://github.com/BrokenFL/WPB_New_Construction/actions/runs/33982094565
Candidate job: `101349013735`; baseline job: `101349013681`; keyed Maps job: `101349013576`.

| Check | Result on tested implementation |
|---|---|
| Full repository typecheck | PASS |
| Production build / 99 existing + 2 pilot prerenders | PASS |
| Preflight regressions | 11/11 PASS |
| Floor-plan regressions | 15/15 PASS |
| Existing building / article unit tests | 6/6 and 15/15 PASS |
| Existing launch checks before Maps | PASS, including SEO, GEO, links, public copy, analytics, forms, performance and homepage visuals |
| Independent untracked-assets / gatekeeper | PASS; gatekeeper scanned 1,111 built files |
| Strict asset audit | PASS: 0 blockers, 0 broken references, 0 local-path leaks; 81 existing advisories |
| Floor-plan static/browser verification | PASS: 8 desktop/mobile JavaScript-on/off views |
| Actual intercepted inquiry submissions | 8/8 PASS; building + plan context and analytics PII exclusion verified |
| Actual no-key build preflight | Correctly REJECTED; negative-case verification PASS |
| Synthetic-config split build preflight | PASS; no upload/deployment, no working-key claim |
| Restricted-key Maps check | BLOCKED before build: dedicated review key absent |
| Full npm test / overall workflow | FAIL at mandatory no-key Maps check; not waived |

Final artifact: https://github.com/BrokenFL/WPB_New_Construction/actions/runs/33982094565/artifacts/9974069600
Artifact ZIP SHA-256: `898322df3cad2289e0ade72366c2cc50d1af036d8200fcfdf8daaa5310af2fb0`.
The downloaded `tested-sha.txt` matches the implementation SHA. Evidence includes eight screenshots, safe submission/view results, strict audit, split-preflight output and current public source retrievals. No built credential-bearing bundle or deployment credentials are archived.

Final desktop/mobile screenshots for both plans were inspected; the intro CTA precedes the loaded drawing without overlap, controls and facts are readable, and Alba's clarification is visible. JavaScript-on/off screenshot pairs are identical in this capture. This is implementation visual review, not Brooke approval.

The existing four high-severity dependency findings and asset advisories remain the separate maintenance backlog. No dependency upgrades were attempted. Vite's 500 kB advisory remains; the actual repository performance budget passes.

## Changed files in this review-gap pass

Build/preflight: `vite.config.ts`, `package.json`, `research/scripts/deploy-cloudflare-pages-with-retry.mjs`, `research/scripts/production-map-preflight.mjs`, `research/scripts/production-map-preflight.test.mjs`.

Maps/source QA: `.github/workflows/phase-2-qa.yml`, `research/scripts/check-map-functionality.mjs`, `research/scripts/check-maps-keyed.mjs`, `research/scripts/review-floorplan-sources.mjs`.

Pilot conversion: `src/bootstrap.ts`, `src/lib/floorplanInquiry.ts`, `src/lib/floorplanEntities.ts`, `src/floorplanPage.ts`, `src/floorplanEntities.css`, `research/scripts/floorplan-entities.test.mjs`, `research/scripts/check-floorplan-entities.mjs`, and this progress document. The temporary reproduction workflow is removed. Only intended files were written through explicit branch-scoped GitHub operations; the local analysis workspace is not represented as a full clean Git checkout.

## Earlier pilot history and release gate

Earlier runs `33972615177`, `33973173581` and `33973550055` established the pilot, corrected duplicate schema and source-link-policy issues, and recorded 14 original plan regressions. That verification was insufficient for the split production guard and real submission context; this review pass addresses those omissions.

The earlier Search Console window (2026-08-06–2026-09-02) showed Olara D's legacy PDF at 0 clicks / 2 impressions. It justified preserving the URL, not a demand/uplift claim. No new SEO prioritization or content batch was started.

Outstanding release requirements: dedicated-key map verification; Alba source confirmation or an explicitly approved Olara-only publication scope; Brooke's first-batch approval. Keep PR #72 in draft. Do not merge, deploy, change main, expand plan coverage or start P2-002 under this request.
