# P2 Development Intelligence Processor — Phase A

Status: **implementation review only — zero external side effects**  
Branch: `p2-development-intelligence-processor-v1`  
Base: production main after Batch 6C / PR #87 (`c568746b545804bfab48cda8a9e7f214ddda9d36`)

## Purpose

Phase A turns one or more explicitly selected `Incoming_Intel` event rows into deterministic local review artifacts. It does **not** write to Google Sheets, repository canonical data, GitHub, or production.

```bash
npm run intel:process -- --row <intel-id>
```

For deterministic fixture/offline verification:

```bash
npm run intel:process -- --csv research/intel-fixtures/current-intel.csv --offline --row <intel-id>
```

Multiple `--row` arguments are allowed. The processor reads only the selected IDs.

## Allowed output

Only:

```text
.runtime/intel/<intel-id>/
  intake-snapshot.json
  claim-ledger.json
  candidate.json
  validation-report.json
  validation-report.md
  manifest.json
```

Generated runtime artifacts are evidence only and are not committed.

## Pipeline

```text
selected row
→ immutable normalized snapshot
→ SHA-256 snapshot identity
→ structural / record-type validation
→ project/corridor relationship normalization
→ lead/source hint normalization
→ independent source classification/read-only verification
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
- project-fact proposals always have `apply: false`; Phase A never edits canonical facts.

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
- `src/data/projectFactOverrides.ts`
- optional `.runtime/intel/open-pr-index.json` when a harness supplies review-only PR metadata

Event identity, chronology, project/corridor relationships, and content overlap are used together; title/slug equality is never the only dedupe key.

## Error taxonomy

Machine-readable codes include:

- `ERR_INELIGIBLE_RECORD_TYPE`
- `ERR_MISSING_REQUIRED_FIELD`
- `ERR_ENTITY_AMBIGUOUS`
- `ERR_EVENT_KEY_CONFLICT`
- `ERR_EVIDENCE_CONFLICT`
- `ERR_UNSAFE_SOURCE`
- `ERR_TEMPORAL_CONFLICT`

Normal editorial/dedupe outcomes are not errors.

## Phase B — not authorized

A later separately approved Phase B may take an accepted Phase A bundle, create a dedicated branch, make repository changes, run tests, open a DRAFT PR, and perform allowlisted Sheet writeback. It still must not auto-merge or auto-deploy.

Phase A contains **none** of those side effects.
