# P2 Development Intelligence Pipeline

Status: **planning only — no processor implementation authorized**  
Branch: `planning/p2-development-intelligence-pipeline`  
Production base at planning start: `0713e029cc251fc9a49c5e429fdda6ac85e46202`  
Google Sheet: `Incoming_Intel — Tracked Development Updates` (`1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8`)

This document defines the v1 development-intelligence ingestion contract. The Google Sheet is an **untrusted queue/control plane**; reviewed repository data remains canonical. Nothing in this document authorizes Sheet mutation, public publishing, project-fact mutation, merge, or deployment.

## 0. Recommended v1

Use a **manually triggered, selected-row, single-worker processor**. Brooke explicitly selects one or more Sheet row IDs. The processor may read, verify, draft repository changes, run tests, open a **DRAFT PR**, and perform only the approved safe writeback. It must never auto-merge or auto-deploy.

```text
selected Sheet row IDs
  -> immutable intake snapshots
  -> schema + record-type validation
  -> project/corridor/entity resolution
  -> independent source verification
  -> claim ledger
  -> deterministic event identity + event-level dedupe
  -> editorial output decision
  -> canonical Update candidate
  -> optional article candidate
  -> optional explicit project-fact proposal
  -> dedicated branch
  -> complete tests
  -> DRAFT PR
  -> human review / normal release process
  -> safe Sheet writeback
```

V1 assumes **one processor execution at a time**. Lease fields may be recorded for audit but do not constitute transactional locking. Do not build distributed locking in v1. If scheduled or multi-worker processing is later authorized, add a real mutex such as Apps Script `LockService` or another trusted lock service.

## 1. Current Sheet reconciliation

### 1.1 API-observed state

At the latest read of the exact configured Sheet ID, the Google Sheets API still reports:

- `Incoming_Intel`: 29 columns, ending at `last_updated`;
- four visible intake rows (South Flagler House, 464 Fern, Portofino South, Downtown Master Plan);
- no API-visible `event_key`, `output_decision`, `verification_status`, lease fields, or published-site writeback fields;
- file modified time observed as `2026-09-10T00:05:13.809Z`.

A separate migration report says 12 new pipeline columns and 24 records were migrated. Because those changes are **not yet visible in the named Sheet ID through the connected API**, implementation must not assume that report is authoritative. Before processor coding begins, perform a fresh metadata/header/value read and reconcile the actual file. If another Sheet/copy received the migration, the configured source must be corrected deliberately.

### 1.2 Expected migrated fields

The planned processor supports these fields when they become visible:

- `event_key`
- `output_decision`
- `verification_status`
- `verification_summary`
- `site_update_id`
- `canonical_update_url`
- `published_at`
- `processor_version`
- `processing_started_at`
- `claimed_by`
- `claim_token`
- `lease_expires_at`

These are control/provenance fields; they do not make Sheet facts authoritative.

### 1.3 Reported migration classifications to verify before implementation

The processor test fixture set should verify the actual cells once exposed:

| Record | Reported output decision | Reported verification |
|---|---|---|
| South Flagler House topping-out | `duplicate` | `verified_multi_source` |
| 464 Fern | `new_project_candidate` | `partially_verified` |
| Portofino South | `human_review` | verify actual vocabulary |
| Downtown Master Plan | `human_review` | `partially_verified` |
| Currie Park | `human_review` | `conflicting` |
| 2085 North Flagler | `human_review` | verify actual vocabulary |
| Edgeworth | `human_review` | `conflicting` |
| OLIN Palm Beach | `human_review` | verify actual vocabulary |
| 3031 S Ocean | `human_review` | verify actual vocabulary |

Until those values can be read from the exact Sheet ID, they are **reported migration results, not independently verified state**.

## 2. Record-type separation

A canonical project and an intelligence event must never be processed as the same thing.

Required trusted field for future processing:

```text
record_type: project | event
```

Recommended logical separation:

- **Projects / master entities**: identity, aliases, address, canonical project IDs, corridor membership and stable source references. These are research/master records, not publication events.
- **Incoming_Intel / events**: dated developments eligible for verification, dedupe and editorial decisions.
- **Pipeline candidates**: preferably remain event rows with pipeline status fields rather than a third semantic record type.

If the current Sheet really contains 21 master development records plus event rows in one table, v1 should **refuse `record_type=project` as publishable input**. A later Sheet cleanup should move master project rows to a separate logical tab/table. Do not modify the Sheet during this planning track.

## 3. Row validation

A selected row may proceed only if structural validation passes.

Required for an event row:

- `id`
- `record_type=event` (when field exists; until then v1 requires explicit event-row selection and rejects master rows)
- valid queue `status`
- `created_at`
- `headline`
- supported `article_type`
- `category`
- at least one substantive `summary` or `material_updates`
- `source_name`
- absolute HTTPS `source_url`
- parseable `source_published_date`
- parseable source tier/quality
- parseable confidence score
- valid `flags_json`
- parseable `requires_human_review`

Project/corridor identifiers are **resolution hints**, not authority. Existing-project events must resolve to canonical repository IDs. Unknown project identity may only become a **new-project candidate**, never an automatically created public project.

Unknown article types, unknown corridors, identity conflicts, malformed URLs, suspicious redirects, unsupported MIME types, future/impossible dates, conflicting status fields, or malformed risk flags must fail closed to review/error rather than being coerced.

## 4. Status and state machine

Sheet queue status remains operational state. `output_decision` is an editorial recommendation/decision and must never masquerade as publication status. `verification_status` is evidence state and must never advance queue state by itself.

V1 queue state machine:

```text
new
 -> processing
    -> pr_created
    -> needs_review
    -> rejected
    -> error

needs_review -> processing | rejected
error        -> processing | needs_review | rejected
pr_created   -> published | needs_review
published    -> terminal
rejected     -> terminal
```

Rules:

- only explicitly selected `new`, approved `needs_review`, or retryable `error` rows enter `processing`;
- `recommended_status` is advisory only;
- `output_decision` is separate from `status`;
- `verification_status` is separate from both;
- `published` is written only after normal merge, deployment, and live verification;
- row retry must be idempotent and must not create another PR for the same event/work unit.

Recommended verification vocabulary:

```text
unverified
partially_verified
verified_single_primary
verified_multi_source
conflicting
unsupported
```

A row-level verification status summarizes the claim ledger; claim-level evidence remains authoritative.

## 5. Source provenance and evidence

Do not use one generic source URL as the canonical evidence model.

### Lead source

`lead_source` records **where the processor discovered the event**. It may be the Sheet's `source_name` / `source_url`, Gemini research, an aggregator, or another tip. Lead source has no automatic evidentiary authority.

### Verification sources

Canonical Update candidates use:

```ts
type VerificationSource = {
  source_ref_id: string;
  url: string;
  source_name: string;
  source_tier: 1 | 2 | 3 | 4 | 5;
  published_date?: string;
  accessed_at: string;
  source_type: "government" | "developer" | "project" | "filing" | "court" | "journalism" | "trade" | "aggregator" | "social" | "other";
  claims_supported: string[];
};
```

### Evidence tiers

**Tier 1**: official project/developer material for its own statements; City of West Palm Beach records; county/state filings; permits/planning agendas; SEC/official corporate materials; court/recorded documents where applicable.

**Tier 2**: reputable local/trade journalism such as Palm Beach Post, The Real Deal, South Florida Business Journal, and recognized architecture/development outlets.

**Tier 3**: secondary aggregators useful for discovery but not normally sufficient for material claims.

**Tier 4/5**: social, rumor, anonymous or weakly attributable claims; discovery only.

Material pricing, current inventory, delivery/completion dates, approvals, lawsuits, condo termination/buyouts, financing, permits and zoning require stronger claim-appropriate verification and human review.

Developer language may verify that a developer **announced** something; it does not prove a government approval, legal outcome, or future completion.

## 6. Claim ledger

Before editorial drafting, normalize prose into claims:

```ts
type ClaimEvidence = {
  claim_id: string;
  claim_text_normalized: string;
  claim_type: string;
  risk_level: "low" | "medium" | "high";
  source_ref_ids: string[];
  verification_status: "verified" | "attributed" | "conflicting" | "unsupported";
  notes?: string;
};
```

Only verified or accurately attributed claims may enter public copy. Conflicting or unsupported material claims block publication or are explicitly omitted. Sheet prose and `article_body` are drafting inputs only.

## 7. Deterministic event identity and multi-project events

### 7.1 Three identities

1. **Intake identity** — immutable Sheet `id` plus immutable intake snapshot/hash.
2. **Source identity** — normalized verification-source identity.
3. **Event identity** — stable representation of the real-world event, independent of headline wording or outlet.

### 7.2 Event-key namespaces

Do **not** force all events through one project slug. Event identity must support project, corridor and municipal namespaces.

Examples:

```text
project|south-flagler-house|construction|topping-out|2025-11-20
municipal|wpb-downtown-zoning|dac-vote|2026-09-09
corridor|south-flagler|planning-change|2026-09
```

Canonical event-key components must be inspectable before hashing:

```text
namespace
+ normalized subject identity
+ normalized event type/action
+ authoritative/effective milestone
+ event date or explicit date bucket
```

The future repository model therefore uses arrays:

```text
related_project_ids[]
related_corridor_ids[]
```

A municipal event may legitimately have no project IDs. A multi-project policy event may attach to several projects/corridors without pretending one project owns the event.

### 7.3 Dedupe classifications

- `new_event`
- `additional_source`
- `material_update`
- `existing_known_fact`
- `duplicate`

The processor must compare canonical Update candidates, existing approved news, project/corridor facts, published routes and open PRs. Five outlets reporting one milestone produce one event with multiple verification sources, not five articles.

## 8. South Flagler House dedupe fixture

South Flagler House is the first mandatory event-dedupe regression fixture.

Independent evidence establishes the actual topping-out event as **November 2025**, not a new September 2026 topping-out event:

- RAMSA published “South Flagler House Tops Out in West Palm Beach” on November 25, 2025 and states the project had topped out.
- Florida YIMBY reported on November 22, 2025 that both towers reached their 28-story structural height.
- Related Ross's March 16, 2026 Edgeworth release refers to the **recent topping out of South Flagler House** as an already-completed milestone.
- WPBNewConstruction's current South Flagler corridor content already records the topping out in November 2025.

Therefore an intake row whose normalized event semantics are “South Flagler House topping out” and whose source merely re-reports that milestone is the **same event** because subject, event action, physical milestone and completed event period all resolve to November 2025. A later source-publication date does not create a new event.

Regression expectation:

```text
input: later report of South Flagler House top-out
resolve event_key: project|south-flagler-house|construction|topping-out|2025-11
existing event/fact: topping out November 2025
output_decision: duplicate or additional_source
public article count delta: 0
project fact delta: 0 unless separately approved
```

A genuinely later construction fact—e.g. facade completion, certificate, occupancy milestone—must get a different event key. The currently API-visible Sheet row's “15th floor” claim is chronologically incompatible with a verified prior 28-story top-out, so it is a **temporal conflict requiring review**, not a newer milestone.

## 9. Output decision contract

Decision precedence:

```text
structural/security failure -> HUMAN_REVIEW or REJECT
confirmed duplicate/no-op    -> DUPLICATE
unknown/new public entity    -> NEW_PROJECT_CANDIDATE
high-risk/conflicting        -> HUMAN_REVIEW
verified useful small event  -> PROJECT_UPDATE_ONLY
verified substantive event   -> STANDALONE_ARTICLE
otherwise                    -> HUMAN_REVIEW
```

### A. PROJECT_UPDATE_ONLY

Create/update a canonical Update entity and surface it under related project/corridor Current Updates. No padded article required.

### B. STANDALONE_ARTICLE

Create the canonical Update entity plus a public article projection when the event is substantive and durable.

### C. NEW_PROJECT_CANDIDATE

Research candidate only. Verify address, names/aliases, developer/owner, planning record and proposal stage. Do not create a public project or canonical public project ID automatically.

### D. HUMAN_REVIEW

Required for legal disputes, condo termination/buyouts, sensitive pricing/inventory, financing, uncertain approvals/status/timelines, conflicting credible sources, weak provenance, identity ambiguity, or prompt-injection concerns.

### E. REJECT / DUPLICATE

No public change. Record target event/update and reason.

## 10. Canonical repository Update model

Recommended canonical storage:

```text
content/updates/development-updates.json
```

Recommended validator/runtime adapter:

```text
src/data/developmentUpdates.ts
research/scripts/validate-development-updates.mjs
```

The JSON file is reviewed source data. TypeScript imports/validates it and exposes typed selectors. Do not generate a giant hand-maintained TypeScript literal.

```ts
type DevelopmentUpdate = {
  update_id: string;
  event_key: string;
  slug: string;
  headline: string;
  event_date?: string;
  published_date: string;
  updated_date: string;

  related_project_ids: string[];
  related_corridor_ids: string[];
  category: "development" | "construction" | "planning" | "sales" | "financing" | "city" | "press-release" | "general";
  output_type: "project_update" | "standalone_article";

  summary: string;
  material_updates: string[];
  buyer_context?: string;

  lead_source?: {
    name?: string;
    url?: string;
    sheet_intel_id?: string;
  };
  verification_sources: VerificationSource[];
  claim_evidence: ClaimEvidence[];
  source_quality: string;
  verification_summary: string;
  risk_flags: string[];

  review_status: "draft" | "needs_review" | "approved" | "published" | "archived";
  author_id: string;
  reviewer_id?: string;
  reviewed_at?: string;

  canonical_url?: string;
  article_path?: string;
  sheet_intel_ids: string[];
  status: "draft" | "published" | "archived";
  supersedes_update_id?: string;
};
```

Stable Update identity is `update_id`; `event_key` dedupes real-world events; `slug`/URL may evolve under normal redirect policy without changing event identity.

## 11. Integration with the repository's existing news/update architecture

Current main already has multiple layers:

1. `research/news-review/approved-development-news.json` — reviewed source data for public development articles.
2. `research/scripts/promote-approved-news.mjs` — normalizes that JSON and generates `src/data/approvedExternalNews.ts`.
3. `src/data/approvedExternalNews.ts` — typed/generated public article data consumed by `src/main.ts`.
4. `src/main.ts` — internally calls these `news` / `news-detail` routes, but the article publisher's public route base is already **`/updates/`**.
5. `src/data/importedUpdates.json` — currently a separate archived/source-check update format; it must not become another competing canonical store.
6. `src/data/projectFactOverrides.ts` + `content/overrides/project-fact-overrides.json` — explicit manual project-fact override lane; keep separate from event publishing.
7. `research/scripts/article-publish-workflow.mjs` — supports preview, stage, publish and ship. It writes approved news, runs promotion/site-intelligence/build/QA, and in publish/ship modes can commit, push and deploy.

### Minimum migration/integration path

Do **not** create a fourth news database.

Recommended transition:

```text
canonical DevelopmentUpdate registry
   |-- project/corridor Current Updates selectors
   |-- optional article_path
   |-- compatibility adapter -> existing approvedExternalNews/article rendering
   `-- feed/sitemap/schema/agent projections
```

For v1 implementation, preserve the existing public article route **`/updates/<slug>/`** because that is what the current article publisher emits. Internal `news` route/type names do not require public `/news/` URLs. Any historical `/news/` URLs discovered in repository history must be preserved through existing redirect/canonical policy; do not break indexed URLs.

`article_path` is optional metadata on an Update. A project-only milestone may have no article URL. A standalone article reuses the existing article rendering/publisher normalization path rather than creating a second renderer.

`importedUpdates.json` should be treated as legacy/archive intake and migrated or adapted into the canonical Update model only when real records exist; its current archived sample does not justify another public data path.

## 12. Project, corridor and discovery projections

### Project Current Updates

```text
Project(project_id)
 -> select published DevelopmentUpdate where related_project_ids includes project_id
 -> sort by event/published date
 -> render Current Updates cards
```

No hand-edited project prose is required for each update.

### Corridor resolver

Select by `related_corridor_ids`, with optional project-derived corridor fallback only when canonical project membership makes it unambiguous. Municipal/corridor events remain first-class without project IDs.

### Article relationship

If `article_path` exists, Update and article link both directions. Article schema should describe the article; Update relationships should connect `about`/`mentions` to canonical project/corridor entities. Do not emit unsupported status/pricing facts as schema.

### RSS / JSON Feed

Published Update entities are feed candidates. Project-only updates may be included as concise feed items if they have canonical URLs; otherwise the feed can link to the project Current Updates anchor. Standalone articles use `article_path`.

### Sitemap

- project pages remain existing canonical URLs;
- standalone article URLs remain `/updates/<slug>/`;
- do not create sitemap URLs for non-public Update data objects;
- project pages change `lastmod` only when rendered public content materially changes and existing sitemap policy supports it.

### Agent Skill / MCP / llms

Expose only **published, approved structured updates** through existing discovery mechanisms. Include stable `update_id`, event date, relationships, canonical URL/article path and verification/source references appropriate for public display. Never expose Sheet lease tokens, row hashes, internal review notes, unpublished claims, secrets or private reviewer data.

## 13. Editorial article contract

Never publish `article_body` from the Sheet directly.

For an article candidate:

1. independently fetch/verify sources;
2. build claim ledger;
3. omit or properly attribute unsupported marketing claims;
4. distinguish proposed / filed / recommended / approved / permitted / under construction / topped out / completed precisely;
5. write concise WPBNewConstruction editorial copy;
6. include buyer relevance without speculation;
7. cite/link primary sources;
8. use truthful existing author/reviewer identities only when actually assigned;
9. generate canonical SEO/social metadata;
10. apply existing article/schema/image/public-copy QA.

A short verified update is better than padded SEO copy.

## 14. Existing project-fact updates are a separate explicit action

Publishing an Update must **not** overwrite canonical project fields.

If evidence suggests a canonical fact change, produce a separate proposal containing:

```text
project_id
field_key
old_value
proposed_value
source_ref_ids[]
claim_ids[]
risk_level
reviewer_required
reason
```

Only after field-level review may existing project-fact mechanisms be changed. This preserves the current `projectFactOverrides` contract.

## 15. Exact manually triggered processor design

Proposed future branch:

```text
p2-development-intelligence-processor-v1
```

Proposed CLI entry:

```text
npm run intel:process -- --row wpb-intel-... [--row wpb-intel-...]
```

Execution contract:

1. Require clean worktree and current production-main ancestry.
2. Accept only explicit selected row IDs; no scan-all default.
3. Read the exact Sheet ID read-only and snapshot selected rows verbatim to `.runtime/intel/<run-id>/intake/`.
4. Compute row hash; never mutate the snapshot.
5. Validate record type, schema, status, URLs and flags.
6. Resolve canonical project/corridor IDs.
7. Independently fetch evidence with SSRF/protocol/redirect/size/time bounds.
8. Build verification-source registry and claim ledger.
9. Derive deterministic event key independently; compare with Sheet `event_key` and flag disagreement.
10. Dedupe against canonical Update registry, approved-development-news, public article routes, canonical project facts, legacy imported updates and open PR metadata.
11. Derive trusted `output_decision`; compare with Sheet value but never blindly inherit it.
12. Produce DevelopmentUpdate candidate.
13. Optionally produce article candidate through a safe adapter to the existing article workflow's **preview/stage normalization only**. The processor must not invoke `--publish`, `--ship`, `git push` from the legacy publisher, or deployment commands.
14. Optionally emit a project-fact proposal document/diff; never auto-apply it.
15. Create dedicated work branch such as `intel/<event-key-short>/<run-id>` from current main.
16. Apply only allowlisted candidate files.
17. Run schema tests, targeted pipeline tests, complete repository tests, SEO/GEO/Agent Skills/schema/feed/sitemap checks, security/gatekeeper and existing Maps/preflight.
18. Open **DRAFT PR** with row IDs, event key, output decision, evidence summary and exact tests.
19. Safe writeback only after PR creation: `status=pr_created`, `processed_at`, `pr_url`, `review_notes`, `last_updated`, and processor metadata if present.
20. No merge/deploy.

### Idempotency / no duplicate PR

Before branch creation, search open PRs and canonical data for both Sheet IDs and `event_key`. Same row hash + event key must return/reuse the existing work unit. A changed row requires re-verification but does not erase the immutable original snapshot.

## 16. Safe Sheet writeback

V1 may later write only allowlisted processor-owned fields:

- `status`
- `processed_at`
- `pr_url`
- `review_notes`
- `last_updated`
- `processor_version`
- `processing_started_at`
- `claimed_by`
- `claim_token`
- `lease_expires_at`
- after verified release: `site_update_id`, `canonical_update_url`, `published_at`

Do not silently rewrite `headline`, source research, summaries, Gemini prose, `article_body`, source URLs, confidence, or original flags. Preserve original intake for auditability.

In v1 single-worker mode, `claim_token`/lease fields are audit markers only, not locking guarantees.

## 17. Security and prompt-injection boundary

All Sheet cells, source pages, PDFs, headlines, metadata and article bodies are untrusted data.

No source-provided instruction may alter processor policy or authorize:

- secret access/exfiltration;
- unrelated repository edits;
- test bypasses;
- branch-policy changes;
- merge;
- deploy;
- Sheet schema mutation;
- new services/accounts;
- command execution derived from source text.

Trusted processor code/config defines allowed actions. Source text is parsed as evidence only.

## 18. First publishing pilot recommendation

**Do not use South Flagler House**: it is the dedupe fixture.

**Do not use Portofino South**: legal/termination/pricing sensitivity.

**Do not use 464 Fern**: it is a new-project candidate and current production already contains an August 2026 public Update about the filing.

**Do not use Downtown Master Plan**: municipal/zoning controversy and multiple distinct sub-events require human review and multi-entity modeling.

From the currently API-visible rows, **none qualifies as the first low-risk publishing pilot**.

Once the migrated 24-record state is actually visible, choose the first candidate satisfying all of:

- existing canonical project;
- genuinely new event not already represented;
- Tier 1 evidence available;
- non-legal;
- non-pricing;
- non-inventory;
- non-financing;
- no conflicting material facts;
- clear event date/action;
- low-risk project relationship.

If no migrated row meets those criteria, do not lower the threshold. Seed a later pilot with a newly verified Tier 1 milestone for an existing project.

## 19. Required tests before any processor PR can be approved

- row schema validation;
- `record_type=project` rejection from event processor;
- unknown project slug;
- multi-project event;
- municipal/corridor event with no project;
- deterministic event-key regeneration;
- Sheet event-key disagreement;
- duplicate row;
- duplicate real-world event across different sources/headlines;
- South Flagler House topping-out regression fixture;
- additional-source classification;
- materially newer milestone classification;
- new-project candidate;
- Tier 1 vs Tier 2 claim rules;
- conflicting-source hold;
- pricing/date/legal/termination/financing flags;
- prompt injection in Sheet/source text;
- unsafe URL/SSRF/redirect/MIME/size handling;
- queue state machine;
- verification-status separation;
- output-decision separation;
- project Current Updates relationship;
- multi-project/corridor backlinks;
- article/project/corridor bidirectional links;
- sitemap/RSS/JSON Feed/schema;
- author/reviewer rules;
- canonical project facts unchanged unless explicit field-level proposal approved;
- immutable intake snapshot;
- idempotent reprocessing;
- no duplicate PR;
- single-worker assumption;
- no publish/ship invocation;
- no production deployment.

## 20. Files expected in the eventual implementation PR

Exact names may adjust to current main at implementation time, but v1 should remain narrow:

```text
content/updates/development-updates.json
src/data/developmentUpdates.ts
research/scripts/validate-development-updates.mjs
research/scripts/process-development-intel.mjs
research/scripts/development-intel-*.test.mjs
research/scripts/build-site-intelligence.mjs        # adapter/projection only if needed
src/main.ts                                         # Current Updates selectors/render integration only
existing sitemap/feed generation paths
package.json                                        # manual CLI + tests
```

`research/scripts/article-publish-workflow.mjs` should change only if a safe stage-only adapter is genuinely required; do not widen publish authority. Generated Agent Skill/llms/MCP outputs should flow through existing generation paths rather than hand-forked files.

The implementation PR must **not** include Sheet schema mutation, GA4/PR #75, Alba publication, 3D work, broad media cleanup, or a giant `main.ts` refactor.

## 21. Release boundary

This plan ends at implementation review. Processor coding must not begin until Brooke approves the reconciled package. Any future processor PR must remain draft until its own keyed/no-key/aggregate and complete repository verification are green. Production deployment remains a separate explicit release decision.
