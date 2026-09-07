# Phase 2 integrated release and GA4 corrective verification

Updated: 2026-09-07 UTC (September 6 evening in Florida). Repository: `BrokenFL/WPB_New_Construction`.

## Current decision: acceptance OPEN; PR #75 remains draft

Brooke visually confirmed Enhanced Measurement Page views enabled, Page loads ON and browser-history page changes saved OFF for `G-0LGBH6MDVX`. No further account toggle is requested. The latest investigation identifies the actual remote event source rather than disputing the saved UI.

**Execution root cause proven:** Google's served `__ccd_em_page_view` record for this destination still has `vtp_historyEvents: true`. Its handler sends an independent history page view and copies `gtm.oldUrl` into `page_referrer`, bypassing the site's sanitized manual event call. A blank page with one config, one actual Google loader, no WPB code and zero manual page-view commands reproduces it. The unresolved boundary is why Google's served configuration differs from the saved setting, not which code emits the event.

The [full causal report](GA4_HISTORY_SOURCE_DIAGNOSIS.md) supersedes earlier account-toggle advice. The tag-wide history flag is a veto, not an independent sender overriding a correctly compiled destination OFF. An isolated replay with only destination history false preserves both manual views and removes the extra/private-referrer event even while tag-wide history remains true. This causal control is NOT a supported application patch or a passing real-tag release test.

No candidate runtime or privacy assertion changed in this diagnostic pass. No merge, deployment, account mutation, lead send or Phase 2 feature work occurred. The unchanged real-Google-tag test still fails at both widths. Documentation-only updates do not satisfy that gate.

| Identity | Exact value |
|---|---|
| Corrective PR / branch | [PR #75](https://github.com/BrokenFL/WPB_New_Construction/pull/75) / `fix/ga4-command-queue` |
| Candidate examined and unchanged privacy test rerun | `f9fe17c55ae4785766fb40a179c7ce76650cd969` |
| Prior full keyed/no-key suite candidate | `a8af3e67e54bfcaba75a08c4a7b8074c19b96a21`; same runtime/test implementation |
| Original runtime wrapper correction | `69c4eb2921829081acc47053d890fb6c18e8748d` |
| Main verified unchanged | `dd28320f689a3f377b6137671e702b6c58778b67` |
| Deployed application, original PR #74 | `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7` |
| Corrective merge / deployment / live acceptance | None / not initiated / OPEN |

## Latest causal verification

[Causal probe run 34074593905](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34074593905) tested a minimal page with the actual Google library. [Source isolation run 34074795479](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34074795479) compared tag aliases, isolated individual remote flags in explicitly labeled diagnostic replays, then rebuilt and reran the unchanged candidate privacy test. Both workflows reside on the separate existing `p2-74-release-audit` branch; neither has deployment credentials. Workflow success means experiments completed, not release acceptance.

| Experiment | Page-view attempts | Private-referrer attempts | Meaning |
|---|---:|---:|---|
| Config only, zero manual views, then pushState | 1 | 1 | WPB router/manual calls are unnecessary to reproduce the automatic event |
| Two manual views plus pushState, actual Google tag | 3 | 1 | Independent extra history event |
| Both documented global send_page_view false forms, separate tests | 3 each | 1 each | Supported global default-view suppression does not override history handler |
| Two manual views without a History API change | 2 | 0 | Manual calls alone do not cause the extra event |
| Load actual associated GT tag alias | 3 | 1 | Alias change does not resolve it |
| Diagnostic-only replay: destination history false | 2 | 0 | Exact responsible flag isolated; tag-wide ON does not override OFF |
| Diagnostic-only replay: tag-wide history blocked | 2 | 0 | Independent veto works; not an application API |
| Unchanged full candidate real-tag regression, 1440px and 390px | Two clean manual views plus one blocked unsafe attempt at each width | 1 each, aborted | Still FAILS, exit 1; no passing release or production claim |

All synthetic collections were intercepted. Initial consented manual views and fresh rejection remain correct. The new real-tag inquiry sequence stops at the earlier privacy failure and is not counted as passed by older inquiry tests. Source-modified replay controls are strictly causal experiments, never replacements for the unmodified acceptance test.

Public metadata maps `G-0LGBH6MDVX` and `GT-M3LVS6X8` to one Google tag, canonical container `263254523`, with one listed destination, `G-0LGBH6MDVX`. The numeric identifier is not a GA property/stream ID. Normal and cache-busted requests to both aliases retain the same effective history flags. Exactly one config/loader reproduces the issue; no second destination or external GTM container was observed or required. This is not a full authenticated account association inventory.

Fresh normal/cache-busted G-ID responses at 01:56:46 and 02:00:46–47 UTC on September 7 had the same hash as 19:53:39 UTC September 6: `0120fe9ffddd733f2a6a0860cd10159e556d0d22c06401141a0dfa72794c40a2`. Response headers show current Date, no Age and private max-age=900. More than six hours of identical effective configuration rules out a stale browser cache as the sole explanation, but not Google's upstream publication/caching or saved-resource association mismatch. No propagation SLA is inferred.

## Recommended correction boundary

Keep PR #75's native-Arguments wrapper and manual sanitized tracking. No verified documented public gtag override was found for the independent remote history handler. Both supported global send_page_view variants were tested and failed to stop it. The discovered private ae_block_history product setting is not a public API. Do not patch Google's source in production, mutate private Google runtime objects, intercept/drop history events, disable all analytics or weaken the assertions.

The recommended next investigation is **read-only** reconciliation: retrieve the EnhancedMeasurementSettings for the data stream whose measurementId is exactly `G-0LGBH6MDVX`, and compare `pageChangesEnabled` with the served true flag. A saved false would localize the issue to Google generation/publication; a saved true would localize it to saved-resource/association mismatch. The authenticated Admin API read has not been obtained because no usable settings-read connection was found. Do not fabricate a backend bug or ask for another blind toggle. The causal report includes the documented GET, source evidence and Google-support investigation scope.

## Preserved application correction and prior full verification

The previous wrapper queued a rest-parameter Array. PR #75 replaces that assignment with a normal TypeScript function pushing native `arguments`, following [Google's documented queue](https://developers.google.com/tag-platform/devguides/datalayer). The existing unknown[] callable signature, void result, prior wrapper/dataLayer retention, consent gate, advertising denial, payload sanitizer, query-free helpers, attribution and loader ownership remain unchanged. Main/bootstrap, content, assets/PDFs, public/private boundaries, lead endpoint, package/lockfile and production deploy workflow are preserved.

[Required run 34053296879](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879) tested `a8af3e67e54bfcaba75a08c4a7b8074c19b96a21`:

| Historical resumed attempt | No-key job | Keyed job | Aggregate | Result |
|---|---|---|---|---|
| 2 | `101547054328` | `101547054455` | `101547657692` | FAILED at actual-tag privacy regression |
| 3 | `101548061690` | `101548061531` | `101548765624` | Same failure; other required checks passed |

Both modes passed typecheck, production build, complete npm test including 60 existing unit regressions and the actual queue contract, launch/copy/SEO/GEO/link/privacy/forms/performance/gatekeeper, assets:audit plus strict audit, 12 prepared desktop/mobile JavaScript-on/off configurations and 24 intercepted inquiry POSTs per mode. Keyed reachable-manifest preflight and four real Maps loader/tile/zoom checks passed; fallback was not accepted. No-key deployment rejection remained an explicit passing negative test. These historical passes do not override the failing real-tag gate or prove actual production collection.

At both widths, fresh unset/rejected consent has zero tag loads/collection attempts; the initial consented actual-tag view has correct measurement ID and clean location/referrer, native Arguments, one loader and advertising fields denied. Home to Buildings produces the additional unsafe event. The later real-tag commercial/floor-plan sequence is not reached. Candidate 204 responses are intercepted, not Google receipts. Chromium's ERR_ABORTED following an empty 204 is retained separately from receipt status; missing receipt/duplicate/privacy failures are not ignored.

Prior resumed screenshots were inspected with Homepage actions, listing-first Buildings and Olara's introductory CTA/drawing intact. This diagnostic pass made no visual changes.

## Evidence ledger

| Evidence | Artifact / digest |
|---|---|
| Latest minimal causal probes | [10001626798](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34074593905/artifacts/10001626798); SHA-256 `4e03ad062fcee0e370c74288ebca512f1fb6ae27cdc1e948b7fdfae5a979832d` |
| Latest aliases/source isolation and unchanged candidate | [10001703934](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34074795479/artifacts/10001703934); SHA-256 `54467367a2848546a89659f1ffe3dfc238574a2a0eeb708ba927f38565a8ebee` |
| Prior full resumed attempt 3 keyed | [9996057597](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879/artifacts/9996057597); SHA-256 `ec7c5d937e1ee1327b9fa3d7687ff20fd8787c5365e429b64ddd77893f18bc22` |
| Prior full resumed attempt 3 no-key | [9996055585](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34053296879/artifacts/9996055585); reported SHA-256 `b58f0d1049b40ddb2489e835d6f76b9aecd750d5ca1b68858cfd1868f44634c0` |
| Earlier fresh public config pair | [9996051612](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34055994842/artifacts/9996051612); SHA-256 `39341329bd2c19ed3f4f107bdffe2d0e40f37f975889a33111b36ec1ed5a3a62` |

Latest diagnostic artifacts include the retrieved public Google source for internal inspection, authored probes and safe event/count summaries. They do not contain key-bearing WPB builds, HARs, client IDs or raw lead payloads. The user-facing packet omits complete third-party library source. Previous candidate evidence and scoped credential scans remain recorded in [the complete pre-diagnosis ledger](https://github.com/BrokenFL/WPB_New_Construction/blob/f9fe17c55ae4785766fb40a179c7ce76650cd969/docs/P2_INTEGRATION_PROGRESS.md). No unsafe synthetic data was uploaded to Google or the live lead endpoint.

## Release sequence remains gated

1. The actual unmodified Google tag must stop generating extra/unsafe history events. Both full candidate modes and GA4 corrective release gate must pass on the then-current release head; diagnostic workflow success is not that gate.
2. Any later release must use Brooke's authorization and the exact verified PR head, with no separate historical #72/#73 merge or auto-merge.
3. The existing main workflow is the single production-deployment path; no duplicate manual deployment.
4. Live desktop/mobile collector receipts to G-0LGBH6MDVX must pass for `/`, `/buildings/`, `/projects/olara/` and `/floorplans/olara/residence-d/`: clean URLs/referrers, no PII or duplicates, correct consent/rejection, one loader per document, healthy Maps/pages/assets/inquiry attribution. Synthetic lead and conversion tests stay intercepted; no CAPTCHA/CRM delivery claim.
5. Only then record merge/deploy/network evidence and close integrated acceptance. No feature batch is authorized by this diagnostic work.

## Historical PR #74 release

PR #74 candidate `f40b46d16aa9a029f8e8584791198ca46422ae1b` passed full keyed/no-key and aggregate [run 34010467317](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010467317), then merged as `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7`; identical tree `a0706b5fa044c9a992107624e997a6bb292a12ac`. Production [34010760203](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34010760203) deployed once, attempt 1, completed 2026-09-06T04:10:39Z. Main documentation closeout `dd28320f689a3f377b6137671e702b6c58778b67` did not redeploy.

The release retains one floor-plan-aware bootstrap, shared allowlisted inquiry bridge, coordinated postbuild, reachable-manifest preflight, commercial Homepage, listing-first Buildings and Olara HTML/discovery/sitemap/preview/PDF. Alba remains unpublished, absent from sitemap/discovery with route 404; its REV. 8/2022 drawing and 10-square-foot discrepancy await developer clarification. Existing PDFs remain intact.

Original live [34011268700](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34011268700) passed 29 surface checks, four real Maps configurations and 12 intercepted same-session inquiries, but failed both actual-GA4 checks. Stable visual/log [34011866590](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34011866590) passed. Required routes `/`, `/buildings/`, `/floorplans/`, `/floorplans/olara/residence-d/`, `/projects/olara/`, `/inquire/`, `/map/`, `/sitemap.xml` returned 200; held Alba returned 404 and approved plan hashes matched. Legacy title variants/startup-capture timing remain documented, not corrected in this task.

Only #74 was deliberately merged; GitHub marked #72/#73 merged through included ancestry. Original heads `183320c452e95565c2928bb5d0d9d9f0620eebfb` and `95cdd3fda76b595b6449331a7a94c6bf3aa89dfa` remain preserved. Complete chronological ledgers are linked above and [at a8af3e67](https://github.com/BrokenFL/WPB_New_Construction/blob/a8af3e67e54bfcaba75a08c4a7b8074c19b96a21/docs/P2_INTEGRATION_PROGRESS.md); no historical failure is reclassified as a pass.

Existing four high-severity dependency findings, 81 asset advisories and Vite chunk-size warning remain maintenance considerations. No unrelated upgrade/cleanup, new Phase 2 batch, marketing send or outcome measurement occurred.
