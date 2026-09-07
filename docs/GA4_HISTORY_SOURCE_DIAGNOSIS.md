# PR #75 — causal diagnosis of the extra Google history page view

Observed through 2026-09-07 02:02 UTC (September 6 evening in Florida). Repository: `BrokenFL/WPB_New_Construction`.

**Decision: PR #75 remains draft and unmerged. No deployment or account-setting mutation. Integrated acceptance remains OPEN.** This report supersedes the earlier suggestion to change another account toggle without isolating its role.

## 1. Finding and confidence

The execution root cause is proven: the Google-served **per-destination Enhanced Measurement history handler** for `G-0LGBH6MDVX` is enabled and independently sends a `page_view` after a History API change. It copies the raw previous URL into `page_referrer`, including private query values. This is not a second application config call, a second manual page view, or a second measurement destination.

Brooke's screenshot shows the corresponding Enhanced Measurement history option unchecked, and Brooke confirms it was saved for this measurement ID. The public tag nevertheless contains `vtp_historyEvents: true`. The strongest supported diagnosis for that discrepancy is a **saved-configuration versus generated/served-configuration mismatch on Google's side**. The public evidence does not distinguish a saved-state/destination association issue from Google's publication or upstream caching problem. An authenticated read of the saved EnhancedMeasurementSettings has not been obtained; a backend service bug is not asserted as proven.

Corrective candidate examined: `f9fe17c55ae4785766fb40a179c7ce76650cd969`. Main remains `dd28320f689a3f377b6137671e702b6c58778b67`; deployed application remains PR #74 merge `c0ecdefd9819809ce86caa2881d66c80ad9cf5a7`. No candidate runtime or test source was changed during this diagnosis.

## 2. Exact responsible configuration and code path

The normal Google response for `https://www.googletagmanager.com/gtag/js?id=G-0LGBH6MDVX` contains this destination-specific record in `resource.tags`:

```json
{
  "function": "__ccd_em_page_view",
  "vtp_historyEvents": true,
  "vtp_includeParams": true,
  "vtp_instanceDestinationId": "G-0LGBH6MDVX",
  "tag_id": 15
}
```

Inspection of that handler's delivered template establishes the following behavior (explanatory pseudocode, not a proposed patch):

```text
if destination.historyEvents is false: return
if destination's internal history-block setting is true: return
register the Google history-change listener
on gtm.historyChange-v2:
    require a changed URL and pushState/popstate/replaceState
    automatic.page_location = historyEvent.newUrl
    automatic.page_referrer = historyEvent.oldUrl
    send automatic page_view to the configured GA destination
```

The raw old URL is the direct source of the synthetic query markers in GA's `dr` field. This path does not consult the application's `send_page_view: false` configuration. Its internal event sender is not the application's sanitized `track()` wrapper. Chrome initiator stacks point into the Google library; the minimal reproduction contains no WPB router or application bundle at all.

### The tag-wide switch is a veto, not an override of destination OFF

The same response has `__ogt_auto_events.vtp_enableHistoryEvents: true`. In the inspected code, that rule sets the private product setting `ae_block_history` only when its history flag is false. A true value merely leaves the destination unblocked. The destination handler still returns immediately when its own `historyEvents` is false.

The isolated one-flag experiment confirms this: **destination history false stops the extra event even while tag-wide history remains true**. Conversely, a tag-wide block also stops it. Therefore the previous suggestion that a tag-wide ON setting could itself override a correctly compiled destination OFF was not established and is disproved for this delivered configuration. No further toggle is requested.

## 3. Other tag/configuration sources checked

Public Google metadata identifies `G-0LGBH6MDVX` and `GT-M3LVS6X8` as aliases of the same logical Google tag, with canonical container identifier `263254523` and one listed destination, `G-0LGBH6MDVX`. That numeric container identifier is **not** claimed to be a GA property or data-stream ID.

Both ID endpoints were retrieved normally and with unique cache-busting parameters. Both carried the same two effective history flags. Loading the live, unmodified library through the GT alias still produced the same extra private-referrer event. Switching the loader ID is therefore not a fix.

The minimal reproduction uses exactly one loader and one `config` command. Its config-only variant issues **zero** manual `page_view` commands yet still generates the automatic history view. In the exact candidate, Home to Buildings has one loader, one config, two manual commands, two clean manual requests and the extra unsafe automatic attempt. The public destination record also enables duplicate-config-call ignoring. No second Google Analytics destination, Ads destination or external GTM container was needed or observed in these reproductions.

These observations rule out duplicate WPB initialization and another runtime tag as necessary causes of this event. They are not an exhaustive inventory of every saved account-side connected-tag association, which would require authenticated administration reads.

## 4. Controlled experiments

All collection requests were intercepted. The Google library was unmodified except in the two explicitly labeled counterfactual controls. Those controls changed one remote configuration boolean in a replayed response solely to prove causation; they are not production fixes, official API usage, or release acceptance.

| Experiment | Manual page-view commands | Observed page-view attempts | Attempts with private query in referrer | Result |
|---|---:|---:|---:|---|
| Blank page, config only, then pushState; actual Google tag | 0 | 1 | 1 | Automatic source reproduced without any manual tracking or WPB app |
| Blank page, two manual views plus pushState; actual tag | 2 | 3 | 1 | Extra event reproduced |
| Add documented global `gtag('set', 'send_page_view', false)` before config | 2 | 3 | 1 | Supported global setting does not stop this handler |
| Add documented object-form global `gtag('set', {send_page_view:false})` | 2 | 3 | 1 | Same failure |
| Same two manual commands, but no History API change | 2 | 2 | 0 | History change, not the manual event command, is the trigger |
| Load actual library using associated `GT-M3LVS6X8` alias | 2 | 3 | 1 | Alias does not resolve it |
| Replay identical downloaded bytes unchanged | 2 | 3 | 1 | Control reproduces original behavior |
| **Diagnostic only:** flip destination `vtp_historyEvents` to false; tag-wide flag still true | 2 | 2 | 0 | Extra event and private referrer disappear; manual views preserved |
| **Diagnostic only:** flip tag-wide `vtp_enableHistoryEvents` to false | 2 | 2 | 0 | Veto also removes automatic event while preserving manual views |

The first fixture also emits an automatic scroll because its small page fits in the viewport. The table counts only page views. The separate source-isolation fixture uses a tall page. No scroll is misclassified as a duplicate page view.

### Unchanged PR #75 privacy regression remains failing

After the controlled probes, the exact candidate was built and its existing `research/scripts/check-ga4-network.mjs` was run **without any source alteration**. At 1440px and 390px it again stopped on Home to Buildings with one blocked unsafe `page_view`, private field `dr`, one loader, and two manual page-view commands. Exit status was 1. Fresh rejection remained inactive with zero loader or collection requests; the initial consented manual view was clean.

The counterfactual demonstrates precisely which generated flag removes the event. It does **not** prove that the actual Google-served tag is fixed. The full release gate remains unsatisfied, and the later real-tag inquiry sequence is not claimed to pass when the earlier privacy check stops it. No corrective live deployment or live collection acceptance was attempted.

## 5. Propagation and cache evidence

At 19:53:39 UTC on September 6, earlier normal and cache-busted responses had SHA-256:

`0120fe9ffddd733f2a6a0860cd10159e556d0d22c06401141a0dfa72794c40a2`

Fresh-runner normal and uniquely cache-busted G-ID requests at **01:56:46 UTC and 02:00:46-47 UTC on September 7** returned exactly the same bytes and active destination-history flag. Request headers included `Cache-Control: no-cache` and `Pragma: no-cache`. Responses were HTTP 200 with current Date headers, no Age header, and `Cache-Control: private, max-age=900`.

That is more than six hours across the observations. It rules out a stale browser cache as the sole explanation; the tests also use fresh browser contexts with service workers blocked. It does not rule out Google's upstream caching, a stale generated configuration, or an unresolved publication/mapping issue. The 900-second header is not an account-setting propagation SLA.

GT-ID responses had different overall hashes from the G-ID script, but the same alias group, destination and history configuration. One first-pass browser response also had a different overall hash without changing the failing behavior. The conclusion rests on the effective fields and reproduced events, not on requiring every library variant to have identical bytes.

## 6. Supported API assessment and recommended correction

The existing native-Arguments correction belongs in application code and remains necessary. It restores documented command semantics without changing consent, sanitization or attribution. It is not sufficient to ship safely while the remote history handler is enabled.

Google's documented page-view instructions distinguish the config-time default view from independent Enhanced Measurement history views. Both documented global `send_page_view` forms were tested and did not stop the extra event. No documented, verified public `gtag()` override for this destination history handler was established by this investigation. The private `ae_block_history` product-setting storage is not a supported public configuration contract. Patching Google source, modifying private runtime objects, filtering history events out of dataLayer, overriding the browser History API, dropping failed assertions, or disabling all analytics would not be an acceptable production correction.

**Recommended ownership: reconcile the Google-side saved destination setting with its generated/served tag configuration; retain the application wrapper and manual sanitized tracking unchanged.** The desired destination behavior is already expressed by Brooke's saved OFF selection. Do not request another blind account toggle.

The next discriminating check is read-only: resolve the data-stream resource whose `webStreamData.measurementId` equals `G-0LGBH6MDVX`, then retrieve `EnhancedMeasurementSettings.pageChangesEnabled` with Google's Analytics Admin API. The documented method uses GET and accepts analytics.readonly authorization:

```text
GET https://analyticsadmin.googleapis.com/v1alpha/properties/{propertyId}/dataStreams/{streamId}/enhancedMeasurementSettings
```

A saved `pageChangesEnabled:false` paired with the reproducible served handler true would directly localize the problem to Google's generation/publication path. A returned true would localize the discrepancy to the saved resource/association rather than the application. This read has not been performed: no usable authenticated Analytics Admin settings-read connection was found. No credentials were requested or printed, and no private account association is invented from public metadata.

A Google support investigation can use the attached field values, alias mapping, response dates/hashes, source-isolation results and minimal reproduction to reconcile that publication. The support case should request an investigation of the mismatch, not a new analytics feature or another speculative settings change.

After Google serves the corrected effective configuration, the **unmodified** current-head real-tag test must pass at both widths, including later commercial/floor-plan events, before the full keyed/no-key gates and any authorized release. Integrated acceptance stays open until a later authorized deployment also passes actual production Google collector verification.

## 7. Evidence identity and limitations

- Causal/minimal reproduction run: `34074593905`, audit commit `d91df29d73a3980d40b40ed8d8cba0a20622569c`, artifact `10001626798`; ZIP SHA-256 `4e03ad062fcee0e370c74288ebca512f1fb6ae27cdc1e948b7fdfae5a979832d`.
- Alias/source-isolation and unchanged candidate run: `34074795479`, audit commit `3455f5ca6c9144fe56b969d81a2e6046d269980a`, artifact `10001703934`; ZIP SHA-256 `54467367a2848546a89659f1ffe3dfc238574a2a0eeb708ba927f38565a8ebee`.
- Both workflows are on the separate existing `p2-74-release-audit` branch, without deployment credentials or account mutation. A green diagnostic workflow means experiments completed, not that PR #75 passed its release gate.
- The user-facing evidence package contains safe event/count summaries, relevant configuration metadata, test scripts and this report, not full third-party library source, compiled WPB bundles, HARs, raw contact submissions, client IDs or secrets.
- Source-derived flag names are implementation observations, not official public APIs. No claim of successful GA4 collection, corrected production behavior, new feature work, or measured growth is made.

## Official Google references

1. [Manual page views and independent Enhanced Measurement history events](https://developers.google.com/analytics/devguides/collection/ga4/views#disable_page_changes_based_on_browser_history_events).
2. [Configuration reference: global and stream send_page_view](https://developers.google.com/analytics/devguides/collection/ga4/reference/config#send_page_view).
3. [Privacy guide: object-form global send_page_view](https://developers.google.com/tag-platform/security/guides/privacy).
4. [Google tag IDs, aliases and configuration ownership](https://developers.google.com/tag-platform/gtagjs/configure).
5. [Tag-wide automatic event detection](https://support.google.com/analytics/answer/12131703?hl=en).
6. [EnhancedMeasurementSettings: pageChangesEnabled](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1alpha/EnhancedMeasurementSettings).
7. [Read-only getEnhancedMeasurementSettings method](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1alpha/properties.dataStreams/getEnhancedMeasurementSettings).
