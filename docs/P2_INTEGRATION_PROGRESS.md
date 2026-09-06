# Phase 2 integrated release — PR #74

Updated: 2026-09-06 (UTC). Repository: `BrokenFL/WPB_New_Construction`.

## Latest corrective release attempt — PR #75, NOT DEPLOYED

Brooke authorized a focused GA4 correction, conditional merge and one normal production deployment after all required gates pass. The correction is implemented on `fix/ga4-command-queue` / [PR #75](https://github.com/BrokenFL/WPB_New_Construction/pull/75), branched from current main `dd28320f689a3f377b6137671e702b6c58778b67`. **No corrective merge or deployment has occurred. Integrated release acceptance remains OPEN.** The original PR #74 release ledger below remains historical evidence, not proof that PR #75 was released.

| Corrective identity / status | Value |
|---|---|
| Runtime correction commit | `69c4eb2921829081acc47053d890fb6c18e8748d` |
| Exact tested implementation | `af4226ff5be8801fbd5c196ad1562a2baa532d54` |
| Full corrective verification | [Run 34052877189](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34052877189) |
| Corrective merge SHA | None — release gate not satisfied |
| Corrective deployment | Not initiated; current deployed code remains `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7` |
| Real production collection evidence for correction | Not available: correction is not deployed; candidate collection is intercepted |
| Acceptance | OPEN for V1 and V1-H; not waived |

### Root cause and implemented correction

The old wrapper pushed a rest-parameter Array. The replacement is a normally declared TypeScript function with the unchanged `unknown[]` callable signature and a `void` return, pushing its native `arguments` object as required by [Google's documented data layer](https://developers.google.com/tag-platform/devguides/datalayer). The existing function/queue are retained. This is the only runtime change. The consent gate, all denied advertising settings, payload sanitizer, clean URL/referrer helpers, first-touch and inquiry attribution, page content, PDFs, Alba exclusion and production deployment workflow remain unchanged.

`check-gtag-command-queue.mjs` exercises the actual TypeScript assignment through the TypeScript compiler, requiring native Arguments objects for consent, js, config and event commands and rejecting the former Array representation. It runs through the existing analytics safety check in `npm test`.

`check-ga4-network.mjs` loads the actual Google tag for `G-0LGBH6MDVX`; it does not replace gtag with a mock. It checks unset/granted/denied consent, command representation, single loader/configuration, sanitized location/referrer, contact/query PII, delayed navigation events and inquiry serialization. Every candidate collection request and lead POST is intercepted. Its `--live` mode requires a real Google collector 2xx response for validated production page views; synthetic inquiries/conversions remain intercepted. The corrective workflow runs full keyed/no-key suites and a required aggregate gate, then live acceptance after the normal production deployment. No deployment credentials are available to these verification jobs.

### Tested results and newly exposed blocker V1-H

On the exact implementation above, both modes passed typecheck, production build, full `npm test`, `assets:audit`, strict asset audit, prepared commercial/floor-plan browser checks and combined inquiry journeys. The keyed job also passed the shared deployment preflight and actual Google Maps checks. The no-key job correctly asserted deployment rejection. Existing prepared/combined browser suites exercised 12 page configurations and 24 intercepted inquiry POSTs per mode. These do not substitute for the new real-tag transport test.

The new real-tag test passes the initial clean manual page view after consent at 1440px and 390px, with one primary tag, native Arguments commands, analytics consent granted and all advertising consent denied. Fresh rejection persists through navigation with zero tag loads or collection requests.

**The same real-tag test FAILS on navigation from Homepage to Buildings at both widths.** Two intended manual page-view commands are present, but an additional Google-generated `page_view` request carries the test query data in the `dr` referrer field. That unsafe request is aborted before transmission; only its event and offending field name are recorded. Separate diagnostic run [34052556760](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34052556760) also exposed a later duplicate Olara page view with a distinct event sequence. It is diagnostic evidence, not a passing release gate.

This matches the documented Enhanced Measurement history behavior: [Google states](https://developers.google.com/analytics/devguides/collection/ga4/views#disable_page_changes_based_on_browser_history_events) that `send_page_view: false` does not suppress Enhanced Measurement history-generated page views. Those automatic requests bypass the application's manually sanitized event calls. The wrapper fix must not ship alone while this conflicts with the privacy/no-duplicate requirements.

The collector test retains HTTP receipt status and any Chromium `net::ERR_ABORTED` diagnostic separately. An empty collector 204 was followed by that browser signal during interception; it is not treated as absence of a received HTTP response. Requests without a collector response never meet receipt acceptance. Duplicate counting and unsafe-request rejection remain enforced, including delayed history batches; no network/PII failure is blanket-ignored.

**Exact account action:** GA4 → Admin → Data collection and modification → Data streams → the WPB web stream with measurement ID `G-0LGBH6MDVX` → Enhanced measurement gear → Page views → Show advanced settings → disable **Page changes based on browser history events** → Save. Leave the site's manual page views, consent controls, advertising-denial settings and production credentials unchanged. No connected GA4 settings-write action was available; the account setting has not been changed by this task.

After the setting changes, re-run the current PR #75 candidate workflow, requiring both full modes and `GA4 corrective release gate` to pass. Only then mark ready, merge the exact verified head and allow the normal main workflow to deploy once. Its live job must show actual Google collector responses for `/`, `/buildings/`, `/projects/olara/` and `/floorplans/olara/residence-d/` at both widths, no duplicates or PII, rejection inactivity, healthy Maps/pages/inquiries, and only then close acceptance. A candidate receipt from an intercepted collector is not production delivery evidence.

### Corrective evidence

- Required no-key artifact [9995142752](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34052877189/artifacts/9995142752), SHA-256 `340d5183d853c9bf34f3b705d0afeb3a3bf43928b5958bb495135582d9c9806d`.
- Required keyed artifact [9995144120](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34052877189/artifacts/9995144120), SHA-256 `9ea6ac9a2760a235d873c3bf81bc1b8325d886dd5dda50bb1a305a26accdf86d`.
- Isolated transport diagnostic [9995015284](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34052556760/artifacts/9995015284), SHA-256 `355d362f02674542ec8a1d89fe9e330254a63e53dd4a3c62e40e4de41f153047`.

Artifact summaries retain failures, safe event metadata and screenshots, not raw PII, client IDs, key-bearing builds or HARs. Credential-pattern scans passed. No real lead, production analytics test conversion or marketing email was sent. No Phase 2 feature batch was started. The following sections describe the already-deployed PR #74, not an additional corrective release.

## PR #74 historical release status

**Approved, merged and deployed once. Post-deployment acceptance remains OPEN for V1: actual GA4 event transport.** The required pre-merge Maps/keyed/no-key jobs and aggregate gate passed. That result is not a claim that the later live GA4 test passed. No growth outcome has been measured.

| Release identity | Value |
|---|---|
| Release PR / branch | [PR #74](https://github.com/BrokenFL/WPB_New_Construction/pull/74) / `astra-p2-integrated-release` |
| Exact verified candidate | `f40b46d16aa9a029f8e8584791198ca46422ae1b` |
| Merge / deployed code SHA | `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7` |
| Candidate and merge tree | `a0706b5fa044c9a992107624e997a6bb292a12ac` — identical implementation |
| Previous production baseline | `fb7bf0e9b93a4c4710423dcd900d3e9d185e7605` |
| Historical PR #72 head | `183320c452e95565c2928bb5d0d9d9f0620eebfb` |
| Historical PR #73 head | `95cdd3fda76b595b6449331a7a94c6bf3aa89dfa` |

Brooke explicitly approved the combined presentation and inquiry flow conditional on the required candidate verification passing. PR #74 was marked ready and merged through the normal PR merge action with the exact expected head SHA. No separate merge action was performed for #72 or #73. GitHub subsequently marked those historical PRs merged through their included ancestry; their original branch heads and histories remain preserved.

## Preserved implementation

One floor-plan-aware bootstrap starts the legacy application once on existing routes, installs the immediate shared inquiry bridge and applies commercial enhancements. Olara's individual plan page mounts without the legacy app. Postbuild composes existing static routes, commercial copy and Olara entity/discovery output; the private Vite manifest and reachable-dependency production preflight remain authoritative.

Homepage commercial SEO, both request actions, listing/filter-first Buildings with guidance below, Olara Residence D HTML/preview/PDF/introductory CTA, and discovery/sitemap links are present. The shared allowlist replaces stale commercial/plan defaults while preserving first-touch attribution and manual selections. Consent, PII sanitization, lead endpoint, approved public assets/PDFs, lockfile and production deploy workflow remain unchanged from the previous production baseline. This includes the pre-existing analytics adapter defect documented under V1.

Alba's source-review implementation remains preserved; its new HTML, sitemap entry, discovery links and public entity lookup remain unpublished. REV. 8/2022 and the 10-square-foot reported-area discrepancy still require developer clarification before a later publication decision. No existing PDF URL or bytes changed.

## Final pre-merge verification

[Required candidate run 34010467317](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010467317), exact candidate `f40b46d16aa9a029f8e8584791198ca46422ae1b`:

| Gate | Result |
|---|---|
| Combined credential-free job `101425277395` | SUCCESS |
| Required combined real Maps job `101425277458` | SUCCESS |
| Aggregate Integrated release verification `101425728477` | SUCCESS |
| Typecheck / build / full combined suite | PASS in both modes; 60 unit regressions retained |
| Prepared browser suites | 12 desktop/mobile JS-on/off views and 12 intercepted POSTs per mode |
| Combined same-session inquiry sequence | 12 intercepted POSTs per mode, in addition to the prepared suites |
| Shared deployment preflight | Keyed build PASS; actual no-key build correctly REJECTED as an expected negative test |
| Actual Google Maps | 4/4 PASS: `/` and `/map/`, 1366px and 390px; real loader, rendered Google tiles, zoom changing loaded tiles, no Google error or fallback substitution |
| Scope / ancestry / assets / privacy | Protected-surface comparison and original histories PASS; strict asset audit has zero blockers and 81 existing advisories |

The dedicated review secret was supplied only to the approved BUILD step. Production keys/restrictions were not changed. K1 is resolved. The confirmation variable is a human attestation, not independent administration access to Google Cloud restrictions.

Two narrow corrections were made during release verification, not a new feature batch: `5c7e7ca5` fetches full checkout ancestry so the pinned production comparison can run; `f40b46d1` fixes an inherited two-column standalone map card and adds desktop/mobile real-map geometry assertions. Final candidate and real-map screenshots were inspected after those corrections.

## Single automatic production deployment

[Deploy Cloudflare Pages run 34010760203](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010760203), job `101426049489`, push event, attempt **1**, completed **2026-09-06T04:10:39Z**: **SUCCESS**, including the actual `Deploy to Cloudflare Pages` step. It built the merge SHA `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7`. No duplicate manual deployment, second production release or production workflow alteration was initiated. Subsequent audit runs are read-only and isolated on `p2-74-release-audit`.

## Live acceptance results

[Live audit 34011268700](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34011268700), observed deployed SHA `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7`. The surface script records **29 passing checks and two failed actual-GA4 checks**; its failure is retained. The separate combined-journey step passed.

| Live URL | Result |
|---|---|
| https://www.wpbnewconstruction.com/ | HTTP 200; canonical/title/description; enhanced H1, commercial actions; desktop/mobile rendered |
| https://www.wpbnewconstruction.com/buildings/ | HTTP 200; commercial metadata; filters/listings before guidance; desktop/mobile rendered |
| https://www.wpbnewconstruction.com/floorplans/ | HTTP 200; canonical/metadata; Olara discovery link |
| https://www.wpbnewconstruction.com/floorplans/olara/residence-d/ | HTTP 200; canonical/metadata/H1; drawing, approved PDF and availability CTA |
| https://www.wpbnewconstruction.com/projects/olara/ | HTTP 200; canonical/metadata; Olara plan discovery link |
| https://www.wpbnewconstruction.com/inquire/ | HTTP 200; canonical/metadata; both request families reach the actual submit handler |
| https://www.wpbnewconstruction.com/map/ | HTTP 200; canonical/metadata; working Google map and corridor control |
| https://www.wpbnewconstruction.com/sitemap.xml | HTTP 200; Olara plan occurs once; Alba entity absent |
| https://www.wpbnewconstruction.com/floorplans/alba-palm-beach/residence-d/ | HTTP 404; Alba HTML not published |

All seven HTML routes were rendered at 1440px and 390px: **14/14 PASS** for canonical identity, one visible H1, one parseable JSON-LD graph and no horizontal overflow. Homepage/Buildings were checked for their enhanced titles and presentation. Existing legacy runtime title variants on the floor-plan library, Olara project and inquiry page differ from their prerender titles; both were recorded without changing those baseline templates or claiming universal static/runtime text equality.

**Live Maps 4/4 PASS:** unmocked Google loader and loaded tile images on both routes at both widths, zoom changed loaded tiles, standalone canvas filled its card, and map-page corridor controls worked without Google error codes. Fallback was not accepted.

**Live inquiry journeys 12/12 intercepted POSTs PASS:** plan availability → Homepage availability → Buildings pricing packet → plan availability → Homepage pricing packet → Buildings availability, repeated at both widths without clearing attribution. Commercial requests select a different building to prove that Olara does not remain stuck. Native, modified and back navigation, JS-off navigation through inquiry landing, first-touch preservation, manual choices and analytics PII exclusions passed.

Every test POST was intercepted. The live production Turnstile integration was replaced only inside the test browser with a challenge callback fixture; no fixture token or synthetic contact record reached the real lead endpoint. These tests prove client UI, actual submission payload and attribution, not end-to-end production CAPTCHA validation, lead delivery or CRM receipt. No marketing emails were sent.

The live approved Olara PDF and preview returned 200 and matched repository bytes:
- PDF: `/assets/projects/olara/floorplans/olara-floorplans-olara-floorplan-s-digital-31126-d-v01.pdf`; SHA-256 `bdafa9399566df69f665551ecd332cdbb8b34923db310c1c07b5a000d9d8deae`.
- Preview: `/assets/projects/olara/floorplans/previews/olara-floorplans-olara-floorplan-s-digital-31126-d-v01.jpg`; SHA-256 `74bfbacf83693d8cc22f0e03ca88e31bc44285d9fb18876253ea1d918fd8f3e0`.

## V1 — live GA4 transport acceptance OPEN

At both widths, declined/unset consent produced zero analytics tag/collection requests. After consent, the actual Google tag loaded once, and the application queued one configuration and one page-view command, with contact values excluded. However, the unmodified live page produced **zero outgoing GA4 page-view collection attempts**. Actual event delivery and downstream duplicate-event acceptance therefore did **not** pass.

`src/lib/analytics.ts` uses `(...args) => window.dataLayer?.push(args)`, producing Array commands. Google's [documented gtag wrapper](https://developers.google.com/tag-platform/devguides/datalayer) pushes the function's `arguments` object. A browser-only diagnostic control replaced the wrapper and replayed the already queued commands using that documented representation; exactly one intercepted page-view request then appeared at each width. This control did not modify production and is not counted as a passing live baseline.

The adapter is unchanged from the pre-release baseline. Earlier mocked-tag tests verified application commands, consent and sanitization, but did not establish actual Google command processing. Their results remain valid only within that narrower scope.

Required closure: a focused correction to the gtag command wrapper, a regression exercising the actual Google tag with all collection requests intercepted, both full candidate modes/Maps/preflight, and a separately authorized corrective release/live rerun. Retain consent, strict PII exclusions, one tag/configuration and one delivered event per intended transition. No analytics fix or second deployment was applied during this single-deployment release task. No traffic/conversion uplift is claimed.

## Evidence and visual review

All evidence refers to exact tested code or the deployed merge, not a generated mockup. Final viewport captures wait for actual commercial enhancement and native discovery readiness, fonts and stable scroll rather than assuming a fixed delay. The original consent control is used; no banner or map error is hidden. Desktop/mobile Homepage, Buildings, plan, library, project, inquiry and map screens are inspected separately from analytics acceptance.

| Evidence | Run / artifact | SHA-256 |
|---|---|---|
| Final credential-free candidate | 34010467317 / 9982334110 | `4f53c66e28bfb3ad9dfc0822773425c6750c0b06164ae0415fa4504b419ad6ab` |
| Final keyed real Maps | 34010467317 / 9982330156 | `d6003d76a2af0f3cfedc513ac7feb3130d025b60a212be2d305d89241500f204` |
| Pre-merge log/artifact safety | 34010485322 / 9982338261 | `d91423cff7a475c5df3afd4262b9d5865a259adfdf152f1966e66dff76e1fea4` |
| Live results, including V1 failures and browser-only control | 34011268700 / 9982576059 | `12c56065bdcaf805f9d04826f1ef486d61ba7d0852e67b77f103fc3f54c0dc07` |
| Final stable live viewports and production-log safety | 34011866590 / 9982730202 | `ee98e3562d1cf1d9a318bf572cce1e4336d12faff2cae8dfecd7664f155a93ac` |

The independent safety audit scanned all three pre-merge job logs and all 56 artifact files for Google/GitHub credential patterns; no matches. Production job logs also passed a credential-pattern scan, with raw production logs not archived. Artifacts exclude credential-bearing builds, HAR files and raw contact submissions. This is a scoped scan and artifact review, not a blanket security certification.

## Historical record and stopping point

The complete pre-release integration history remains in [this document at the deployed merge](https://github.com/BrokenFL/WPB_New_Construction/blob/c0ecdefd9819809ce86caa2881d66c80ad9cf5a7/docs/P2_INTEGRATION_PROGRESS.md), plus the unchanged P2-001 and P2-002 progress documents. It records the form-initialization, mobile-navigation test and native-link contrast corrections; their earlier missing-key statuses are historical, not current blockers.

This closeout changes only the integration progress document and delivery tracker. A documentation-only `[skip ci]` commit prevents an unnecessary second production deployment; it does not skip or replace the already completed release-candidate gates. No new Phase 2 feature batch was begun. Presentation is approved and deployed; **overall post-deployment acceptance is not fully green until V1 is corrected and retested**. All remaining roadmap items remain in `docs/PHASE_2_DELIVERY_TRACKER.md`.
