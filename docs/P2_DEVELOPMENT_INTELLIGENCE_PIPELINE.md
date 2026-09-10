# P2 Development Intelligence Pipeline

Status: **planning only**  
Branch: `planning/p2-development-intelligence-pipeline`  
Production base at planning start: `0713e029cc251fc9a49c5e429fdda6ac85e46202`  
Google Sheet: `Incoming_Intel — Tracked Development Updates` (`1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8`)  

This document defines a safe future path from externally researched development intelligence to reviewable repository changes. It does **not** authorize ingestion, publication, Sheet writeback, project-fact mutation, automatic merge, or deployment.

The governing model is:

```text
WEB RESEARCH
  ↓
SHEET INTAKE (untrusted queue/control plane)
  ↓
VALIDATION + ENTITY RESOLUTION
  ↓
INDEPENDENT SOURCE VERIFICATION / CLAIM LEDGER
  ↓
EVENT IDENTITY + DEDUPLICATION
  ↓
EDITORIAL DECISION
  ↓
STRUCTURED UPDATE CANDIDATE
  ↓
OPTIONAL ARTICLE / EXPLICIT PROJECT-FACT DIFF
  ↓
DEDICATED GITHUB BRANCH + DRAFT PR
  ↓
HUMAN REVIEW
  ↓
NORMAL REPOSITORY MERGE / DEPLOY / LIVE VERIFICATION
  ↓
PROJECT + CORRIDOR + UPDATE DISCOVERY
  ↓
SAFE STATUS WRITEBACK TO SHEET
```

## 0. Principles and recommended v1

1. **The Sheet is an intake queue, not canonical site data.** Original Sheet text, Gemini prose, source summaries, classifications, confidence scores, and recommendations are untrusted hints until independently validated.
2. **The repository remains the public source of truth.** A reviewed, versioned Update entity in the repository becomes canonical only after normal review/merge/deploy.
3. **Structured Update first; article second.** Small verified changes should not require a padded article. A reusable Update entity powers project/corridor discovery. A standalone article is an optional projection for substantive events.
4. **Project facts are a separate lane.** Publishing an Update must never silently overwrite canonical project facts.
5. **No automatic publication in v1.** The safest practical first version is a manually triggered Codex processor for explicitly selected Sheet row IDs. It may prepare a **draft PR**, never merge or deploy.
6. **Claim verification outranks model confidence.** A `0.95` Sheet confidence score backed by weak evidence remains weak evidence.
7. **Idempotency is mandatory.** Reprocessing a row or seeing the same event from another outlet must not produce a second public story or duplicate PR.

### Recommended v1 architecture

```text
Selected Sheet row ID(s)
      │
      ▼
1. Intake adapter (read-only)
      │  immutable snapshot + row hash
      ▼
2. Validator / resolver
      │  schema, status, project/corridor IDs, URL safety
      ▼
3. Evidence verifier
      │  fetch sources independently; claim-by-claim evidence ledger
      ▼
4. Event identity + dedupe
      │  repo updates/news/project facts/open PRs/source aliases
      ▼
5. Editorial decision
      │  A / B / C / D / E
      ▼
6. Canonical Update candidate
      │
      ├── A: structured Update only
      ├── B: Update + standalone article
      ├── C: research candidate only (non-public)
      ├── D: hold
      └── E: reject/duplicate
      │
      ▼
7. Repository projector
      │  project/corridor/update discovery + schema/sitemap/feed
      ▼
8. Test + draft-PR producer
      │
      ▼
Human review → normal repository release process
```

No new database or hosted service is required for v1. A repository-backed structured data model is the best fit for the site's static/prerendered architecture and existing review discipline.

---

## 1. Row validation

A row cannot produce public-site changes until every applicable validation passes.

### 1.1 Required intake fields

For v1, require:

- `id`
- `status`
- `created_at`
- `headline`
- `article_type`
- `category`
- at least one of `summary` or `material_updates`
- `source_name`
- `source_url`
- `source_published_date`
- parseable `source_quality`
- parseable `confidence_score`
- valid `flags_json`
- parseable `requires_human_review`

For an existing-project update, `related_project_slug` must resolve to a canonical repository project. For `new_project`, an empty or unknown slug is permitted only because the output must be **C — New Project / Entity Candidate**, not a public project page.

### 1.2 Supported `article_type` allowlist for v1

Use the currently observed intake vocabulary as the initial allowlist:

- `project_update`
- `planning_update`
- `redevelopment`
- `new_project`

Unknown types must stop at `needs_review`; they must not be coerced into a familiar type. The allowlist should live in trusted processor code/config, not in Sheet prose.

### 1.3 Project and corridor resolution

Sheet values are resolution hints, not authority.

- `related_project_slug` must resolve against the repository's canonical project model/public project records.
- `project_name` may help resolve aliases but cannot create a project identity by itself.
- `corridor` must resolve against the site's canonical corridor identifiers, not merely the Sheet's `Corridors_and_Tiers` tab.
- Name/address ambiguity, multiple matches, a moved/renamed project, or conflict between name and slug → `needs_review`.
- A genuinely new proposed tower → output C and research verification; never silently append it to public project data.

### 1.4 Source URL safety

A source URL must:

- be absolute HTTPS;
- contain no embedded credentials/userinfo;
- reject `file:`, `data:`, `javascript:`, `ftp:`, localhost, private/link-local network targets, and unsafe redirects;
- use bounded redirects, response size, and timeout;
- accept only expected document MIME types such as HTML/PDF;
- preserve the originally supplied URL for audit while recording any independently resolved canonical URL separately.

A valid URL is not proof that its contents are trustworthy.

### 1.5 Dates

`source_published_date` must be parseable and plausible. Future dates, missing dates, date conflicts between the Sheet and source, or material ambiguity about when an event occurred require review. The pipeline should distinguish:

- source publication date;
- event/effective/milestone date;
- processor verification date;
- site publication date.

These must not be collapsed into one field.

### 1.6 Source quality and confidence

The Sheet's `source_quality` and `confidence_score` are **triage inputs**, not verification decisions.

Recommended v1 confidence handling:

- `>= 0.80`: may proceed to automated **draft consideration** only after evidence verification.
- `0.65–0.79`: human review required before a PR candidate can be treated as editorially ready.
- `< 0.65`: `needs_review` or `rejected`, depending on provenance and whether the claim can be independently established.

A high confidence score never lowers the source-evidence requirement.

### 1.7 Risk flags

The processor derives risk independently in addition to reading `flags_json`. Minimum flags:

- `pricing_claim`
- `inventory_claim`
- `delivery_or_completion_date`
- `approval_status`
- `permit_or_zoning`
- `financing`
- `lawsuit_or_legal_dispute`
- `condo_termination_or_buyout`
- `conflicting_sources`
- `proposed_or_unapproved`
- `weak_provenance`
- `prompt_injection_detected`

`requires_human_review=true` is binding. `false` can never waive a policy-triggered human review.

### 1.8 Validation outcome

A row that fails structural validation must not produce public content. It goes to:

- `needs_review` for resolvable ambiguity/conflict;
- `rejected` for a confirmed duplicate, unsupported/non-newsworthy input, or irreparable provenance failure;
- `error` for a processor/tool/network failure where retry is appropriate.

---

## 2. Source verification and evidence tiers

Verification is **claim-specific**. A source can be authoritative for one fact and weak for another.

### Tier 1 — primary / official evidence

Examples:

- developer/project official material for the developer's own announcement or marketing claim;
- City of West Palm Beach planning records, agendas, staff reports, permits and approvals;
- Palm Beach County or State of Florida filings where applicable;
- court records for litigation/termination matters;
- SEC filings or other official corporate materials where applicable;
- recorded/official transaction or ownership records where relevant.

Important nuance: a developer press release can verify that the developer **announced** a delivery target, but it does not prove a government approval, legal outcome, or actual future completion date. Copy should attribute marketing claims accordingly.

### Tier 2 — reputable independent journalism / trade coverage

Examples:

- Palm Beach Post;
- The Real Deal;
- South Florida Business Journal;
- recognized architecture/development publications with identifiable editorial standards.

### Tier 3 — secondary aggregators

Useful for discovery and leads, but material facts should be traced upstream.

### Tier 4/5 — social / rumor / weakly attributable material

Social posts, forums, anonymous claims, reposts, marketing aggregators with unclear sourcing, or rumor-level material. These cannot independently support public factual copy.

### 2.1 Required strength by claim type

| Claim | Minimum verification rule |
|---|---|
| Low-risk construction milestone | Tier 1 preferred. If unavailable, two independent Tier 2 sources + human review. |
| Developer-announced amenity/design/launch | Tier 1 developer source; copy must attribute it as developer-provided/announced where appropriate. |
| Pricing/current inventory | Current claim-appropriate primary material + human review; never infer availability from stale marketing pages. |
| Delivery/completion date | Current primary/developer or authoritative construction evidence + human review; describe as target/estimate unless objectively completed. |
| Government approval/zoning/permit | Government/official record required + human review for material status change. |
| Lawsuit/legal dispute | Primary legal record where available + reputable reporting + human review. |
| Condo termination/buyout | Recorded/legal/association evidence where applicable + reputable reporting + human review. |
| Financing | Official lender/borrower/SEC/recorded evidence where applicable + human review. |

Conflicting credible sources always stop automation regardless of Sheet confidence.

### 2.2 Claim ledger

Before drafting, transform prose into discrete claims. Each material claim receives:

```text
claim_id
claim_text_normalized
claim_type
risk_level
source_ref_ids[]
verification_status: verified | attributed | conflicting | unsupported
notes
```

Only `verified` or properly `attributed` claims may enter public copy. `unsupported` and `conflicting` material claims block publication or are omitted with a documented reason.

The pipeline must never treat a source summary—or Gemini's interpretation of one—as a factual substitute for the source itself.

---

## 3. Deduplication and stable event/update identity

### 3.1 Three separate identities

Do not use the headline as identity.

1. **Intake identity** — Sheet `id`; immutable link back to the queue row.
2. **Source identity** — normalized canonical URL + source publication identity; represents one source report.
3. **Event identity** — stable representation of the real-world development event.

### 3.2 Event key

Recommended deterministic `event_key` inputs:

```text
resolved entity/project/address identity
+ normalized event category/type
+ material subject / authority
+ effective or milestone date (or bounded date bucket when exact date is absent)
```

Example conceptually:

```text
south-flagler-house | construction | topping-out | 2025-11
```

A hash may be stored for compactness, but the normalized components must remain inspectable in the PR/evidence record.

### 3.3 Dedupe classifications

A new row may resolve as:

- **new event** — no matching canonical event;
- **additional source** — same event, new evidence;
- **material update** — same event family but new factual state;
- **existing known project fact** — useful corroboration but no public Update required;
- **duplicate** — no new material information.

Five outlets reporting one topping-out milestone should normally produce **one Update entity with multiple source refs**, not five articles.

### 3.4 Reconciliation surfaces

Dedupe must check at least:

- the future canonical Update registry;
- existing `research/news-review/approved-development-news.json`;
- existing `src/data/approvedExternalNews.ts` projection;
- existing `src/data/importedUpdates.json`;
- canonical project facts / source ledgers and explicit overrides;
- current published article routes;
- open draft PRs and processing markers keyed by Sheet ID/event key.

This is already necessary: current main contains a 464 Fern Street approved development-news item, so a Sheet row about that proposal cannot be assumed to be new merely because its headline/source differs.

### 3.5 Idempotency

For a given `(sheet_intel_id, row_version_hash)` or `event_key`:

- reprocessing must find and update/reuse the existing draft work rather than create another PR;
- a retry after processor failure must retain the same event identity;
- the processor must search open PR bodies/branch metadata for the intake ID and event key before opening a new PR;
- a changed row may cause re-verification, but never silent replacement of the immutable original intake snapshot.

---

## 4. Output decision contract

Decision order matters. Apply dedupe and risk gates **before** article generation.

### A. Project Update Only

Use when a verified change is useful but not substantive enough for a dedicated article.

Examples: a low-risk construction milestone, a dated project-document release, or a small verified status development.

Output:

- create/update a canonical Update entity;
- associate it with `project_ids[]`;
- surface under the canonical project's **Current Updates**;
- optionally surface in related corridor/update feeds;
- no padded standalone article required.

### B. Standalone Update Article + Project Link

Use when the event is materially substantive, durable and useful beyond a one-line project timeline item.

Output:

- canonical Update entity;
- canonical `/updates/<slug>/` article projection (final route decision must preserve existing `/news/` compatibility; see conflicts below);
- project/corridor relationships from the structured entity;
- bidirectional links article ↔ project and article ↔ corridor where applicable;
- sitemap/feed/schema inclusion.

### C. New Project / Entity Candidate

Use when the intake appears to describe a genuinely new project/entity or a proposal not yet in the canonical model.

Output:

- **research candidate only**;
- verify address, project name/aliases, developer/owner, proposal status, planning case/record and current stage;
- no automatic public project page;
- no automatic canonical project ID creation.

### D. Hold for Human Review

Mandatory for:

- legal disputes;
- condo termination/buyouts;
- sensitive pricing/inventory;
- uncertain approvals/status/timeline;
- financing claims;
- conflicting credible sources;
- weak provenance;
- meaningful identity ambiguity;
- prompt-injection or suspicious-source behavior.

### E. Reject / Duplicate

Use for:

- confirmed duplicate event with no new material information;
- low-value restatement of an already published fact;
- unsupported rumor that cannot be verified;
- out-of-scope or structurally irreparable intake.

Record the duplicate target/event key or rejection reason in `review_notes`; do not simply disappear the row.

### Decision precedence

```text
structural/security failure → D or E
confirmed duplicate/no-op → E
new/unknown public entity → C
high-risk/conflicting evidence → D
verified, useful, small change → A
verified, substantive durable event → B
otherwise → D
```

Corridor-wide planning/policy developments may have `project_ids=[]` and valid `corridor_ids[]`; they do not need to be forced onto a project to qualify as an Update.

---

## 5. Canonical Current Update model

The future public canonical object should be a reusable structured entity, not hand-edited project prose.

### Proposed schema

```ts
type DevelopmentUpdate = {
  update_id: string;                 // immutable: upd_<date>_<stable hash>
  event_key: string;                 // stable normalized real-world event identity
  slug: string;
  headline: string;

  event_date?: string;               // when the real-world event occurred/effective
  published_date: string;            // first site publication
  updated_date: string;              // latest material editorial revision

  project_ids: string[];             // canonical repo IDs only
  corridor_ids: string[];            // canonical repo IDs only
  category: string;
  output_type: "project_update" | "standalone_article";

  summary: string;
  material_updates: string[];
  buyer_context: string;

  source_refs: Array<{
    source_id: string;
    publisher: string;
    url: string;
    canonical_url?: string;
    published_date: string;
    accessed_at: string;
    tier: 1 | 2 | 3 | 4 | 5;
    claim_ids: string[];
  }>;
  claim_evidence: Array<{
    claim_id: string;
    claim_type: string;
    verification_status: "verified" | "attributed" | "conflicting" | "unsupported";
    source_ref_ids: string[];
  }>;
  source_quality: "primary" | "strong" | "mixed" | "weak";
  verification_summary: string;
  risk_flags: string[];

  review_status: "draft" | "needs_review" | "approved";
  author_id: string;
  reviewer_id?: string;
  reviewed_at?: string;

  canonical_url: string;
  article_path?: string;
  sheet_intel_ids: string[];

  status: "draft" | "published" | "superseded" | "withdrawn";
  supersedes_update_id?: string;
};
```

### Relationship model

```text
Project
  └─ Current Updates
       └─ resolve approved/published Update entities where project_ids includes project.id

Corridor
  └─ Current Updates
       └─ resolve approved/published Update entities where corridor_ids includes corridor.id

Update article
  ├─ links to related Project(s)
  └─ links to related Corridor(s)
```

A project page should not require a prose edit for every new development event. Static/prerender generation resolves Update relationships at build time so search engines and AI crawlers receive the content without client-only rendering.

If output A has no standalone article, `canonical_url` may point to the stable Current Updates anchor on the project/corridor route. If output B has an article, the article URL becomes the Update's canonical URL.

---

## 6. Editorial article contract

Raw Sheet `article_body` is never publishable source material by itself.

For a draft article candidate:

1. independently fetch and verify source evidence;
2. break material claims into the claim ledger;
3. omit or explicitly attribute unsupported marketing assertions;
4. rewrite into WPBNewConstruction editorial voice rather than paraphrasing source copy line-by-line;
5. state status precisely: e.g. `proposed`, `submitted`, `under review`, `approved`, `under construction`, `topped out`, `completed`;
6. never convert an announced target date into a guaranteed completion date;
7. include buyer relevance without speculation or invented urgency;
8. link primary sources where appropriate and preserve source provenance;
9. assign truthful `author_id` and, where policy/risk requires it, `reviewer_id`;
10. create canonical title/description/social metadata only from verified editorial copy;
11. emit appropriate schema using the same structured relationships and dates;
12. run plagiarism/copy-similarity safeguards and avoid reproducing source language.

Short is acceptable. A concise verified construction milestone is preferable to padding a 120-word fact into an 800-word SEO article.

---

## 7. Existing project fact updates are a separate explicit action

Some verified intelligence may justify changing a canonical project fact, but that is not an automatic side effect of an Update.

### Required field-level fact-change proposal

```text
project_id
field_path
old_value
proposed_value
effective_date
claim_id / evidence references
source URLs
reason
reviewer approval state
```

Examples of fields that may eventually be proposed:

- construction status;
- timeline note;
- source ledger;
- last-reviewed date.

Rules:

- publishing a news/update entity must **not** mutate these fields automatically;
- fact changes require an explicit diff and claim-appropriate source evidence;
- a fact change can be included in the same draft PR only if separately identified and approved as a project-fact action;
- otherwise the Update ships without the canonical-field mutation.

Current `projectFactOverrides.ts` already embodies the principle that project facts have their own explicit override path; the new pipeline should preserve that separation rather than bypass it.

---

## 8. Future GitHub PR generation

### V1 manual flow

Brooke explicitly selects one or more `status=new` Sheet row IDs.

The processor should then:

1. read the selected row and capture an immutable intake snapshot/hash;
2. claim it conceptually as `processing` (actual Sheet writeback is a later implementation, not part of this planning task);
3. validate row schema/state;
4. resolve project/corridor identities from the repository;
5. independently retrieve and verify sources;
6. build claim ledger and risk assessment;
7. dedupe against canonical/public/current-draft repository surfaces and open PRs;
8. choose A/B/C/D/E;
9. for A/B, create the structured Update candidate and optional article projection;
10. create any project-fact proposal only through the separate explicit lane;
11. branch from **then-current production main**, e.g.:

   `intel/<sheet-id>-<event-slug>`

12. limit writes to allowlisted intelligence/update/article/generated-discovery paths;
13. run focused validation followed by the normal complete repository gates;
14. open a **DRAFT PR** with intake ID, event key, decision, evidence summary, risk flags and test results;
15. future writeback: `status=pr_created`, `processed_at`, `pr_url`, concise `review_notes`, `last_updated`.

No auto-merge. No deployment command. The processor identity should not have deployment authority in v1 if permissions can be separated.

### PR body minimum evidence

- Sheet intake ID(s), never hidden;
- stable event key;
- output decision A/B/C/D/E;
- exact related project/corridor IDs;
- source list and evidence tiers;
- material claim verification table;
- dedupe matches checked;
- risk flags;
- explicit project-fact diffs, if any;
- exact tests run/results;
- statement: **DRAFT / NOT DEPLOYED**.

### Reprocessing/open PR behavior

Before creating a branch/PR, search for the intake ID and event key. If an open candidate already exists, update/reuse that work or return `needs_review`; never create `PR #2` for the same event because a processor retried.

---

## 9. Exact future Sheet state machine

Use the current status vocabulary without adding a new state in v1.

```text
new
  └─→ processing
        ├─→ pr_created
        ├─→ needs_review
        ├─→ rejected
        └─→ error

needs_review
  ├─→ processing       # human authorizes/revises and retries
  └─→ rejected

error
  ├─→ processing       # retryable processor/tool failure
  ├─→ needs_review     # repeated/ambiguous failure
  └─→ rejected

pr_created
  ├─→ published        # only after normal merge + production deployment + live verification
  └─→ needs_review     # PR rejected/closed, evidence changed, or rework required

published  # terminal for this row
rejected   # terminal for this row
```

Forbidden direct transitions:

- `new → published`
- `processing → published`
- `needs_review → published`
- `error → published`

`recommended_status` is advisory input only and cannot drive the state machine directly.

### Concurrency note

The current Sheet schema lacks a durable lease/claim token. Therefore a scheduled multi-worker processor is unsafe unless it has a single serialized worker or later adds concurrency controls. This is another reason manual selected-row processing is the recommended v1.

---

## 10. Safe Sheet writeback contract

No Sheet writes are authorized by this planning task.

When implemented later, only these current fields should be machine-written by default:

- `status`
- `processed_at`
- `pr_url`
- `review_notes`
- `last_updated`

Do not silently rewrite:

- source URLs;
- Gemini/source summaries;
- headline;
- article draft;
- classifications;
- confidence;
- flags.

Original intake must remain auditable even when it proves wrong.

Potential future writeback fields, if the schema is deliberately revised later:

- `canonical_update_url`
- `published_at`
- `site_update_id`
- `event_key`
- `output_decision`
- `verification_status`
- `verification_summary`
- `processor_version`
- `processing_started_at`
- `claimed_by`
- `claim_token`
- `lease_expires_at`

An append-only `Processing_Audit_Log` tab would be preferable long-term to overwriting historical processor observations, but it is **not** proposed for creation in this task.

---

## 11. Mapping: current Sheet columns → pipeline fields

| Current Sheet column | Pipeline use | Trust rule |
|---|---|---|
| `id` | `intake_id`; append to `sheet_intel_ids[]` | Required queue identity; not event identity. |
| `status` | queue state | Enforce state machine. |
| `created_at` | intake metadata | Preserve. |
| `headline` | candidate headline / search hint | Untrusted; never event identity. |
| `project_name` | entity-resolution hint | Must resolve against repo. |
| `related_project_slug` | candidate project slug | Must resolve; cannot create entity. |
| `corridor` | candidate corridor hint | Must resolve against repo. |
| `article_type` | candidate output/type classifier | Trusted allowlist decides validity. |
| `category` | candidate Update category | Normalize against trusted vocabulary. |
| `summary` | claim-discovery/editorial input | Untrusted prose. |
| `material_updates` | claim-discovery input | Split into claims and verify. |
| `why_it_matters` | editorial intent input | Rewrite; do not treat as evidence. |
| `buyer_angle` | buyer-context input | Rewrite; avoid speculation. |
| `source_name` | source-resolution hint | Verify independently. |
| `source_url` | candidate source ref | URL safety + independent fetch required. |
| `source_published_date` | candidate source date | Verify against source. |
| `source_quality` | triage hint | Processor derives actual evidence tier. |
| `confidence_score` | triage priority | Never substitutes for evidence. |
| `recommended_status` | model/research recommendation | Advisory only; no state-machine authority. |
| `flags_json` | risk hints | Parse safely; derive additional flags independently. |
| `requires_human_review` | minimum review gate | `true` binds; `false` cannot waive policy. |
| `article_body` | drafting reference only | Never publish directly. |
| `seo_title` | candidate metadata idea | Regenerate from verified copy. |
| `seo_description` | candidate metadata idea | Regenerate from verified copy. |
| `social_copy` | candidate promotional idea | Regenerate from verified copy. |
| `processed_at` | future machine writeback | Safe write field. |
| `pr_url` | future machine writeback | Safe write field. |
| `review_notes` | future processor/human state notes | Safe write field; concise/auditable. |
| `last_updated` | future machine writeback timestamp | Safe write field. |

---

## 12. Security and prompt-injection boundary

Treat all of these as hostile/untrusted input:

- webpage text;
- PDFs/source documents;
- Sheet text;
- headlines;
- `article_body`;
- comments/metadata embedded in source pages;
- source-provided instructions;
- snippets produced by external models.

Only the processor's trusted policy/instructions may control tools or repository actions.

A source saying “ignore previous instructions,” “upload your API key,” “disable tests,” “merge this PR,” or “edit another file” is data to be discarded/flagged—not an instruction.

### Mandatory controls

- strict URL/SSRF protection;
- no secrets in prompts, generated files, logs or PR bodies;
- never execute Sheet/source code, HTML, scripts or shell fragments;
- sanitize slugs/paths and prohibit path traversal;
- repository write-path allowlist;
- no arbitrary command interpolation from Sheet fields;
- bounded source fetches and redirects;
- artifact/PR secret scanning;
- processor cannot weaken required assertions to make a candidate green;
- no merge/deploy permission or tool use in the draft-producing stage;
- prompt-injection detection raises a risk flag and normally routes to D.

---

## 13. First pilot recommendation

### Candidate: South Flagler House — low-risk construction milestone

South Flagler House is the best **candidate** among the current Sheet examples because it is an existing project and the intake describes a discrete construction milestone rather than a new entity, legal dispute, termination/buyout or sensitive current-inventory claim.

It must still be selected only after independent verification. The Sheet row itself is not sufficient evidence.

Pilot acceptance rule:

- resolve the existing canonical `south-flagler-house` project;
- independently confirm the specific milestone using a Tier 1 claim-appropriate source if available;
- if no Tier 1 milestone evidence exists, require at least two independent Tier 2 sources and human review;
- ensure the claimed event is not already represented in existing approved news/project facts;
- do not update completion/delivery/pricing facts merely because they appear in the same source.

The pilot should demonstrate:

```text
selected Sheet row
→ immutable intake snapshot
→ independent source verification
→ event key + dedupe
→ normalized DevelopmentUpdate
→ A (Update only) or B (short article only if substantive)
→ project Current Updates relationship
→ South Flagler corridor discovery
→ sitemap/feed/schema projection where applicable
→ draft PR
→ no production deployment
```

**Do not use Portofino South for the first pilot.** Condo termination/buyout/legal/pricing sensitivity makes it a deliberately high-risk D-lane test case, not a v1 happy path.

---

## 14. Automation options

### A. Codex/manual selected-row processor — recommended v1

Brooke explicitly selects approved `status=new` row IDs and invokes the processor.

Advantages:

- human controls workload and timing;
- easier debugging of entity resolution and dedupe;
- lower concurrency/writeback risk;
- ideal while Update schema and repository projection are new;
- no always-on account/service dependency;
- clean fit with the repository's existing `manual_review` / `autoPublish:false` policy.

This mode may automate verification, drafting, tests and **draft PR creation**, but not publication.

### B. Scheduled ChatGPT/agent processor — future v2

A scheduled processor periodically scans only `status=new` rows and prepares draft PR candidates.

Before enabling it, require:

- proven event-key dedupe/idempotency;
- reliable Sheet claim/lease behavior or serialized execution;
- processor-version/audit records;
- safe writeback;
- open-PR detection;
- stable project/corridor resolution;
- risk classifier tests;
- prompt-injection/SSRF controls;
- explicit permission separation preventing merge/deploy.

Even then, high-risk rows remain held and publication remains human-reviewed.

**Recommendation:** build A first. Do not schedule B merely because scheduling is technically easy; the hard problem is safe identity, evidence and idempotency.

---

## 15. Testing plan

### Intake/schema

- valid row;
- missing required fields;
- malformed `flags_json`;
- invalid confidence/date;
- unsupported `article_type`;
- invalid status transition.

### Identity/dedupe

- duplicate Sheet row;
- same event from two different source URLs;
- same source reprocessed;
- materially newer update to an existing event;
- already-known canonical project fact;
- existing article/news match;
- existing open PR match;
- idempotent retry after failure;
- no duplicate PR.

### Entity resolution

- known project slug;
- project name/slug conflict;
- unknown project slug;
- valid corridor;
- unknown corridor;
- genuine new-project candidate → C only.

### Evidence/risk

- Tier 1-supported low-risk claim;
- Tier 2-supported claim;
- two independent Tier 2 sources for a low-risk milestone when Tier 1 is unavailable;
- conflicting Tier 1/Tier 2 evidence;
- stale/future source dates;
- pricing flag;
- inventory flag;
- delivery-date flag;
- permit/zoning/approval flag;
- legal/termination/buyout flag;
- financing flag;
- weak provenance;
- prompt injection in source body/Sheet `article_body`;
- unsafe/private-network source URL.

### Editorial/public model

- A creates Current Update relationship without standalone article;
- B creates article + Update + backlinks;
- project Current Updates query resolves only approved/published entities;
- corridor discovery relationship;
- article/project/corridor backlinks;
- sitemap entry;
- feed entry;
- appropriate schema and dates;
- truthful author/reviewer rules;
- source links and evidence metadata;
- public copy does not reproduce unverified Sheet prose.

### Canonical project facts

- publishing Update leaves canonical project fields unchanged by default;
- approved explicit field-level fact diff changes only named field(s);
- unrelated project data unchanged;
- source ledger/last-reviewed changes require explicit fact action.

### Repository/release safety

- processor branch starts from current main;
- allowlisted changed paths only;
- full repository suite;
- SEO/GEO/Agent Skills/assets/privacy/gatekeeper;
- no production deployment command;
- draft PR only;
- Sheet `published` state cannot occur before merge + deploy + live verification.

---

## 16. Existing architecture: reuse and conflicts

The repository already has substantial news/article infrastructure. The new pipeline must integrate it rather than creating another independent publisher.

### Existing surfaces to preserve/reuse

1. **Manual publishing policy** — `content/news-automation-config.json` declares `publishingModel: manual_review` and `autoPublish: false`. The proposed manual v1 matches this exactly.
2. **Approved development-news store** — `research/news-review/approved-development-news.json` contains rich article records, source links, related project/corridor metadata and editorial content.
3. **Public news projection** — `src/data/approvedExternalNews.ts` is already consumed by the main application.
4. **Legacy imported-update store** — `src/data/importedUpdates.json` exists but is currently a separate, minimal update shape. It should become an adapter/migration source, not a second canonical Update registry.
5. **Project fact overrides** — `src/data/projectFactOverrides.ts` is intentionally separate from news and supports keeping canonical fact mutation explicit.
6. **Article publisher** — the repository has preview/stage/publish/ship tooling plus strong safety/tests. Reuse normalization, copy-policy, image and uniqueness logic where appropriate.
7. **Existing QA** — `qa:approved-news`, `qa:news`, SEO/GEO/internal-link/public-copy/gatekeeper checks already exist and should remain part of the future pipeline gate.

### Conflicts / required design work before implementation

#### A. `/news/` today vs proposed `/updates/`

The main router currently has `news` / `news-detail` route concepts, while the desired model proposes canonical `/updates/.../` pages. Do **not** simply duplicate every article at both paths.

Implementation must choose one canonical public route strategy:

- preferred: structured Update entity is canonical data, with existing `/news/` content adapted/projected into the Update system and a deliberate migration/redirect strategy if `/updates/` becomes the article canonical path; or
- retain `/news/` as the article route while `/updates/` is the structured discovery/feed route, until a separately reviewed URL migration is approved.

Existing published URLs must not break.

#### B. There are already multiple update stores

`approved-development-news.json`, `approvedExternalNews.ts`, and `importedUpdates.json` overlap conceptually. The new Update registry must become the normalized relationship layer, with adapters during migration. Creating a fourth unrelated store would make dedupe worse.

#### C. Existing article publisher can mutate/push/deploy

`article-publish-workflow.mjs` has `stage`, `publish`, and `ship` modes and expects a clean/up-to-date `main` for mutation paths. That is not the desired future Sheet processor contract, which should branch from current main and open a draft PR.

Therefore v1 must **not** invoke `article:publish`, `article:ship`, or deployment as its automation primitive. Reuse pure validation/normalization functions where possible and add a PR-oriented staging boundary later.

#### D. Existing uniqueness is article-oriented, not event-oriented

The current publisher validates news candidate uniqueness by article identifiers/slug/canonical URL. The new system additionally needs **event-level dedupe** across multiple outlets and intake rows.

#### E. Project update projection is not yet canonical

Project pages currently consume project facts and news/data surfaces, but there is no single canonical `Project → Current Updates → Update[]` relationship. That resolver and its prerendered output will be the principal implementation addition after this plan is approved.

#### F. 464 Fern is already represented

Current approved development-news data already contains a 464 Fern proposal article. The Sheet example for 464 Fern therefore serves as a useful mandatory dedupe test: it must not create another article simply because another source or headline appears in the queue.

---

## 17. Later Sheet-schema additions — recommendation only

Do **not** apply these now.

Highest-value additions after v1 is proven:

1. `event_key` — stable real-world event identity;
2. `output_decision` — A/B/C/D/E;
3. `verification_status`;
4. `verification_summary`;
5. `site_update_id`;
6. `canonical_update_url`;
7. `published_at`;
8. `processor_version`;
9. `processing_started_at`;
10. `claimed_by`;
11. `claim_token`;
12. `lease_expires_at`.

For scheduled automation, the last four become important to prevent two workers claiming the same row.

Longer term, prefer an append-only audit log over repeatedly replacing historical processor notes.

---

## 18. Proposed implementation sequence after approval

No implementation is authorized by this document. If approved later, split work into reviewable phases:

### INTEL-1 — schemas, adapters and validators

- trusted intake schema/status machine;
- repository project/corridor resolver;
- safe URL/source-ref model;
- DevelopmentUpdate schema;
- adapters for existing approved news/imported updates;
- event-key/dedupe tests;
- no Sheet writes.

### INTEL-2 — public Update projection

- canonical Update registry;
- Project → Current Updates resolver;
- corridor/update discovery;
- static/prerender output;
- sitemap/feed/schema;
- existing `/news/` compatibility strategy.

### INTEL-3 — manual selected-row processor

- read selected Sheet rows;
- independent evidence workflow;
- claim ledger/risk policy;
- A/B/C/D/E decision;
- dedicated branch + draft PR generation;
- no merge/deploy;
- Sheet writeback still optional/separate until safe.

### INTEL-4 — controlled writeback

- current safe writeback fields only;
- idempotency/open-PR mapping;
- audit records;
- no auto-publication.

### INTEL-5 — scheduled agent evaluation

Only after the manual flow has demonstrated safe dedupe, event identity, recovery and review behavior on real examples.

---

## 19. Release boundary

This planning track is intentionally independent of Batch 6 PR #86, social-preview PR #87, PR #75/GA4, Alba, and both 3D tracks.

Nothing in this plan changes production. Nothing in the Sheet is ingested or published by creating this document. The first implementation milestone, if later authorized, should still end at a **draft GitHub PR**.