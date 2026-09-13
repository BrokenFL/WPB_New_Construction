# P2 Cloud Handoff + Approval Proof — Design & Local Prototype

Status: **design + local prototype only**. Nothing in this slice is deployed,
scheduled, or activated. No Sheet writes, no emails sent, no automated content
PRs, no fact application, no publication.

Branch: `p2-intel-cloud-handoff-approval` (temporary dependency on PR #97 —
`fix/intel-ambiguous-row-selection` — for the `ERR_AMBIGUOUS_INTEL_ID` guard;
rebase onto `main` once #97 merges).

## Product direction

Exception-based automation with **two independent outputs per verified event**:

- `article_decision` — may a dated update/article publish?
- `fact_change_decision` — may canonical project-fact mutations proceed?

A verified event may produce an article only, a fact change only, both, or
neither. Canonical fact changes flow through the existing PR #95
reviewed-fact/public projection architecture — never direct page edits, never
a competing project database, never rewriting historical articles.

## Pipeline

```
Incoming_Intel Sheet (private)
  └─ Apps Script scanner (~15 min time trigger, NOT onEdit)
       content_hash + evidence_hash per record; writeback fields excluded
       ambiguous IDs + non-event records → quarantined, never dispatched
       └─ HMAC-signed dispatch envelope (identifiers + hashes only)
            └─ runner: verify signature/nonce/age → bind snapshot by sha256
                 └─ Phase A processRow (unchanged safety contract)
                      └─ trusted evidence binding (snapshot/claims/source revisions)
                           └─ policy engine → article_decision + fact_change_decision
                                └─ private review queue (.runtime/p2/, idempotency-keyed)
                                     ├─ AUTO_ELIGIBLE → mocked release plan
                                     ├─ NEEDS_DECISION → email preview + protected approval page
                                     ├─ HOLD → held, needs resolution
                                     └─ DUPLICATE → rejected
```

## Modules (`research/scripts/p2/`)

- `dispatch.mjs` — HMAC-SHA256 envelope, nonce replay protection, 15-min
  freshness window, content-derived `dispatch_id`, durable ack store,
  idempotency key = sha256(event_key + candidate_sha256 + policy_version).
- `evidence-review.mjs` — binds review results to exact snapshot hash, claim
  set hash, source revision hash, reviewer identity/type, review time, policy
  version. HTTP 200 / Sheet "verified" / model agreement / confidence_score are
  metadata only — never claim approval.
- `policy-engine.mjs` — `AUTO_ELIGIBLE | NEEDS_DECISION | HOLD | DUPLICATE`.
  HOLD = integrity problems (errors, conflicts, ambiguous identity).
  NEEDS_DECISION = valid but requires authorized review (sensitive flags,
  `requires_human_review`, unbound review, warnings, human-required fact
  fields). AUTO_ELIGIBLE = all requirements met.
- `fact-mutation.mjs` — mutation records carry project_id, field, current,
  proposed, supporting claims, verification sources, effective date, evidence
  hashes, risk classification, provenance, rollback ref. AUTO-FACT allowlist:
  `status`, `toppingOut`, `groundbreaking`, `completionStatus`, `name`,
  `residenceCount`, `floorCount`. Human-required: `deliveryTiming`, `pricing`,
  `inventory`, `incentives`, `hoaFees`, `salesPace`, `financing`, `legal`,
  `termination`, `zoning`, `approvalStatus`, and any unknown field.
- `review-queue.mjs` — consolidated private queue, idempotency-keyed; approval
  bound to exact candidate_sha256; expired/stale/repeated approvals rejected.
- `email-preview.mjs` — local preview files only (`.runtime/p2/email-previews/`).
- `approval-server.mjs` — local 127.0.0.1 prototype: Bearer auth, GET never
  mutates, POST-only approve/hold/reject, HMAC tokens with expiry.
- `release-adapter.mjs` — `enabled: false`; emits the release plan and the
  field-limited writeback payload (`status`, `output_decision`,
  `site_update_id`, `canonical_update_url`, `published_at`, `processed_at`,
  `processor_version` — never research fields; `published_at` stays empty until
  live acceptance).
- `shadow-run.mjs` — orchestrator; `shadow-snapshot.mjs` — runs a real snapshot
  offline; `demo.mjs` — 4-scenario end-to-end demo.

## Apps Script scanner (`tools/apps-script/incoming-intel-scanner.gs`)

- Time-driven trigger (~15 min), not `onEdit` — API/script writes don't
  reliably fire it.
- Per-record `content_hash` (intake fields) and `evidence_hash` (review
  fields); `WRITEBACK_FIELDS` excluded so processor writeback can't
  self-trigger.
- Ambiguous IDs quarantined as a set; `record_type != event` quarantined;
  unrelated valid records still dispatch.
- Dispatches identifiers + hashes only. Private row content travels via the
  authorized snapshot channel below.
- Bounded retries (3, backoff); Script Properties updated only after durable
  ack.

## Snapshot transport (how the runner gets private data)

The dispatch carries `snapshot_sha256`. The runner obtains the CSV through an
**authorized private channel** — in this prototype, a local file
(`--csv .runtime/inputs/incoming-intel.csv`) whose bytes must hash to
`snapshot_sha256`. Production options, in preference order:

1. Apps Script posts the CSV body to a private ingest endpoint (HTTPS, same
   HMAC secret) alongside the dispatch — runner verifies hash before use.
2. Runner fetches the gviz CSV export using a Google service-account credential
   stored locally (never in the envelope, issues, or logs).

ChatGPT/Codex/Devin credentials do not transfer to the runner. The Sheet stays
private — it is never published to solve authentication.

## Approval contract

- Email preview shows: what changed, exact public wording, sources, exact fact
  diff, and a single review link.
- Review page: server-side Bearer auth, renders exact candidate version,
  mutations only via protected POST.
- Approvals bind to `candidate_sha256`; expired, repeated, or stale approvals
  rejected; GET/link previews never mutate; changed wording never inherits an
  earlier approval.
- A reply requesting edits creates a revision — never blanket release consent.
- Existing explicit human-review holds require the authorized review step.

## Release path (design/test only — disabled)

candidate → allowlisted content diff (existing publisher libraries) →
required tests → exact-revision approval/policy check → controlled merge →
one normal deployment → live verification → status writeback.

Caution: a push made with `GITHUB_TOKEN` may not trigger the normal deployment
workflow — the GitHub auth/event chain must be tested before activation.

## Verified results (2026-09-12)

- `node --test research/scripts/p2/p2.test.mjs`: **14/14 pass**
- `npm run test:intel:phase-a`: **54/54 pass** (no regressions)
- `npm run typecheck`: clean; `npm run qa:gatekeeper`: pass
- Real snapshot shadow run (`incoming-intel.csv`, sha256 `dd02ffd9…`):
  12 unique event rows → **0 AUTO_ELIGIBLE** (all HOLD — no bound trusted
  evidence exists offline; rules were not lowered), 1 ambiguous ID
  (`wpb-intel-2026-09-10-001`) quarantined, queue deduped 12 rows → 11 entries.
- Demo (`demo.mjs`): auto-eligible → `auto_eligible_pending_release` + preview;
  approval-required → `pending_review` + preview; duplicate → `rejected`;
  conflicting → `held`.

## Activation requirements (proposed, not implemented)

- **Credentials:** Google service account (Sheet read) or Apps Script ingest
  endpoint; `DISPATCH_SECRET` (HMAC); approval `APPROVER_SECRET`; email sender
  credential (e.g. existing SMTP/API — no new paid model service assumed).
- **Services:** Apps Script trigger install (manual), private ingest endpoint
  or local runner with Sheet access, approval page host (can stay local or
  behind the existing Cloudflare Access tunnel).
- **Switches:** `P2_ENABLED` (master), `P2_AUTO_RELEASE` (AUTO_ELIGIBLE
  release), `P2_AUTO_FACT` (allowlisted fact mutation) — all default off.
- **Policy approval:** `POLICY_VERSION` must be reviewed and approved by Brooke
  before live activation; version bumps invalidate prior approvals.
- **Ownership:** one processing owner (the coding-agent review job) assembles
  validated local review bundles; the two GitHub issue-producer workflows are
  redundant with this queue and should be retired once the scanner is live.
