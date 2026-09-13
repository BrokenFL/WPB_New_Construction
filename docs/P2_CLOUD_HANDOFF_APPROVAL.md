# P2 Shadow Automation Pipeline

Status: **working shadow implementation; production activation prohibited**.

This document is authoritative for the trusted-evidence bridge, shadow
orchestrator, exception approval contract, Apps Script dispatch, and
StoryWriter boundary. It supersedes the earlier design-only prototype text in
this file. Phase A's no-mutation contract remains authoritative in
`P2_INTELLIGENCE_PROCESSOR_PHASE_A.md`.

## Review sequencing (verified 2026-09-13)

PR #97 (`fix/intel-ambiguous-row-selection`) is narrowly reviewable, green,
and recommended to merge because it fails closed on duplicate IDs before any
artifact or fetch work. PR #98 currently descends from #97 and contains that
commit once, not a duplicate implementation. Do not merge either PR from this
handoff. After #97 merges, rebase/update #98 onto the resulting `main` and
re-run all gates before considering #98 merge.

## Non-negotiable boundary

Nothing in this slice may write the Sheet, create a branch or PR, merge,
deploy, apply a canonical fact, publish an article, or send an email. The
release and writeback adapters return plans with `enabled: false`. Runtime
queues, acknowledgments, and local HTML previews live under `.runtime/p2/` or
a private temporary directory.

Article and fact decisions are independent:

| Result | Article | Fact change |
|---|---|---|
| Article only | `AUTO_ELIGIBLE` | `NONE` |
| Fact only | `HOLD` without a writer candidate | `AUTO_ELIGIBLE` |
| Both | `AUTO_ELIGIBLE` | `AUTO_ELIGIBLE` |
| Neither | `HOLD` or `DUPLICATE` | `HOLD` or `NONE` |
| Exception | `NEEDS_DECISION` | independently classified |

`AUTO_ELIGIBLE` is a policy result, not permission to release.

## End-to-end data flow

```text
private Incoming_Intel snapshot
  -> authenticated minimal dispatch
  -> immutable row/hash binding
  -> Phase A preliminary claims and chronology
  -> trusted evidence bundle validation
  -> Phase A trusted-evidence pass
  -> StoryWriter copy candidate (when configured)
  -> independent article and fact policy decisions
  -> exact review object and private queue
  -> local exception preview (when required)
  -> disabled article/fact release plan
```

The private snapshot is not part of the dispatch. Production must provide it
through a separately authenticated Sheet-read or private ingest channel. The
runner re-hashes the selected current row before any processing, so a partial
edit or changed row fails with `ERR_SNAPSHOT_RECORD_MISMATCH`.

## Trusted evidence bundle

`evidence-review.mjs` owns the sole bridge from fact-check output to Phase A
trusted claim evidence. Its exact-key `p2-trusted-evidence-v1` object binds:

- `intel_id`, the Phase A immutable row snapshot SHA, and `event_key`;
- each exact claim ID, type, field, JSON value, and normalized text;
- each verification URL, fetched content SHA, and derived source-revision SHA;
- `supported`, `unsupported`, or `conflicting` verdict;
- verification timestamp, reviewer type and identity, reviewer version;
- policy version and deterministic review-bundle SHA.

Allowed reviewer types are `automated_fact_checker` and `human`. Automated
fact checking grants evidence status only. It never grants article publishing,
fact mutation, approval, merge, or deployment authority.

Representative bundle shape:

```json
{
  "contract_version": "p2-trusted-evidence-v1",
  "intel_id": "wpb-intel-2026-09-13-001",
  "intake_snapshot_sha256": "<64-hex-row-sha>",
  "event_key": "project|example|construction|completion|2026-09-13",
  "claims": [{
    "claim_id": "<claim-id>",
    "claim_type": "project_fact",
    "field": "status",
    "claim_value": "completed",
    "claim_text": "construction status changed to completed",
    "support_verdict": "supported",
    "verification_sources": [{
      "source_ref_id": "<source-ref>",
      "verification_source_url": "https://www.wpb.org/example",
      "fetched_content_sha256": "<64-hex-content-sha>",
      "source_revision_sha256": "<64-hex-revision-sha>"
    }]
  }],
  "verification_timestamp": "2026-09-13T12:00:00.000Z",
  "reviewer_type": "automated_fact_checker",
  "reviewer_identity": "wpb-fact-checker",
  "reviewer_version": "fact-checker-v1",
  "policy_version": "p2-shadow-policy-v2",
  "review_bundle_sha256": "<64-hex-bundle-sha>"
}
```

The following never satisfy claim verification: confidence alone, the Sheet's
`verification_status`, HTTP 200, model agreement, source tier alone, or prose
in `review_notes`/`verification_summary`. Source and Sheet strings are always
untrusted data; embedded instructions have no control effect.

## Policy and canonical fact changes

`policy-engine.mjs` returns separate article and fact decisions.

Potentially automatic fields are `status`, `toppingOut`, `groundbreaking`,
`completionStatus`, unambiguous `name`, `residenceCount`, and `floorCount`.
Allowlisting is necessary but insufficient. Every automatic fact also needs:

1. an exact supported bundle/claim/source binding;
2. an acceptable source class (tier 1, or two distinct tier-2 sources; name
   correction requires tier 1);
3. no chronology conflict or unresolved entity ambiguity;
4. no active human-review hold;
5. a real difference from the reviewed canonical value;
6. the same canonical revision and current-value hash reviewed originally;
7. the exact policy-required test names present and passing, each bound to the
   canonical revision and deterministic fact-test target SHA;
8. an `apply: false` shadow mutation.

Delivery, pricing, inventory, incentives, HOA/fees, sales pace, financing,
legal matters, termination/buyout, zoning or entitlement interpretation,
approval interpretation, and unknown fields require a human decision.

Example shadow fact diff:

```json
{
  "project_id": "alba-palm-beach",
  "field": "status",
  "current_value": "under_construction",
  "proposed_value": "completed",
  "event_date": "2026-09-10",
  "effective_date": "2026-09-10",
  "risk_classification": "auto_fact_allowlist",
  "policy_version": "p2-shadow-policy-v2",
  "audit_identifier": "fact-audit-<id>",
  "rollback": { "previous_value": "under_construction", "rollback_identifier": "rollback-<id>" },
  "apply": false
}
```

Fact proposals are derived only from Phase A `projectFactProposals` and the
existing reviewed canonical index introduced by PR #95. No second project
database and no per-page fact editing are introduced. Historical articles are
never rewritten to the current canonical state.

## StoryWriter provider interface

`story-writer.mjs` defines `p2-story-brief-v1` and
`p2-story-candidate-v1`. A provider receives only supported, evidence-bound
claims, source URLs, and editorial constraints. It may produce title, deck,
sections, and exact claim references. Unknown claims, changed hashes, authority
fields such as publish/approval/decision, or unstructured output are rejected.

The writer must not research, adjudicate evidence, choose publishability, or
release content. `createStaticStoryWriterProvider()` is deterministic test/demo
code only; no paid writing API is integrated.

## Scanner and dispatch

`tools/apps-script/incoming-intel-scanner.gs` is deployment source only; it is
not installed. Its target is a roughly 15-minute time trigger, never `onEdit`.
It uses `getDisplayValues()`, a short ScriptLock overlap guard, unique-ID and
`record_type=event` quarantine, per-row content/evidence hashes, HMAC signing,
bounded retries, strict durable acknowledgment validation, and a row re-read
before acknowledging.

Workflow writeback fields are excluded from both hashes, preventing processor
writeback from redispatching a row. A scanner POST carries identifiers,
positions, and hashes only:

```json
{
  "contract_version": "p2-dispatch-v1",
  "dispatch_id": "disp-<id>",
  "sheet_id": "<private-sheet-id>",
  "sheet_name": "Incoming_Intel",
  "snapshot_sha256": "<hash-of-sorted-record-hashes>",
  "policy_version": "p2-shadow-policy-v2",
  "issued_at": "2026-09-13T12:00:00.000Z",
  "nonce": "<unique-nonce>",
  "records": [{
    "intel_id": "wpb-intel-2026-09-13-001",
    "record_position": 2,
    "content_hash": "<64-hex>",
    "evidence_hash": "<64-hex>"
  }],
  "signature": "<hmac-sha256>"
}
```

The processor rejects malformed schemas, bad signatures, stale dispatches,
nonce replays, changed rows, duplicate IDs, and durable dispatch replays.
Single-worker v1 is sufficient; the Apps Script lock only prevents overlapping
invocations and is not a distributed-lock design.

### Deployment instructions (not authorization)

1. Create a Sheet-bound Apps Script from the checked-in `.gs` source.
2. Set Script Properties `DISPATCH_ENDPOINT`, `DISPATCH_SECRET`, and optional
   `POLICY_VERSION=p2-shadow-policy-v2`.
3. Grant the minimum Sheet read scope; do not publish the Sheet.
4. Manually create a time-driven trigger for `scanIncomingIntel` at about
   15-minute cadence.
5. Keep the processor master/release/fact switches off during shadow soak.

These steps are intentionally not performed by this PR.

## Exception approval

Only `NEEDS_DECISION` creates a local email/review preview. It contains what
happened, exact article wording, exact fact diffs, evidence/source links, risk
reasons, and Approve/Hold/Reject choices. An approval token binds the exact
candidate SHA, evidence-bundle SHA, policy version, approver, and expiry.

GET renders only and never mutates. A valid signed review link establishes a
short-lived HttpOnly, SameSite-strict local approval session; the server also
enforces its configured approver allowlist. Mutation requires
authenticated POST (the bearer-auth API path remains available). Production
must add HTTPS `Secure` cookies at its authenticated edge. The server rejects
expired, replayed, stale, altered-candidate, changed-evidence, and changed-policy
approvals. Article and fact actions are separately scoped even when they share
one exact review object; approving one cannot advance the other. Any copy or
fact change creates a new candidate SHA and invalidates earlier approval. No
email is sent in shadow mode.

## Local verification

```bash
npm run test:intel:phase-a
npm run test:p2:shadow
npm run p2:shadow:demo
npm run typecheck
npm run build
npm run qa:gatekeeper
```

To evaluate an authorized private export without committing it:

```bash
npm run p2:shadow:snapshot -- --csv /absolute/private/incoming-intel.csv
```

The snapshot command reveals no source path, writes only to a temporary private
runtime root, and has no evidence or writing provider by default. Zero
automatic results are valid and must not be "fixed" by weakening policy.

### Current private shadow evaluation (2026-09-13)

An authorized export from the private `Incoming_Intel` Sheet was evaluated and
then removed from temporary storage; no row content or export was committed.

- 14 rows discovered;
- 12 unique event records dispatched;
- one duplicate-ID group covering two rows quarantined;
- article: 0 `AUTO_ELIGIBLE`, 0 `NEEDS_DECISION`, 10 `HOLD`, 2 `DUPLICATE`;
- fact change: 0 `AUTO_ELIGIBLE`, 0 `NEEDS_DECISION`, 7 `HOLD`, 5 `NONE`.

No current row had a separately supplied `p2-trusted-evidence-v1` bundle, so
the zero-automatic result is expected. This is dated evaluation evidence, not
a permanent claim about future Sheet state; rerun the command for current
totals.

## Proposed activation stages

1. **Shadow dispatch:** provision private snapshot transport, HMAC secret, and
   durable acknowledgment storage; install scanner trigger; no release.
2. **Evidence soak:** run the approved fact-check provider into versioned
   bundles; compare policy outcomes with human review; no release.
3. **Exception review:** host the approval page behind authenticated access and
   add an approved email sender; POST remains the only mutation.
4. **Article-only pilot:** connect validated low-risk candidates to the existing
   article publisher on a review branch with tests and live verification.
5. **Canonical-fact pilot:** connect one allowlisted field through the PR #95
   canonical propagation path with revision lock, rollback, tests, and audit.
6. **Broader automation:** expand only after measured false-positive, replay,
   stale-state, and rollback performance is accepted by Brooke.

Every stage requires separate authorization. Production credentials/settings
include a private Google Sheet credential or ingest identity, dispatch HMAC
secret, durable ack store, fact-check provider credential/version, authenticated
approval host/session, optional email sender, release GitHub credential, and
explicit off-by-default master/article/fact activation switches.
