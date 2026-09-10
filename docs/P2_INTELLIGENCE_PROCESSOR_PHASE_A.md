# P2 Development Intelligence Processor — Phase A

Status: **safety review passed — APPROVED / MERGED / DEPLOYED as INTERNAL TOOLING ONLY; no buyer-facing release change; Phase B remains unauthorized**
Branch: `p2-development-intelligence-processor-v1` (approved head `f5198ca5842af608828aaf9cbbc087e83e57fbfd`)
Implementation base: released production main after PR #86 (`2d0175eed5157afa58b57cfb8327ec590e2dda95`); current production main is `baac91f5aa1a25d1013dcc762528cad558668512` after the one normal PR #89 deploy.

## Purpose

Phase A turns one or more explicitly selected `Incoming_Intel` event rows into deterministic local review artifacts. It does **not** write to Google Sheets, repository canonical data, GitHub, or production. Verified source revision `7953d4a66e13b37e4d9ffc02447ca19735d603bf` passes the focused 45-test safety set, typecheck, four offline rows, bundle-hash and unchanged-canonical checks. The approved head `f5198ca5842af608828aaf9cbbc087e83e57fbfd` also passed its four final CI workflows and 12 jobs: [34531981015](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34531981015), [34531981157](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34531981157), [34531981206](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34531981206) and [34531981031](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34531981031). It merged as `baac91f5aa1a25d1013dcc762528cad558668512` and deployed once at `https://05e16046.wpbnewconstruction.pages.dev`; buyer-facing bundles are unchanged. The earlier source-revision CI runs remain historical in the [compact safety acceptance](evidence/intel-phase-a-safety-2026-09-10/acceptance.json). Full runtime records remain under `.runtime/intel-safety-review-2026-09-10/`.

```bash
npm run intel:process -- --row <intel-id>
```

For deterministic fixture/offline verification:

```bash
npm run intel:process -- --csv research/intel-fixtures/current-intel.csv --offline --row <intel-id>
```

Multiple `--row` arguments are allowed. The processor reads only the selected IDs.

## Allowed output

Only these six fixed files, under a validated ID:

```text
.runtime/intel/<validated-intel-id>/
  intake-snapshot.json
  claim-ledger.json
  candidate.json
  validation-report.json
  validation-report.md
  manifest.json
```

Generated runtime artifacts are evidence only and are not committed.

`intel-id` must match `[A-Za-z0-9][A-Za-z0-9_-]{0,127}`; path traversal,
absolute, encoded, empty, and typed-invalid IDs fail before input reads or
writes. The writer validates the canonical workspace → `.runtime` → `intel` →
ID chain and rejects symlink ancestors/targets plus symlink, non-regular, or
hard-linked artifact files. It uses exclusive temporary files and per-file
atomic renames; it never recursively deletes or removes a runtime/repository
root. A bundle is not whole-bundle atomic, so interruption can leave partial
files and consumers must verify the manifest. This is bounded to one trusted
local worker; Node path APIs do not provide an openat-style guarantee against a
concurrent hostile filesystem race.

## Pipeline

```text
selected row
→ immutable normalized snapshot
→ SHA-256 snapshot identity
→ structural / record-type validation
→ project/corridor relationship normalization
→ lead/source hint normalization
→ independent source classification/read-only fetch (unadjudicated)
→ separate trusted local evidence review API when supplied
→ claim ledger
→ deterministic event-key derivation
→ supplied-vs-derived event-key comparison
→ repository event/content dedupe scan
→ chronology/conflict scan
→ independent output recommendation
→ DevelopmentUpdateCandidate or null duplicate
→ optional article candidate
→ optional project-fact diff proposal (never applied)
→ validation report + manifest
```

## Source evidence boundary

`verifySourceHint` applies bounded HTTP(S) retrieval, redirect, DNS, private-address,
timeout, and byte checks, then records the fetched URL, content hash, source
revision, and retrieval attestation. A fetched source remains `unadjudicated`:
HTTP success, reachability, source tier, and any intake `claims_supported` value
do not support a claim. Source bytes are used only through the recorded digest.

`applyTrustedEvidence` is a separate local review API
(`research/scripts/intel/normalizer.mjs:338-494`). Each accepted record must bind
the exact intake snapshot hash, claim ID or exact field/type/value/text, one or
more exact verification source references, fetched source content hash/revision,
and reviewer plus valid review time. It accepts explicit supported, conflicted,
or unsupported decisions and rejects unbound records. The CLI exposes only row,
CSV, and offline inputs (`research/scripts/intel/process-intel.mjs:9-21`); it does
not activate adjudication. `trustedEvidence` is an injected local dependency for
a separately controlled review harness, not an unattended CLI input.

## Safety rules

- `record_type` must equal `event`; no inference from other cells.
- `status`, `verification_status`, and `output_decision` are independent.
- `requires_human_review=TRUE` cannot be cleared in Phase A.
- confidence cannot override evidence/risk/editorial gates.
- `primary_source_url` is a source hint; hostname/source type is independently classified.
- source/headline/body instructions are inert data and cannot alter processor policy.
- only HTTP(S) source URLs are accepted; credentials embedded in URLs are rejected.
- pricing, inventory, legal/termination, financing, approvals/zoning/permits, and chronology conflicts preserve or strengthen human review.
- duplicate/additional-source/human-review are successful processor outcomes, not process errors.
- unsupported material claims or a `human_review` recommendation produce
  `candidate: null`; the report retains held claims and raw relationships remain
  in the immutable snapshot while normalized claim relationships stay separate.
- project-fact proposals always have `apply: false`; supported proposals remain
  pending human review and unsupported/conflicting proposals are held; Phase A
  never edits canonical facts.

## Current four-row expected behavior

| Intel ID | Expected dedupe | Expected recommendation |
| --- | --- | --- |
| `wpb-intel-2026-09-08-001` | `conflicting_event` | `human_review` |
| `wpb-intel-2026-09-09-001` | existing 464 Fern overlap / duplicate | `human_review` |
| `wpb-intel-2026-09-09-002` | event-specific result | `human_review` |
| `wpb-intel-2026-09-09-003` | event-specific result | `human_review` |

No current row is an approved publishing pilot.

## South Flagler mandatory fixtures

Canonical event:

```text
project|south-flagler-house|construction|topping-out|2025-11
```

A later report of the same top-out resolves to the same event and produces `duplicate` or `additional_source`, with no new Update/article/project-fact mutation.

A later `15th floor` claim is chronologically inconsistent with the verified November 2025 full structural top-out. It produces `conflicting_event` + `ERR_TEMPORAL_CONFLICT` + `human_review`; article generation is blocked and project facts remain unchanged.

## Idempotency

Semantic identity is based on:

```text
Sheet row snapshot
+ repository/index state
+ processor version
```

The report emits SHA-256 values for row snapshot, claim ledger, event identity, and semantic candidate payload. Read-time telemetry (`accessed_at`, HTTP status/reachability/content-type) is excluded from the semantic candidate hash, so the same evidence meaning remains stable across runs.

## Repository dedupe inputs

Phase A reads existing canonical/reviewed sources without modifying them:

- `research/news-review/approved-development-news.json`
- `src/data/approvedExternalNews.ts`
- `src/data/importedUpdates.json` when present
- `content/overrides/project-fact-overrides.json`
- optional `.runtime/intel/open-pr-index.json` when a harness supplies review-only PR metadata

Event identity, chronology, project/corridor relationships, and content overlap are used together; title/slug equality is never the only dedupe key.

The approved-news JSON, reviewed project-fact-overrides JSON, and generated
news TypeScript input are required: missing or unreadable inputs, invalid JSON
in the JSON files, or an invalid expected shape fail closed with
`ERR_REPOSITORY_INDEX`. The imported
updates and open-PR indexes are optional only when absent; if present, they
must still parse and match their expected array shape or fail closed. Each
index revision is hashed into the report.

## Error taxonomy

Machine-readable codes include:

- `ERR_INELIGIBLE_RECORD_TYPE`
- `ERR_MISSING_REQUIRED_FIELD`
- `ERR_ENTITY_AMBIGUOUS`
- `ERR_EVENT_KEY_CONFLICT`
- `ERR_EVIDENCE_CONFLICT`
- `ERR_UNSAFE_SOURCE`
- `ERR_TEMPORAL_CONFLICT`
- `ERR_REPOSITORY_INDEX`
- `ERR_UNSAFE_INTEL_ID`
- `ERR_UNSAFE_INTEL_ARTIFACT`
- `ERR_REVIEW_SNAPSHOT_BINDING` / `ERR_REVIEW_CLAIM_BINDING`
- `ERR_REVIEW_SOURCE_BINDING` / `ERR_REVIEW_CONTENT_BINDING`

Normal editorial/dedupe outcomes are not errors.

## Phase B — not authorized

A later separately approved Phase B may take an accepted Phase A bundle, create a dedicated branch, make repository changes, run tests, open a DRAFT PR, and perform allowlisted Sheet writeback. It still must not auto-merge or auto-deploy.

Phase A contains **none** of those side effects.
---
## Follow-on integration boundary — conditional, not active

See [P2 Intelligence Convergence Design](P2_INTELLIGENCE_CONVERGENCE_DESIGN.md) for the shared Codex/article and Gemini/Sheet contract. This future slice does not change Phase A or authorize Sheet writeback, fact application, publication, repository mutation, Git/GitHub automation, or deployment.

The PR #89 merge precondition is now met: the approved internal-tooling head is in production current main `baac91f5aa1a25d1013dcc762528cad558668512`, and its buyer-facing bundles match the PR #93 baseline. The separate Batch 6 live-pass precondition is not met because a fresh first-visit consent surface still owns the mobile map Zoom-out center and covers the launcher. Candidate branch `fix/batch6-consent-control-ownership` is not release-approved or deployed. No Phase B activation follows from the #89 merge.

The eventual controlled path is:
```text
Codex ingestion OR Gemini/Sheet intake
→ shared source verification and claim ledger
→ event identity, dedupe, chronology/conflict, and risk decision
→ independent dated-article and canonical-fact proposals
→ human-reviewed canonical change
→ generated surfaces and controlled verification
```

A verified event may produce an Update/article proposal, a canonical project-fact proposal, both, or neither. A newer source is not automatically a new event; historical Update/article content remains a dated snapshot. Construction milestones must not infer delivery, availability, pricing, legal status, approvals, or unrelated state.

Current fact proposals remain `apply: false`, pending human review when supported and held when unsupported or conflicting. The existing canonical model, resolver, accessors, and reviewed precedence remain the authority. `content/overrides/project-fact-overrides.json` is the existing Brooke-reviewed/manual JSON target only; future automated facts must preserve explicit automated/source provenance and must not write into or impersonate that override layer. No automated authority slot or new database is activated here.

After separate approval of the next slice, one disposable single-field propagation proof must cover project pages, cards, comparisons, corridor/discovery, map, floorplan context, schema, feeds, and AI outputs without rewriting historical articles or unrelated projects. Activation/application requires separate approval of the proposal schema, field allowlist, review owner, stale-revision handling, provenance model, and proof results.
