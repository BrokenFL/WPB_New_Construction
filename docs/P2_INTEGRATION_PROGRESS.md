# Phase 2 integrated release and GA4 corrective verification

Updated: 2026-09-06 UTC. Repository: `BrokenFL/WPB_New_Construction`.

## Current decision: acceptance OPEN; PR #75 remains draft

Brooke reports that Enhanced Measurement Page views remains enabled and its advanced **Page changes based on browser history events** option is OFF for `G-0LGBH6MDVX`. That report is acknowledged. It does not yet match the effective Google tag behavior received by the verification runners.

Both full candidate modes were rerun twice after that report. Both runs still fail the added real-Google-tag navigation/privacy regression. No runtime change, corrective merge, production deployment, automatic merge, real lead or new Phase 2 feature batch was performed during this continuation. The successful legacy checks do not override the failed network gate.

| Identity | Exact value |
|---|---|
| Corrective PR / branch | [PR #75](https://github.com/BrokenFL/WPB_New_Construction/pull/75) / `fix/ga4-command-queue` |
| Exact candidate tested in both resumed attempts | `a8af3e67e54bfcaba75a08c4a7b8074c19b96a21` |
| Original runtime wrapper correction | `69c4eb2921829081acc47053d890fb6c18e8748d` |
| Main, verified unchanged before documentation closeout | `dd28320f689a3f377b6137671e702b6c58778b67` |
| Current deployed application, original PR #74 | `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7` |
| Corrective merge / deployment / live acceptance | None / not initiated / not performed because the release gate fails |

This document and the delivery tracker are a documentation-only successor to the tested SHA. A documentation commit is not substituted for the exact tested candidate, nor does it satisfy the failing gate. Before any future merge, obtain successful required checks on the then-current release head.

## Root cause and preserved correction

The previous wrapper queued a rest-parameter Array. PR #75 replaces that one assignment with a normal TypeScript function pushing its native `arguments` object, following [Google's documented command queue](https://developers.google.com/tag-platform/devguides/datalayer). The existing `unknown[]` callable signature and void result remain; an existing wrapper and data layer are retained.

Only that runtime assignment changed. The consent gate, advertising-consent denial, payload sanitizer, query-free page/referrer helpers, first-touch and inquiry attribution, loader/config ownership, main/bootstrap, project content, approved assets/PDFs, public/private boundaries, lead endpoint, package/lockfile and production deployment workflow remain unchanged. Tests compile and execute the actual source assignment and reject the former Array representation.

The second failure is independent: the real Google tag produces an additional history-driven page view beyond the application's manual calls. The request includes synthetic private initial-query markers in `dr` (page referrer), bypassing the application's sanitized manual event payload. The test blocks that request before transmission. Fixing command delivery without eliminating this behavior would violate the release requirements.

## Resumed full verification

[Required run 34053296879](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879), same exact candidate SHA above:

| Attempt after account-change report | No-key job | Keyed job | Aggregate gate | Result |
|---|---|---|---|---|
| Attempt 2 | `101547054328` | `101547054455` | `101547657692` | Both modes and aggregate FAILED at real-tag privacy regression |
| Attempt 3, fresh full retry | `101548061690` | `101548061531` | `101548765624` | Same failure; all other required checks passed |

| Check | Result and scope |
|---|---|
| `npm run typecheck`, `npm run build`, complete `npm test` | PASS in both modes in both resumed attempts; 60 existing unit regressions, launch/copy/SEO/GEO/link/privacy/forms/performance/gatekeeper retained |
| Actual TypeScript command-queue regression | PASS; native Arguments for consent/js/config/event cases; existing queue/function retained |
| `npm run assets:audit` and strict asset audit | PASS; existing advisories retained, not represented as a clean dependency audit |
| Prepared floor-plan and commercial browser suites | PASS; 12 desktop/mobile, JavaScript-on/off page configurations per mode |
| Prepared plus combined inquiry journeys | PASS; 24 intercepted POSTs per mode; same-session plan/commercial intent replacement and first-touch attribution preserved |
| Keyed shared deployment preflight and real Maps | PASS; actual Google loader, loaded tiles and zoom at desktop/mobile on `/` and `/map/`, 4/4; fallback not accepted |
| No-key preflight | Correctly rejects a no-key build; explicit negative assertion PASS |
| Fresh unset consent and rejection | PASS in real-tag regression at 1440px and 390px; zero tag loads/collection requests; rejection persists across tested navigation |
| Initial consented actual-tag page view | PASS in candidate; one primary tag, one manual command, correct ID and clean location/referrer; collector intercepted |
| Advertising consent | PASS; analytics storage granted only after consent; ad storage, ad user data and ad personalization denied |
| Real-tag Home to Buildings navigation | FAIL at both widths: two clean manual page views plus an additional unsafe automatic page-view attempt with private test markers in `dr` |
| New real-tag commercial/floor-plan conversion sequence | NOT REACHED after earlier navigation/privacy failure; older passing inquiry tests are not a substitute |
| Actual production collection for correction | NOT RUN; correction not deployed |

Candidate collection is always intercepted. The reported candidate HTTP 204 is a test response, not proof of receipt by Google. The eventual `--live` test requires successful responses from Google's collector for validated production page views; no claim is made from merely loading gtag.js. Client `ERR_ABORTED` after an empty 204 is retained separately from receipt status; missing receipt, duplicate or privacy failures are not ignored.

Desktop/mobile screenshots from the resumed candidate were inspected. Homepage actions, listing-first Buildings and the Olara introductory CTA/drawing remain intact. No visual correction was necessary or made.

## Effective configuration evidence, not an assumption about the saved UI

A separate [read-only public-tag diagnosis](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34055994842) fetched the actual `G-0LGBH6MDVX` Google tag normally and with a diagnostic cache-busting query. It made zero collection requests and did not alter candidate code or account settings.

At **19:47:46–47 UTC**, both responses reported `vtp_enableHistoryEvents: true` and `vtp_historyEvents: true`. At **19:53:39 UTC**, a second fresh pair still reported both true. `vtp_enablePageView: true` also remained, consistent with retaining Page views. These internal flags are diagnostic observations, not a supported configuration API.

The second pair had identical SHA-256 `0120fe9ffddd733f2a6a0860cd10159e556d0d22c06401141a0dfa72794c40a2`; the earlier pair was `bfa80b8f772d57367b7835fb119fc3026b969d68527b76958eb4f849381ebc37`. Responses carried `Cache-Control: private, max-age=900`; this does not establish how long account changes take to propagate. Fresh downloads and repeated browser results establish that the effective history behavior remained active during testing, not why the saved UI and served tag differ.

Google's [manual page-view guidance](https://developers.google.com/analytics/devguides/collection/ga4/views#disable_page_changes_based_on_browser_history_events) explains that `send_page_view: false` does not suppress Enhanced Measurement history events. Google also documents a separate tag-level [Manage automatic event detection](https://support.google.com/analytics/answer/12131703?hl=en) control for **Page views on browser history change**.

**Next account check:** open the same `G-0LGBH6MDVX` stream, then Google tag → Configure tag settings → Show all → Manage automatic event detection. Ensure **Page views on browser history change** is OFF and save. Leave Page views enabled and the already-disabled Enhanced Measurement history option OFF. Reopen the stream to confirm its ID and persisted settings. If both already show OFF, capture those saved settings for diagnosis rather than repeatedly toggling them or assuming the UI is wrong. No available connected action could read/write these account settings; public tag inspection cannot prove their saved UI state.

The code must not work around this by concealing, dropping or tolerating failed duplicate/PII assertions. No unsupported runtime history-suppression parameter was added.

## Evidence ledger

All artifacts below are safe summaries/screenshots, not deployed previews, key-bearing builds, HARs, client IDs or raw contact payloads.

| Evidence | Artifact / digest |
|---|---|
| Final resumed attempt 3 keyed | [9996057597](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879/artifacts/9996057597); SHA-256 `ec7c5d937e1ee1327b9fa3d7687ff20fd8787c5365e429b64ddd77893f18bc22` |
| Final resumed attempt 3 no-key | [9996055585](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879/artifacts/9996055585); reported SHA-256 `b58f0d1049b40ddb2489e835d6f76b9aecd750d5ca1b68858cfd1868f44634c0` |
| First resumed attempt 2 no-key | [9995935132](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879/artifacts/9995935132); SHA-256 `d2b0d794bb83908b49081a827198fd267620702b57c419536bd06f6d95d1e2db` |
| Attempt 2 job-log/source audit | [9995943612](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34055797508/artifacts/9995943612); SHA-256 `bb9994ea18a57a6c397fbb93c70a678f2413a2d904f3f94fd1deabd07f9e6ff7` |
| Fresh public tag configuration, second check | [9996051612](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34055994842/artifacts/9996051612); SHA-256 `39341329bd2c19ed3f4f107bdffe2d0e40f37f975889a33111b36ec1ed5a3a62` |

Downloaded keyed attempt 3, no-key attempt 2, source/log audit and configuration artifacts had their ZIP digests verified. All 57 files in the final keyed artifact passed a scoped Google/GitHub credential-pattern scan. Attempt 2's three job logs were separately scanned before export. These pattern scans are scoped evidence, not a universal security certification. No private test query/contact content was sent to Google or the live lead endpoint.

## Release sequence still required

1. Verify the served configuration and actual tag no longer produce extra history/unsafe requests; both full candidate modes and `GA4 corrective release gate` must pass on the release head.
2. Under Brooke's existing conditional authorization, mark PR #75 ready and merge that exact expected SHA normally. Do not separately merge historical PR #72/#73 or enable auto-merge.
3. Allow the existing main production workflow to deploy once; do not launch a duplicate manual deployment.
4. Require live desktop/mobile collection receipts to `G-0LGBH6MDVX` for `/`, `/buildings/`, `/projects/olara/` and `/floorplans/olara/residence-d/`, correct clean URLs/referrers, no PII or duplicates, fresh no-consent/rejection inactivity and one loader per document. Confirm Maps/pages/assets/inquiry flows remain healthy. Synthetic leads and conversions stay intercepted; real CAPTCHA/CRM delivery is not claimed.
5. Record merge SHA, actual deployment and live network evidence in both documents and close integrated acceptance only after live success. Stop without starting a feature batch.

## Historical PR #74 release, preserved context

PR #74 candidate `f40b46d16aa9a029f8e8584791198ca46422ae1b` passed required full keyed/no-key verification and aggregate [run 34010467317](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010467317), then merged as `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7`. Both share tree `a0706b5fa044c9a992107624e997a6bb292a12ac`. Original production workflow [34010760203](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010760203) deployed successfully once, attempt 1, completed 2026-09-06T04:10:39Z. Documentation-only main closeout was `dd28320f689a3f377b6137671e702b6c58778b67` without redeployment.

The integrated implementation retains one floor-plan-aware bootstrap, one shared allowlisted inquiry bridge, coordinated postbuild, reachable-manifest preflight, Homepage commercial SEO, Buildings filters/listings before guidance and Olara Residence D HTML/discovery/sitemap/preview/PDF. Alba's implementation/source review is preserved but its new HTML remains unpublished, absent from sitemap/discovery and returns 404; its REV. 8/2022 drawing and 10-square-foot area discrepancy still require developer clarification. Existing PDFs remain intact.

Original live audit [34011268700](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34011268700) passed 29 surface checks, four actual Maps configurations and 12 intercepted same-session inquiries, but failed both actual-GA4 tests. Final stable desktop/mobile visual/log audit [34011866590](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34011866590) passed. Checked live URLs were `/`, `/buildings/`, `/floorplans/`, `/floorplans/olara/residence-d/`, `/projects/olara/`, `/inquire/`, `/map/` and `/sitemap.xml`; required routes returned 200, Alba's held route 404, and approved plan asset bytes matched. Legacy runtime/prerender title variants and startup/capture timing remain documented, not silently corrected here.

Only PR #74 was deliberately merged in the original release. GitHub marked historical #72/#73 merged through included ancestry; original heads `183320c452e95565c2928bb5d0d9d9f0620eebfb` and `95cdd3fda76b595b6449331a7a94c6bf3aa89dfa` remain preserved.

The complete earlier chronological ledger and artifact digests remain in [this file at the pre-continuation SHA](https://github.com/BrokenFL/WPB_New_Construction/blob/a8af3e67e54bfcaba75a08c4a7b8074c19b96a21/docs/P2_INTEGRATION_PROGRESS.md), including original startup/native-link/map-layout fixes, initial wrapper diagnosis and rejected pre-setting candidate attempts. No earlier failure is reclassified as a pass by this current snapshot.

Existing four high-severity dependency findings, 81 asset advisories and Vite chunk-size warning remain maintenance considerations. No dependency upgrade or unrelated cleanup is included. All remaining handoff work is carried in the delivery tracker. No Phase 2 growth outcome is measured and no historical GA4 delivery is invented for the instrumentation gap.
