# Phase 2 combined release candidate

Review branch: `astra-p2-integrated-release` · Draft PR #74.
Inputs: PR #72 at `183320c452e95565c2928bb5d0d9d9f0620eebfb`; PR #73 at `95cdd3fda76b595b6449331a7a94c6bf3aa89dfa`.
Read-only main: `fb7bf0e9b93a4c4710423dcd900d3e9d185e7605`.

## Integration, not another growth batch

The candidate retains both source histories and leaves their refs unchanged. The integration commit has PR #73 as an additional parent and PR #72 in its first-parent ancestry. No force push, main write, production deployment or auto-merge was performed. The two original PRs remain reviewable, unmerged drafts; PR #74 is the single combined release-review target.

## Reconciled implementation

- `index.html` uses the floor-plan-aware `src/bootstrap.ts`. Published Olara routes mount the plan page without the legacy app. Existing routes start the legacy app once, install the shared inquiry bridge and then attach commercial enhancements. No second tag loader or app startup.
- Postbuild composes the existing static routes, the Homepage/Buildings copy, and finally Olara entity/discovery generation. The existing Vite manifest lifecycle and reachable-dependency production guard remain authoritative. Redundant commercial entry/preflight and branch-specific QA workflows are not used by this candidate.
- Buildings filters/listings precede the educational guidance in DOM and visible layout. The guidance remains below the directory, with its existing expandable details. Static no-JavaScript output follows the same listing-first order.
- `src/lib/inquiryContext.ts` is the single allowlisted form owner for both prepared request families. A new commercial request clears stale plan building/corridor/CTA metadata; a new floor-plan request replaces packet defaults with the plan's current-availability context. First-touch landing/referrer/campaign data is retained. Manual building and inquiry-type edits are respected.
- The bridge applies immediately rather than waiting for optional module loading. A dedicated unit regression exercises immediate initialization, commercial/plan transitions and manual selections.
- Existing PDF bytes and URLs, approved public assets/source data, `src/main.ts`, the lead endpoint, analytics adapter/sanitizer, lockfile and production deployment workflow remain unchanged against main. CI checks those protected paths and both input ancestries.
- Only Olara Residence D is emitted as a new HTML entity. Alba's implementation/source-review snapshot is preserved, but its HTML, sitemap entry, discovery links and public entity lookup remain excluded. Developer clarification is still required before its future publication.

## Test interpretation

Credential-free verification is a full combined suite under explicit `WPB_MAP_QA_MODE=no-key`, followed by both prepared browser suites and the new combined journeys. It requires clean fallback behavior with zero Maps requests and explicitly asserts missing-key preflight rejection. A synthetic nonsecret build proves reachable loader inclusion only. It does not prove a working API key or live map.

The separate required keyed job receives the dedicated review key ONLY during BUILD. It requires the full combined suite, shared production preflight, both browser suites, combined request journeys and a separate unmocked Google loader/tile/zoom check on `/` and `/map/`. The aggregate Integrated release verification requires both jobs to succeed. Bash pipefail is explicit, and failures are not blanket-ignored. No built credential-bearing bundles or production credentials are in artifacts.

Combined browser journeys keep the same session and attribution storage across floor-plan -> commercial availability -> pricing packet -> floor-plan -> commercial packet -> availability. Actual form UI and submit handlers are exercised; JSON POSTs are intercepted. No real leads or marketing emails are sent. Synthetic contact fields/tokens are asserted absent from analytics and are not saved in report payloads.

Metadata/schema/sitemap and desktop/mobile checks cover native plan navigation, modified middle-click in a new tab, back navigation, first-visit consent, denied consent across navigation, and granted consent with one tag/configuration and one local/GA4 page view per tested route transition. JavaScript-disabled journeys verify navigable HTML through the inquiry page, not a no-JavaScript form submission capability.

## Verification history

Initial integrated SHA `62e92056e5178d466fad87c0296a93ceab5d04c1`, run 33990921804: typecheck/build/full credential-free suite and preflight passed, but browser assertions exposed delayed initial form defaults. The combined test also watched an unrelated `.form-status`, causing a timeout after its intercepted POST. The runtime initialization was corrected, direct regression coverage added, and the selector scoped to `.inquiry-form .form-status`. No existing form assertion or release requirement was removed.

Follow-up SHA `12a58e26155e6a06eb40b3fbff2dc1fc62c7295d`, run 33991231793: both prepared browser suites passed. The combined test then stopped on mobile because the desktop primary-navigation link is hidden on the existing inquiry page. The test was corrected to follow the visible brand/home link and then Buildings, preserving the session and every attribution/consent assertion. No navigation feature or production UI change was added for this test correction.

Pre-final SHA `b626d12b51ace4b72b1092fb520945f901a9303a`, run 33991514626: the entire combined credential-free job passed (60 unit regressions, both original browser suites, all 12 same-session combined submissions, consent/tag/event checks, native/mobile/no-JavaScript navigation, strict asset audit and both preflight cases). Artifact 9976811199 was downloaded and its SHA-256 verified as `ac16593f32cb2caab55a36b64b0324a5edadc40c6d532d646528d03d0b7c8a09`.

Manual screenshot review then caught a visibility defect outside the older contrast assertions: native project-heading links inherited pale text on the two no-JavaScript commercial pages. SHA `4c8dfbfa338fb5083797f8d8ad6a8fad55c9a61e` adds narrowly scoped static-page link styling and computed native-link contrast checks. The normal hydrated design, source content, URLs and release gate remain unchanged. Final evidence must come from this follow-up or a later fully tested revision, not the earlier passing artifact.

## Final tested implementation and evidence

**Exact tested implementation SHA: `4c8dfbfa338fb5083797f8d8ad6a8fad55c9a61e`.**
This progress note and reconciled tracker are a documentation-only follow-up. Their later commit is not substituted for the implementation SHA in the evidence.

Run: https://github.com/BrokenFL/WPB_New_Construction/actions/runs/33991911537
Credential-free job `101375534721`: **SUCCESS**. Required keyed job `101375534929`: blocked before checkout/build. Aggregate `101376009836`: blocked, as intended until both modes succeed.

| Check on exact implementation | Result |
|---|---|
| Both input ancestries and protected-surface diff | PASS; original histories retained, approved PDFs/public assets and endpoint/analytics/lockfile/deploy workflow unchanged |
| Full repository typecheck and production build | PASS; 99 existing routes plus 1 published Olara HTML entity |
| Full combined npm test, explicit no-key mode | PASS; all existing launch, copy, SEO/GEO, links, privacy/analytics, form, performance and gatekeeper checks retained |
| Unit regressions | 60/60 PASS: integration/mode 6, shared preflight 11, floor-plan 16, commercial 6, building 6, article 15 |
| Prepared floor-plan browser suite | 4/4 desktop/mobile JS-on/off views and 4/4 intercepted submissions PASS |
| Prepared commercial browser suite | 8/8 desktop/mobile JS-on/off views and 8/8 intercepted submissions PASS |
| Combined same-session request switching | 12/12 intercepted submissions PASS; two complete six-request sequences at 1440px and 390px |
| Full Home → Buildings → Olara → plan → inquiry journeys | PASS desktop/mobile, including native and modified plan links, browser back navigation, canonicals, one schema graph and H1 |
| No-JavaScript native navigation | PASS desktop/mobile through inquiry landing; no claim of no-JavaScript form submission |
| Consent/tag/event checks | PASS: zero analytics requests when denied; one tag/configuration and one local/GA4 page view per tested transition after consent; contact details/tokens excluded |
| Buildings order and native-link visibility | PASS: filters/listings precede guide; 24 directory and 16 homepage native heading links tested at both widths, minimum contrast 12.39:1 |
| Olara discovery/sitemap and Alba exclusion | PASS: Olara once in sitemap and discoverable; Alba HTML/sitemap/discovery/public lookup excluded; all existing PDFs preserved |
| Strict asset audit | PASS: 0 blockers/strict blockers; 81 existing advisories |
| Actual no-key shared preflight | Correctly REJECTED; expected negative assertion PASS |
| Synthetic configured shared preflight | PASS; 16 reachable chunks, Maps loader only in reachable `assets/main-DM_Klw1G.js`; not working-key evidence |
| Required real Maps suite / aggregate release gate | BLOCKED, not passed or waived |

There are **24 intercepted POSTs total** across the two prepared suites and combined journeys. None reached the real lead endpoint. New request metadata replaces stale plan/commercial defaults while first-touch landing attribution survives; explicit manual selections are preserved. No raw contact payload is archived.

Final artifact: https://github.com/BrokenFL/WPB_New_Construction/actions/runs/33991911537/artifacts/9976928496
Artifact ZIP SHA-256: `cfa5b7e51c5b98ae6849fec233ba52ef60d1abf3af4fa9864923de55eb6cf0e7`.
Downloaded `p2-integration/tested-sha.txt` matches the exact SHA above. The ZIP contains real page screenshots, safe journey/contrast results, the full suite log, asset audit and preflight output. It does not contain a key-bearing build, deployment credentials, HAR files or raw contact submissions.

## Final visual review

Inspected final desktop/mobile Homepage, listing-first Buildings, Olara plan, no-JavaScript commercial pages, expanded guide below listings and the original first-visit consent UI. The narrow native-link correction is visible and readable; the normal hydrated presentation is preserved. Guide controls and plan CTA do not overlay the plan. Clean commercial captures follow the real No thanks control; the consent banner was not removed. The pre-existing mobile contact bar remains unchanged. Contrast assertions cover the specified new/native links and guide headings, not a full-site accessibility certification.

The downloadable preview sheets are crops/compositions of those actual screenshots, labeled with the tested SHA and credential-free/non-deployed state. They are not generated architectural images or a live preview deployment.

## Remaining release requirements

**K1 — account configuration:** the required job could not build because `P2_REVIEW_GOOGLE_MAPS_API_KEY` is absent; the restriction-review variable is not confirmed. In repository Settings → Secrets and variables → Actions, add the dedicated review secret and, after verifying its restrictions, set `P2_REVIEW_MAPS_KEY_RESTRICTIONS_CONFIRMED=true`. Use a separate billing/API-enabled key restricted to Maps JavaScript API and HTTP referrer `http://127.0.0.1:4173/*`. Do not put the key in chat/commits or reuse/relax production credentials. Re-run the combined keyed full suite, preflight, unmocked real Maps `/` and `/map/` checks, and aggregate gate on the reviewed candidate.

**Approval:** Brooke must approve the combined presentation and inquiry flows, then explicitly authorize release. Until then keep PR #74 draft. Alba clarification is a future publication condition, not a blocker to this Olara-only candidate.

The prior shared-entry compatibility gap is now implemented and tested in the combined candidate; separately merging PR #72 and #73 is not the proposed release path. Their branches remain unchanged. Nothing is approved, deployed or measured, and no next feature batch was added. The reconciled delivery tracker retains every remaining handoff task with independent blockers/next actions.
