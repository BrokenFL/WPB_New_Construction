# P2 live-shadow operations package

Status: **prepared and tested; not provisioned, installed, or activated**.

This is the activation runbook for private `Incoming_Intel` shadow processing.
It does not authorize an Apps Script trigger, Sheet/schema edit, VM, DNS/TLS
change, email, publication, canonical-fact write, PR, merge, or deployment.
The contracts remain authoritative in `P2_CLOUD_HANDOFF_APPROVAL.md`; scanner
installation details are in `P2_APPS_SCRIPT_SCANNER_INSTALL.md`.

## Selected v1 owner

Run exactly one repository checkout as a Node service on a small Google Compute
Engine VM with an encrypted persistent disk. Bind Node to localhost and expose
only HTTPS through a rate-limited TLS edge. The VM, not Brooke's laptop, owns
the durable queue, fact-check packets, digests, and acknowledgments.

Direct `repository_dispatch` is not the v1 owner. GitHub's accepted response
means an event was queued, not that processing and its durable acknowledgment
completed, so it cannot satisfy the scanner's exact synchronous ack contract.
GitHub Actions also adds a second queue/retry surface. The owner may later open
a review branch only through a separately authorized GitHub App or fine-grained
token; the default workflow `GITHUB_TOKEN` must not be assumed to trigger later
workflows. No GitHub credential is required for shadow mode.

The owner process is:

```text
POST /v1/intel-shadow/dispatch
  -> exact schema/HMAC/freshness check
  -> prior durable-ack lookup
  -> read fixed private Sheet with read-only identity
  -> bind row positions and scanner hashes
  -> independently fetch bounded public evidence URLs
  -> Phase A + trusted handoff + dual policy
  -> private fact-check packets, queue, previews, and digest
  -> assert every release/writeback/apply switch is false
  -> persist ack
  -> return exact p2-dispatch-ack-v1
```

`GET /healthz` returns only contract version, `mode: shadow`, and
`release_disabled: true`. It never returns Sheet rows, URLs, secrets, queue
items, or source text.

## Fixed target and owner settings

The server refuses any other Sheet target.

- Sheet ID: `1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8`
- tab: `Incoming_Intel`
- policy: `p2-shadow-policy-v2`
- command: `npm run p2:shadow:owner`
- private data root: `/var/lib/wpb-p2`
- repository checkout: `/opt/wpb-shadow/current`
- listener: `127.0.0.1:8791`

Required owner environment:

```dotenv
P2_RUNTIME_ROOT=/var/lib/wpb-p2
P2_REPO_ROOT=/opt/wpb-shadow/current
P2_DISPATCH_SECRET=<random HMAC secret of at least 32 characters>
P2_GOOGLE_AUTH_MODE=metadata
P2_GOOGLE_SHEET_ID=1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8
P2_GOOGLE_SHEET_NAME=Incoming_Intel
P2_OWNER_HOST=127.0.0.1
P2_OWNER_PORT=8791
```

Preferred Google authentication is the VM's attached, dedicated service
account through the metadata server—no downloaded key. Give that identity the
Sheets read-only OAuth scope and share only the private target Sheet to its
service-account email as Viewer. It needs no Editor, Drive-wide, Gmail,
GitHub, deploy, or Cloudflare permission. The tested break-glass fallback is
`P2_GOOGLE_AUTH_MODE=service_account_json` plus
`P2_GOOGLE_SERVICE_ACCOUNT_JSON`; do not use that long-lived key when metadata
identity is available.

Store `P2_DISPATCH_SECRET` in the cloud secret manager and inject it only into
the owner process. Put the same value in the Apps Script `DISPATCH_SECRET`
Script Property. Do not put it in the repository, Sheet, logs, command history,
or URL. The external HTTPS URL must terminate at the local owner route and must
not contain credentials.

The persistent disk must preserve `/var/lib/wpb-p2/.runtime/p2/`, including
`dispatch-acks.json`, `review-queue.json`, fact-check packets, previews, and
digests. Snapshot/back up that directory before host replacement. Run only one
owner process in v1; a second process would require a transactional shared ack
store and is outside this activation.

## Trusted fact-check round trip

The first pass emits a mode-0600 private
`p2-fact-check-packet-v1` under
`.runtime/p2/fact-check-packets/`. It contains the exact Phase A snapshot,
event, claims, independently fetched source revisions, expected reviewer and
policy versions, and explicit zero authority. It does not contain fetched
source bodies.

The verifier returns exactly `p2-fact-check-handoff-v1`. Operationally, the
existing private Sheet task may place the JSON in a new private column named
`fact_check_handoff_json`. Adding that column or changing the external task is
a separately authorized Sheet/task configuration step. The scanner includes
that field only in `evidence_hash`, so it re-dispatches without sending the JSON
body. Prose in `review_notes`, `verification_summary`, or
`verification_status` is never parsed as evidence.

Exact top-level handoff shape:

```json
{
  "contract_version": "p2-fact-check-handoff-v1",
  "intel_id": "wpb-intel-2026-09-13-001",
  "intake_snapshot_sha256": "<64 lowercase hex>",
  "event_key": "project|example|construction|completion|2026-09-13",
  "claims": [{
    "claim_id": "<exact Phase A claim id>",
    "claim_type": "project_fact",
    "field": "status",
    "claim_text": "<exact normalized Phase A claim text>",
    "claim_value": "completed",
    "verdict": "supported",
    "evidence": [{
      "source_ref_id": "<exact source id>",
      "source_url": "https://www.wpb.org/example",
      "fetched_content_sha256": "<64 lowercase hex>",
      "source_revision": "<64 lowercase hex>",
      "source_revision_sha256": "<64 lowercase hex>"
    }]
  }],
  "verification_timestamp": "2026-09-13T12:00:00.000Z",
  "reviewer_type": "automated_fact_checker",
  "reviewer_id": "wpb-fact-check-task",
  "reviewer_name": "WPB independent fact checker",
  "reviewer_version": "fact-checker-v1",
  "policy_version": "p2-shadow-policy-v2",
  "evidence_bundle_sha256": "<64 lowercase hex>"
}
```

Every object is exact-key validated. Claim and evidence arrays must bind all
Phase A claims and current independently fetched source revisions. The allowed
verdicts are `supported`, `unsupported`, and `conflicting`. The deterministic
output hash is exposed by `evidenceBundleSha256ForHandoff()` in
`fact-check-handoff.mjs`; it SHA-256 hashes the canonical stable-JSON
`p2-trusted-evidence-v1` payload derived from this handoff. The verifier cannot
add confidence, publish, approval, or other authority fields; unknown fields
fail closed. Changed Sheet rows, claim values/text, source bytes, reviewer
version, policy version, or stale timestamps reject the handoff.

The owner independently re-fetches every intake/handoff URL with public-address
pinning, redirect/size/time limits, and source classification. An HTTP success,
source tier, model agreement, Sheet status, confidence, or prose note never
supplies a support verdict.

## Apps Script configuration

Install only from `tools/apps-script/incoming-intel-scanner.gs` and follow
`P2_APPS_SCRIPT_SCANNER_INSTALL.md`. Required Script Properties are:

```text
SCANNER_MODE=test
SHEET_ID=1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8
POLICY_VERSION=p2-shadow-policy-v2
DISPATCH_ENDPOINT=https://<approved-shadow-host>/v1/intel-shadow/dispatch
DISPATCH_SECRET=<same secret as owner>
```

Start with `test`: it performs no POST and records no row acknowledgment. After
the owner, TLS, health, backup, and exact-ack tests pass—and only after Brooke's
specific authorization—change to `shadow` and create one time-driven
`scanIncomingIntel` trigger for every 15 minutes. There is no release scanner
mode.

## Retry, outage, and acknowledgment behavior

- The scanner attempts one dispatch up to three times with 2/4/6-second waits.
- The owner authenticates and rejects stale dispatches before private Sheet or
  source access.
- It re-reads and hash-binds the row before fact checking. Changed/moved rows
  return conflict and remain unacknowledged.
- An ack is durable only after the queue/digest are persisted and all release
  boundaries pass. A lost response can replay the same envelope and receive the
  stored ack without reprocessing.
- `policy_version` is part of both per-row acknowledgment state and the
  deterministic dispatch ID, so a policy bump cannot reuse an old ack.
- The scanner re-reads each row after the ack; changed rows are not marked sent.
- If Google, the HTTPS edge, or the owner is unavailable, Script Properties are
  unchanged and the next scheduled scan retries. No public fallback runs.
- Rotate a compromised HMAC secret on owner and scanner together; until both
  match, fail closed in `test` or with the trigger disabled.

## Operator digest

Each processed batch writes private JSON and Markdown. Only
`NEEDS_DECISION` items are expanded as exceptions; holds remain counted rather
than turning Brooke into a queue operator.

```text
Processed: 8
Auto article candidates: 2
Auto fact candidates: 1
Duplicates ignored: 3
Held: 1
Needs Brooke: 1

Exception: example-project — delivery timing changed 2027 -> 2028
Article: NEEDS_DECISION
Fact: NEEDS_DECISION
Evidence: https://www.wpb.org/example
Reason: human_required_fields:deliveryTiming
```

No digest email is configured. Private file review is the only behavior in this
slice.

## Canonical propagation shadow proof

Every proposal uses PR #95's reviewed canonical index and includes the expected
canonical revision, old/new values, effective date, audit/rollback ID, evidence
bundle SHA, and `apply: false`.

| Example | Old -> proposed | Shadow decision |
|---|---|---|
| `status` | `under_construction` -> `completed` | potentially `AUTO_ELIGIBLE` only after every hard gate and required test passes |
| `residenceCount` | `55` -> `56` | potentially `AUTO_ELIGIBLE` only after every hard gate and required test passes |
| `deliveryTiming` | `2027` -> `2028` | `NEEDS_DECISION`; never automatic |

The recorded downstream plan is project pages, project/building cards,
comparisons, corridor/discovery pages, maps, floorplan context, JSON-LD/schema,
feeds/search, and AI/LLM discovery. Historical articles are explicitly excluded.
No surface is regenerated in shadow mode.

## Cost and capacity

A single small VM is adequate for the 15-minute, single-worker v1. Google lists
on-demand `e2-small` compute at about USD 0.016752855/hour (roughly USD 12.23
for 730 hours) before disk, network, tax, or regional differences; `e2-micro`
is cheaper but its memory is a tighter operational margin. Verify the selected
region at activation: <https://cloud.google.com/products/compute/pricing/general-purpose>.
There is no paid StoryWriter or verifier API in this slice. GitHub Actions
would use the repository/account's included minutes and billing rules if later
selected: <https://docs.github.com/en/actions/concepts/billing-and-usage>.

## Activation and rollback

Each stage needs separate approval:

1. Provision owner VM/disk, dedicated read-only Google identity, secret, TLS,
   backup, and monitoring. Keep scanner in `test`; release stays disabled.
2. Add the private `fact_check_handoff_json` column/update the independent
   verifier task and soak packets/handoffs. Keep all outputs shadow-only.
3. Authorize scanner installation in `test`, verify health, then separately
   authorize the 15-minute `shadow` trigger.
4. Measure false positives, holds, duplicates, stale/replay behavior, evidence
   drift, latency, and operator load. Add authenticated exception delivery only
   after a separate security review.
5. Separately pilot one allowlisted fact through PR #95 with revision lock,
   rollback, audit, and live QA. Keep sensitive fields human-only.
6. Separately pilot low-risk article branches through the existing publisher.
   Automatic merge/deploy remains a later decision.

Emergency rollback order: disable/delete the Apps Script trigger; set
`SCANNER_MODE=test`; stop the owner service; revoke/rotate the HMAC secret;
remove the Sheet Viewer share from the service account; preserve the runtime
disk for audit; and revert the owner checkout to the last reviewed SHA. Because
release and writeback are hard-disabled, shadow rollback requires no public
content or canonical-fact repair.
