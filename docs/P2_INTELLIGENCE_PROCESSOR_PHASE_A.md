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

---

## Follow-on integration requirement — unified project-fact maintenance

This section records the approved product direction for the **next integration slice only**. It does not change Phase A behavior or authorize Phase B, Sheet writeback, repository mutation, publication, or unattended production permissions.

The eventual intelligence system must maintain canonical project information as well as dated editorial updates. The existing Codex article-ingestion stream and the Gemini/Sheet intake stream remain valid inputs, but both must converge on one shared verification, event-identity, deduplication, and project-fact proposal contract before any repository change is considered.

### Independent outcomes

A verified event may produce three independent proposed outcomes:

1. **Dated Update/article only** — preserve the historical event without changing a current project fact.
2. **Canonical project-fact change only** — update a current fact when evidence supports the field-level change even if no standalone article is warranted.
3. **Both** — release the dated Update/article and canonical fact change coherently from the same verified evidence bundle.

A newer source is not automatically a newer underlying event. Historical articles remain dated snapshots and must not be rewritten to reflect later facts. Construction milestones must not be used to infer delivery, availability, pricing, legal status, approvals, or other unrelated state.

### Existing ingestion and canonical-data reconciliation

Before implementation of this follow-on slice, inventory the actual repository Codex ingestion entry point, its stage/publish/ship path, and any scheduled/local automation that cannot be independently inspected. Repository code must be distinguished from external jobs. Existing machinery should be reused rather than replaced.

The project-fact path must extend the existing project-data architecture and preserve reviewed overrides and their current precedence. Automated evidence may create a proposal, but must never be labeled as a human review or silently outrank a reviewed override.

### Field-level fact proposal contract

Each proposed canonical fact change must carry at least:

```ts
type CanonicalProjectFactProposal = {
  proposal_id: string;
  project_id: string;
  field: string;
  old_value: unknown;
  new_value: unknown;
  effective_date?: string;
  event_key?: string;
  supporting_claim_ids: string[];
  verification_source_ref_ids: string[];
  risk: "low" | "medium" | "high";
  review_requirement: "allowlisted_low_risk" | "human_review" | "blocked";
  supersedes_proposal_id?: string;
  rollback: {
    previous_value: unknown;
    source_revision: string;
  };
};
```

The application layer must reject stale overwrites when a proposal describes an older underlying event/effective state than the currently accepted fact, even when the reporting article itself is newer.

### Propagation contract

For every future allowlisted project field, trace the canonical source through all current-information surfaces before enabling automated application:

```text
canonical project data
→ project page
→ building cards
→ comparisons
→ corridor/discovery surfaces
→ map presentation
→ floor-plan project context
→ schema/structured data
→ feeds/AI discovery where applicable
```

The inventory must identify hardcoded current facts or derived copies that would remain stale after a canonical update. Approved propagation must occur from canonical data/generated outputs rather than page-by-page manual edits.

A required isolated regression fixture must prove that one project-field change reaches every applicable current-information surface, changes no unrelated project, and does not rewrite historical Update/article content.

### Coordinated release path

Both intake streams should ultimately use the same controlled path:

```text
Codex ingestion OR Gemini/Sheet intake
→ shared source verification
→ shared claim ledger
→ shared event identity/dedupe
→ independent outcome decision
   ├─ dated Update/article proposal
   ├─ canonical project-fact proposal
   └─ both
→ reviewed canonical data change
→ generated outputs
→ full repository tests
→ controlled deployment
→ live cross-surface consistency verification
```

The contract must prevent duplicate processing across the two intake streams and reject stale fact overwrites.

### Future unattended allowlist

The follow-on design may propose a narrow unattended allowlist only for low-risk, objectively source-backed fields whose propagation and rollback are deterministic. Candidate classes may include simple verified construction-stage markers or other factual status fields **only after field-specific evidence and propagation tests exist**.

Pricing, inventory, incentives, delivery/completion promises, financing, legal disputes, condo termination/buyouts, assessments, zoning/approval interpretation, conflicting timelines, and ambiguous entity identity remain review-required unless a later separately approved policy explicitly narrows that restriction.

Human approval of a fact proposal should trigger automatic propagation through canonical/generated surfaces; it should not require manual page-by-page editing.

### Phase A invariant

Nothing in this section changes the tested Phase A guarantee:

```text
processor repository mutations = 0
Sheet mutations = 0
Git/GitHub mutations by processor = 0
publication/deployment actions = 0
project-fact proposals apply = false
```

Implementation of this unified fact-maintenance path requires a separately reviewed integration slice after PR #89 review and does not belong in PR #86.
