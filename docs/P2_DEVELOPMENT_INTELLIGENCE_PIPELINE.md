# P2 Development Intelligence Pipeline

Status: **planning / implementation-ready design only — no processor side effects authorized**  
Branch: `planning/p2-development-intelligence-pipeline`  
Production base at planning start: `0713e029cc251fc9a49c5e429fdda6ac85e46202`  
Google Sheet: `Incoming_Intel — Tracked Development Updates` (`1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8`)

This document defines the safe V1 development-intelligence processor contract. The Sheet is an **untrusted intake/control plane**. Reviewed repository data remains canonical. Phase A is dry-run/local-candidate generation only. Nothing here authorizes Sheet mutation, GitHub PR creation, push, merge, public publication, project-fact mutation, or deployment.

---

## 1. Current Sheet reconciliation — API verified

The previous API-visibility blocker is resolved. A fresh read of the exact configured spreadsheet now exposes `Incoming_Intel` as **46 columns** with **1 header row + 4 event rows**.

### 1.1 Current 46-column header

```text
id
status
created_at
headline
project_name
related_project_slug
corridor
article_type
category
summary
material_updates
why_it_matters
buyer_angle
source_name
source_url
source_published_date
source_quality
confidence_score
recommended_status
flags_json
requires_human_review
article_body
seo_title
seo_description
social_copy
processed_at
pr_url
review_notes
last_updated
record_type
event_key
output_decision
verification_status
verification_summary
site_update_id
canonical_update_url
published_at
processor_version
processing_started_at
claimed_by
claim_token
lease_expires_at
lead_source_url
primary_source_url
related_project_ids
related_corridor_ids
```

The 17 migration-era fields now visible are:

```text
record_type
event_key
output_decision
verification_status
verification_summary
site_update_id
canonical_update_url
published_at
processor_version
processing_started_at
claimed_by
claim_token
lease_expires_at
lead_source_url
primary_source_url
related_project_ids
related_corridor_ids
```

All four visible rows currently have `record_type=event` and `processor_version=v2.0-reconciled`.

### 1.2 Actual observed row states

| ID | Subject | status | event_key | output_decision | verification_status | related projects | related corridors |
|---|---|---|---|---|---|---|---|
| `wpb-intel-2026-09-08-001` | South Flagler House | `needs_review` | `project|south-flagler-house|construction|topping-out|2025-11` | `human_review` | `conflicting` | `south-flagler-house` | `south-flagler` |
| `wpb-intel-2026-09-09-001` | 464 Fern | `needs_review` | `project|464-fern-street|municipal|site-plan-filing|2026-09-08` | `human_review` | `verified` | `464-fern-street` | `downtown` |
| `wpb-intel-2026-09-09-002` | Portofino South | `needs_review` | `project|portofino-south-buyout|acquisition|buyout-extension|2026-09-09` | `human_review` | `verified` | `portofino-south-buyout` | `south-flagler` |
| `wpb-intel-2026-09-09-003` | Downtown Master Plan | `needs_review` | `municipal|wpb-downtown-zoning|dac-vote|2026-09-09` | `human_review` | `verified` | `915-s-dixie,534-datura` | `downtown,south-flagler` |

### 1.3 Current provenance observations

The Sheet exposes flat intake hints:

```text
source_url
lead_source_url
primary_source_url
```

These fields are not canonical evidence objects and their names do not confer source authority.

Examples from the current cells:

- South Flagler `primary_source_url` points to Florida YIMBY's November 2025 topping-out report while the lead source is the project site.
- 464 Fern currently has the same Discover South Florida URL in both `lead_source_url` and `primary_source_url`. That does **not** make it a municipal Tier 1 record.
- Portofino South uses The Real Deal for both lead and primary-source hints; its sensitivity still forces human review.
- Downtown Master Plan uses the Yahoo/Palm Beach Post story as both lead and primary-source hints; municipal/policy claims still require independent official-record verification where claim type demands it.

The processor must classify source type/tier independently.

---

## 2. Core semantic contracts

### 2.1 Record type is explicit

V1 event-processor eligibility requires:

```ts
row.record_type === "event"
```

No inference from article type, populated event key, project columns, or prose is permitted.

If future master/project rows appear in the same table:

```text
record_type=project
```

must fail closed from event publishing/candidate generation with `ERR_INELIGIBLE_RECORD_TYPE`.

### 2.2 Verification is not publishability

These answer different questions:

```text
verification_status = evidence state
output_decision     = editorial/publication recommendation
status              = queue/workflow state
```

Therefore:

```text
verification_status=verified
```

does **not** imply a publishable output. A fully verified event may remain `human_review` because of legal sensitivity, pricing, regulatory significance, entity ambiguity, multi-project effects, or editorial judgment.

`requires_human_review=TRUE` is authoritative for V1 unless a separate explicit human/editorial action clears it. Phase A has no authority to clear it.

`confidence_score` is triage context only and cannot override evidence or human-review gates.

### 2.3 Single-worker V1

Phase A is manually invoked against explicit row IDs and assumes a single processor execution. The lease/claim columns are read-only audit inputs in Phase A. Do not implement distributed locking. If a future scheduled/multi-worker processor is approved, add a trusted mutex such as Apps Script `LockService` or another transactional mechanism.

---

## 3. Phase A CLI contract — dry run only

Target command:

```bash
npm run intel:process -- --row <intel-id>
```

Multiple explicit rows may later be allowed by repeating `--row`, but the first implementation should optimize for one selected row at a time.

### 3.1 Accepted arguments

```text
--row <intel-id>          required; exact Sheet id
--out <directory>         optional; default .runtime/intel/<intel-id>/
--fixture <path>          test-only; replace live Sheet/source adapters with fixture adapters
--offline                 optional test/dev mode; fail if evidence is not already fixture-cached
--verbose                 optional diagnostic logging
```

Not accepted in Phase A:

```text
--write-sheet
--publish
--push
--open-pr
--merge
--deploy
```

Unknown mutating flags must fail closed.

### 3.2 Phase A pipeline

```text
selected Sheet row
  -> exact-row read
  -> immutable intake snapshot + SHA-256 hash
  -> schema / record_type validation
  -> project + corridor resolution
  -> source-hint normalization
  -> independent verification adapter
  -> claim extraction + claim ledger
  -> event-key derivation
  -> compare Sheet event_key vs derived event_key
  -> dedupe scan across trusted repository indexes
  -> chronology/conflict checks
  -> output-decision recommendation
  -> DevelopmentUpdate candidate JSON (if structurally meaningful)
  -> optional article candidate JSON
  -> optional project-fact diff proposal JSON
  -> validation/report bundle
  -> process exit code
```

Phase A writes **only local `.runtime` artifacts**. It does not mutate the repository or Sheet.

---

## 4. Proposed Phase A source files

```text
src/data/developmentUpdates.ts
src/types/developmentIntelligence.ts

research/scripts/intel/process-intel.mjs
research/scripts/intel/sheet-adapter.mjs
research/scripts/intel/validate-intake.mjs
research/scripts/intel/resolve-entities.mjs
research/scripts/intel/source-verifier.mjs
research/scripts/intel/claim-ledger.mjs
research/scripts/intel/event-key.mjs
research/scripts/intel/dedupe-index.mjs
research/scripts/intel/decision-engine.mjs
research/scripts/intel/candidate-writer.mjs
research/scripts/intel/error-taxonomy.mjs

research/intel-fixtures/south-flagler-topping-out/
research/intel-fixtures/464-fern/
research/intel-fixtures/portofino-south/
research/intel-fixtures/downtown-master-plan/

research/scripts/intel/process-intel.test.mjs
research/scripts/intel/event-key.test.mjs
research/scripts/intel/dedupe-index.test.mjs
research/scripts/intel/decision-engine.test.mjs
research/scripts/intel/source-verifier.test.mjs
```

Phase A does **not** add `content/updates/development-updates.json` as a production-write target. The dry-run processor may read an existing canonical registry if one exists or use an empty trusted registry fixture, but it must emit candidate files only under `.runtime`.

`package.json` receives only the non-mutating command:

```json
{
  "scripts": {
    "intel:process": "node research/scripts/intel/process-intel.mjs"
  }
}
```

---

## 5. TypeScript/data contracts

### 5.1 Intake snapshot

```ts
type IntelligenceIntakeSnapshot = {
  spreadsheet_id: string;
  sheet_name: "Incoming_Intel";
  row_number: number;
  fetched_at: string;
  row_hash_sha256: string;
  row: {
    id: string;
    record_type: "event" | "project" | string;
    status: string;
    created_at: string;
    headline: string;
    project_name: string;
    related_project_slug: string;
    corridor: string;
    article_type: string;
    category: string;
    summary: string;
    material_updates: string;
    why_it_matters: string;
    buyer_angle: string;
    source_name: string;
    source_url: string;
    source_published_date: string;
    source_quality: string;
    confidence_score: string;
    recommended_status: string;
    flags_json: string;
    requires_human_review: string;
    article_body: string;
    review_notes: string;
    event_key: string;
    output_decision: string;
    verification_status: string;
    verification_summary: string;
    processor_version: string;
    lead_source_url: string;
    primary_source_url: string;
    related_project_ids: string;
    related_corridor_ids: string;
  };
};
```

The original row object is immutable within a processing run.

### 5.2 Canonical provenance candidate

```ts
type LeadSource = {
  url: string;
  source_name?: string;
  discovered_via: "sheet" | "manual" | "fixture";
};

type VerificationSource = {
  source_ref_id: string;
  url: string;
  source_name: string;
  source_tier: 1 | 2 | 3 | 4 | 5;
  published_date?: string;
  accessed_at: string;
  source_type:
    | "government"
    | "developer"
    | "project"
    | "filing"
    | "court"
    | "journalism"
    | "trade"
    | "aggregator"
    | "social"
    | "other";
  claims_supported: string[];
};
```

`primary_source_url` is merely a URL hint. The verifier derives `source_type` and `source_tier`; it never sets Tier 1 because a Sheet column is named `primary_source_url`.

### 5.3 Claim evidence

```ts
type ClaimEvidence = {
  claim_id: string;
  normalized_claim: string;
  claim_type:
    | "construction_milestone"
    | "project_identity"
    | "design"
    | "unit_count"
    | "height"
    | "site_plan"
    | "approval"
    | "zoning"
    | "permit"
    | "pricing"
    | "inventory"
    | "delivery"
    | "financing"
    | "legal"
    | "condo_termination"
    | "assessment"
    | "other";
  risk: "low" | "medium" | "high";
  source_ref_ids: string[];
  verification_status: "verified" | "attributed" | "conflicting" | "unsupported";
  chronology?: {
    event_date?: string;
    conflicts_with_event_key?: string;
    notes?: string;
  };
  notes?: string;
};
```

### 5.4 DevelopmentUpdate candidate

```ts
type DevelopmentUpdateCandidate = {
  schema_version: "1.0";
  candidate_id: string;              // deterministic from intake id + row hash
  update_id_candidate: string;       // stable proposal, not yet canonical
  event_key: string;
  event_key_source: "derived" | "sheet_confirmed" | "sheet_conflict";
  headline: string;
  event_date?: string;

  related_project_ids: string[];
  related_corridor_ids: string[];
  category: string;
  recommended_output:
    | "project_update_only"
    | "standalone_article"
    | "new_project_candidate"
    | "human_review"
    | "duplicate"
    | "reject";

  summary: string;
  material_updates: string[];
  buyer_context?: string;

  lead_source: LeadSource;
  verification_sources: VerificationSource[];
  claim_evidence: ClaimEvidence[];
  verification_status: "unverified" | "partially_verified" | "verified" | "conflicting" | "unsupported";
  verification_summary: string;
  risk_flags: string[];
  requires_human_review: boolean;

  dedupe: DedupeResult;
  sheet_intel_ids: string[];
};
```

Candidate generation does not imply publishability.

### 5.5 Optional article candidate

```ts
type ArticleCandidate = {
  event_key: string;
  suggested_slug: string;
  headline: string;
  dek?: string;
  body_sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
  source_ref_ids: string[];
  blocked_claim_ids: string[];
  status: "candidate" | "blocked_human_review";
};
```

Raw Sheet `article_body`, SEO copy, and social copy may be used as untrusted drafting hints but may not be copied into a public artifact without claim validation.

### 5.6 Optional project-fact proposal

```ts
type ProjectFactDiffProposal = {
  project_id: string;
  field: string;
  current_value: unknown;
  proposed_value: unknown;
  supporting_claim_ids: string[];
  source_ref_ids: string[];
  risk: "low" | "medium" | "high";
  recommendation: "consider" | "human_review" | "blocked";
};
```

Phase A never applies the diff.

---

## 6. Event identity contract

Event identity is independent of headline/source wording.

Namespaces:

```text
project|<project-id>|<domain>|<event-action>|<date-or-bucket>
corridor|<corridor-id>|<domain>|<event-action>|<date-or-bucket>
municipal|<policy-or-case-id>|<event-action>|<date-or-bucket>
```

Multi-entity events use relationship arrays rather than forcing ownership into the event key.

Example:

```text
municipal|wpb-downtown-zoning|dac-vote|2026-09-09
related_project_ids=[915-s-dixie,534-datura]
related_corridor_ids=[downtown,south-flagler]
```

The processor independently derives an event key and compares it to the Sheet-provided key:

```text
exact match        -> sheet_confirmed
same event semantic normalization -> sheet_confirmed after normalization notes
material mismatch  -> sheet_conflict + HUMAN_REVIEW
missing Sheet key  -> derived; never silently write back in Phase A
```

---

## 7. Dedupe indexes

Build read-only indexes before candidate generation.

### Required indexes

1. **Canonical development-update index**
   - by `event_key`
   - by `update_id`
   - by source canonical URL
   - by related project/corridor + event type + event date bucket

2. **Approved development-news index**
   - `research/news-review/approved-development-news.json`
   - normalize public article event semantics, project/address, date and source URLs

3. **Generated public-news index**
   - `src/data/approvedExternalNews.ts`
   - used as a consistency check against approved source data, not as a second canonical source

4. **Imported update index**
   - `src/data/importedUpdates.json` if present/current

5. **Project-fact index**
   - canonical project records
   - source ledgers
   - `projectFactOverrides.ts`
   - known milestone/date facts

6. **Published-route index**
   - existing `/updates/<slug>/` routes
   - sitemap/feed entries where useful

7. **Open-work index**
   - Phase A: fixture/local prior-run manifests only
   - Phase B: open PR metadata/branch markers keyed by `sheet_intel_id`, `row_hash`, and `event_key`

### Dedupe result

```ts
type DedupeResult = {
  classification:
    | "new_event"
    | "additional_source"
    | "material_update"
    | "existing_known_fact"
    | "duplicate"
    | "conflicting_event";
  matched_event_key?: string;
  matched_update_ids: string[];
  matched_article_paths: string[];
  matched_project_fact_refs: string[];
  reason: string;
};
```

---

## 8. South Flagler mandatory regression fixture

Canonical real-world event:

```text
project|south-flagler-house|construction|topping-out|2025-11
```

Current intake row:

```text
id=wpb-intel-2026-09-08-001
status=needs_review
record_type=event
output_decision=human_review
verification_status=conflicting
```

The Sheet's verification summary correctly records that the September 2026 “15th floor” claim is chronologically incompatible with the verified November 2025 28-story top-out and appears cross-attributed/outdated.

### Fixture A — later report of same top-out

Expected:

```text
derived event_key = project|south-flagler-house|construction|topping-out|2025-11
dedupe.classification = additional_source OR duplicate
DevelopmentUpdate create delta = 0
article create delta = 0
project-fact mutation delta = 0
recommended_output = duplicate OR human_review if evidence itself conflicts
```

### Fixture B — later “15th floor” claim

Expected:

```text
chronology check finds known full top-out in 2025-11
claim.verification_status = conflicting
dedupe.classification = conflicting_event
recommended_output = human_review
article candidate = blocked_human_review
project-fact proposal = absent OR blocked
repository mutation delta = 0
```

This is correct processor behavior, not an ingestion failure.

---

## 9. Decision engine

Decision precedence:

```text
security/schema/record-type failure -> reject/error
confirmed duplicate/no-op           -> duplicate
new/uncertain entity identity       -> human_review or new_project_candidate
requires_human_review=TRUE          -> human_review
legal/pricing/inventory/financing/termination/regulatory risk -> human_review
conflicting material claims         -> human_review
verified low-risk new event         -> project_update_only candidate
verified substantive low-risk event -> standalone_article candidate
otherwise                            -> human_review
```

Important invariants:

```text
verification_status=verified does not bypass human review
confidence_score never bypasses human review
Sheet output_decision is advisory input, not authority
Sheet recommended_status is advisory input, not authority
requires_human_review=TRUE is binding in Phase A
```

The report must show both:

```text
sheet_output_decision
processor_recommended_output
```

and explain any disagreement.

---

## 10. Error taxonomy

Phase A errors are machine-readable and grouped by whether retry could help.

```text
ERR_ROW_NOT_FOUND
ERR_DUPLICATE_ROW_ID
ERR_INELIGIBLE_RECORD_TYPE
ERR_INVALID_SCHEMA
ERR_INVALID_STATUS
ERR_INVALID_FLAGS_JSON
ERR_INVALID_DATE
ERR_INVALID_URL
ERR_UNSAFE_URL
ERR_ENTITY_UNRESOLVED
ERR_ENTITY_AMBIGUOUS
ERR_CORRIDOR_UNRESOLVED
ERR_SOURCE_FETCH
ERR_SOURCE_UNSUPPORTED_MIME
ERR_SOURCE_REDIRECT_UNSAFE
ERR_SOURCE_CLASSIFICATION
ERR_EVENT_KEY_DERIVATION
ERR_EVENT_KEY_CONFLICT
ERR_DEDUPE_INDEX
ERR_CLAIM_EXTRACTION
ERR_EVIDENCE_CONFLICT
ERR_CANDIDATE_VALIDATION
ERR_OUTPUT_WRITE
ERR_INTERNAL
```

Suggested exit codes:

```text
0  dry run completed; report emitted (including human-review/duplicate outcomes)
2  invalid CLI usage
3  selected row/schema/eligibility failure
4  external source verification failure
5  internal candidate/validation failure
```

A human-review recommendation is **not** a process error and should normally exit `0` with `result=human_review`.

---

## 11. Phase A report bundle

Default output:

```text
.runtime/intel/<intel-id>/
  intake.snapshot.json
  intake.hash.txt
  resolution.json
  source-verification.json
  claim-ledger.json
  event-identity.json
  dedupe.json
  development-update.candidate.json
  article.candidate.json              # only when relevant; may be blocked
  project-fact-diffs.candidate.json   # only when relevant
  validation-report.json
  validation-report.md
  manifest.json
```

`manifest.json`:

```ts
type IntelDryRunManifest = {
  schema_version: "1.0";
  processor_version: string;
  intel_id: string;
  row_hash_sha256: string;
  started_at: string;
  completed_at: string;
  result: "candidate" | "human_review" | "duplicate" | "reject" | "error";
  derived_event_key?: string;
  sheet_event_key?: string;
  verification_status: string;
  sheet_output_decision: string;
  processor_recommended_output: string;
  requires_human_review: boolean;
  artifact_sha256: Record<string, string>;
  mutation_count: 0;
};
```

The Markdown report should be human-reviewable and summarize evidence, blocked claims, dedupe matches and exactly why the processor did or did not recommend a publish candidate.

---

## 12. Idempotency contract

For unchanged input and unchanged trusted repository/evidence fixtures:

```text
(intel_id + row_hash_sha256 + processor_version + verifier_fixture_version)
```

must produce semantically identical candidate/report output, excluding explicitly volatile timestamps.

Rules:

- candidate IDs are deterministic;
- event keys are deterministic;
- dedupe classification is deterministic for the same index state;
- source ordering is canonicalized;
- claim IDs are stable from normalized claim semantics, not array position;
- rerun overwrites/recreates only the selected `.runtime/intel/<id>/` local bundle;
- no repository file, Sheet cell, Git branch or PR is changed;
- a duplicate event cannot become a new DevelopmentUpdate solely because the source URL/headline changed.

---

## 13. Current four-row recommendations

### South Flagler House

Keep as regression fixture and `human_review`. It is a dedupe + chronology conflict. No publication candidate.

### 464 Fern

The actual Sheet state is `verification_status=verified`, not the earlier reported partial verification. It remains `human_review` because canonical entity/branding/publication treatment and existing-content dedupe are unresolved. Its current `primary_source_url` is the same Discover South Florida URL as the lead URL, so source-tier strength must be independently established against municipal records.

### Portofino South

Keep `human_review` despite `verification_status=verified`. Buyout pricing, condo termination/redevelopment implications, assessments and dispute sensitivity make automatic publication inappropriate.

### Downtown Master Plan

Keep `human_review` despite `verification_status=verified`. It is a municipal/multi-entity regulatory event affecting multiple projects/corridors and requires editorial judgment plus claim-appropriate official-record verification.

### Pilot conclusion

**No safe current publishing pilot exists among the four visible rows.** Do not lower the bar to demonstrate the processor.

Approved future pilot criteria remain:

```text
record_type=event
existing canonical project
Tier 1 claim-appropriate verification available
non-legal
non-pricing
non-inventory
non-financing
non-termination/buyout
no material conflicting facts
requires_human_review is not TRUE
genuinely new event
not already represented by Update/article/project facts
```

---

## 14. Phase B — later, separately approved

Phase B begins only after Phase A fixtures and dry runs are reviewed.

Future flow:

```text
validated Phase A bundle
  -> dedicated branch
  -> repository candidate changes
  -> complete tests
  -> DRAFT PR
  -> human review
  -> later normal merge/deploy process
  -> allowlisted Sheet writeback
```

Potential Phase B writeback allowlist:

```text
status
processed_at
pr_url
review_notes
site_update_id
```

No auto merge. No auto deploy. Do not use Sheet lease columns as distributed locking in V1.

---

## 15. Explicit non-goals / boundaries

Do not touch in this planning/Phase A design track:

- PR #75 / GA4
- Alba publication
- 3D tracks
- broad media cleanup
- giant `main.ts` refactor
- production deploy
- Sheet writes
- PR creation by the processor
- Git push/merge by the processor

The repository's current `/updates/<slug>/` public article route remains the public article path. Internal `news` naming is not a reason to migrate public URLs.
