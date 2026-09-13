# Incoming_Intel Apps Script scanner installation

Status: **installation package only; not installed or authorized for live use**.

`tools/apps-script/incoming-intel-scanner.gs` is the source for a Sheet-bound
Apps Script that scans the private `Incoming_Intel` tab approximately every 15
minutes. It sends a signed, data-minimal dispatch to the single P2 processing
owner. It never publishes, writes canonical facts, creates a PR, merges,
deploys, or sends email. There is no release mode in this script.

## Target

- Spreadsheet ID: `1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8`
- Tab: `Incoming_Intel`
- Function: `scanIncomingIntel`
- Cadence: time-driven trigger, approximately every 15 minutes
- Trigger mechanism: scheduled trigger only; `onEdit` is not used

Keep the spreadsheet private. The scanner sends only the sheet ID/tab,
dispatch ID, policy version, row positions, row IDs, and content/evidence
hashes. It does not put article text, source text, credentials, or review
notes in the POST or in logs.

When the separately authorized external verifier integration is configured,
its exact `p2-fact-check-handoff-v1` JSON belongs in the private
`fact_check_handoff_json` column. That column is hashed as evidence but its body
is not dispatched. Prose review columns remain non-authoritative.

## Script Properties

Set these in Apps Script **Project Settings → Script properties**. Never commit
or paste the secret into a Sheet cell, source file, issue, or log.

| Property | Required value | Use |
| --- | --- | --- |
| `SCANNER_MODE` | `test` first; later `shadow` | `test` performs no network call or acknowledgment. `shadow` permits dispatch only. Any other value fails closed. |
| `SHEET_ID` | `1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8` | Prevents a copied/bound script from scanning a different spreadsheet. |
| `POLICY_VERSION` | `p2-shadow-policy-v2` | Binds the dispatch to the processor policy. Keep it explicit. |
| `DISPATCH_ENDPOINT` | Private runner HTTPS URL | Required only in `shadow`; HTTP and non-URL values are rejected. |
| `DISPATCH_SECRET` | Random shared HMAC secret, at least 32 characters | Required only in `shadow`; use a secret manager or protected deployment settings on the runner. |

The script defaults an absent mode to safe `test`, but installation should set
it explicitly. In `test`, endpoint and secret are ignored and the scanner does
not call `UrlFetchApp`.

## Minimum authorization/scopes

Prefer the Apps Script editor's generated authorization and do not add broad
Drive, Gmail, or external service scopes. If an explicit `appsscript.json`
manifest is used, the minimum scopes for this source are:

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

`LockService`, `PropertiesService`, `Utilities`, and reading the bound
spreadsheet do not require Drive access. The trigger is created manually in
the UI, so this source does not need a trigger-creation function or a broader
scope for installing one.

## Installation and test mode

1. Open the private spreadsheet and choose **Extensions → Apps Script**.
2. Create/open the bound project and replace the editor source with
   `tools/apps-script/incoming-intel-scanner.gs`. Save it. Do not run a
   deployment or add a trigger yet.
3. Add `SCANNER_MODE=test`, the exact `SHEET_ID`, and
   `POLICY_VERSION=p2-shadow-policy-v2`. Leave endpoint/secret unset while
   testing.
4. Run `scanIncomingIntel` once from the editor and complete the Google
   authorization prompt. A successful run returns `mode: "test"`,
   `would_dispatch`, and quarantine counts. It must show zero POSTs and must
   not create `p2scan:<intel_id>` acknowledgment properties.
5. Run `getScannerHealth` from the editor. The expected healthy test state is
   `status: "test_ok"`, with timestamps and counts but no private row content.
6. Confirm that duplicate IDs, blank IDs, non-`event` rows, and event rows
   missing `id`, `status`, `headline`, `category`, or `source_url` are
   quarantined while unrelated valid rows remain eligible.
7. Only after the runner's authenticated durable-ack endpoint is provisioned,
   set `DISPATCH_ENDPOINT`, a 32+ character `DISPATCH_SECRET`, and change
   `SCANNER_MODE` to `shadow`. Do not turn on any article or fact release
   adapter.

## Trigger creation (manual, not performed here)

In the Apps Script editor, open **Triggers → Add Trigger**:

- function: `scanIncomingIntel`
- event source: **Time-driven**
- type: **Minute timer**
- interval: **Every 15 minutes**

Save the trigger and verify one execution in the Apps Script **Executions**
view. Do not use `onEdit` as the operating trigger. The script lock rejects an
overlapping invocation.

## Health and failure behavior

`getScannerHealth()` reads the non-sensitive `p2scan:health` Script Property.
It reports the last status (`never_run`, `test_ok`, `ok`, `error`, or `busy`),
mode, timestamps, dispatched/would-dispatch count, quarantine count, stale
row count, retry attempts, and a coarse error code. It never stores endpoint,
secret, source text, article text, or exception URLs.

- Configuration, target-sheet, missing-tab, and schema errors fail closed and
  leave the affected records unacknowledged.
- Duplicate IDs are quarantined as a group; they are never resolved by first
  or last row. Non-event and partial event rows are quarantined. Valid
  unrelated rows can still dispatch.
- A shadow dispatch retries at most three times (2, 4, then 6 seconds) and
  accepts only HTTP 200 with the exact durable `p2-dispatch-ack-v1` envelope.
- Hash acknowledgment is written only after that durable acknowledgment and a
  fresh row re-read. If the row changed, moved, or disappeared, it is marked
  stale for health reporting and remains eligible for a later scan.
- A malformed or missing prior hash state is treated as unacknowledged and is
  safely re-dispatched; it is never trusted as proof of processing.
- The acknowledged policy version is stored with the row hashes and is also
  bound into `dispatch_id`; a policy bump therefore forces a new evaluation
  instead of accepting an old durable acknowledgment.
- Test mode computes the same signed envelope shape with a local test key but
  never sends it. It does not acknowledge rows.

## Rollback/uninstall

To stop scanning, disable or delete the `scanIncomingIntel` trigger first.
For a reversible pause, set `SCANNER_MODE=test`; for full removal, delete the
trigger and the bound Apps Script project. Remove `DISPATCH_ENDPOINT` and
`DISPATCH_SECRET` from Script Properties, and optionally remove `p2scan:*`
state after preserving any health evidence needed for review. No Sheet rows are
written by the scanner, so uninstall does not alter intake data.

## Explicit boundary

Installing this script does not authorize live publication or fact mutation.
The only allowed live behavior in this slice is a private authenticated
shadow dispatch after Brooke separately authorizes installation. The runner
must continue to enforce snapshot binding, replay/stale rejection, trusted
evidence validation, independent article/fact policy, and disabled release
adapters.
