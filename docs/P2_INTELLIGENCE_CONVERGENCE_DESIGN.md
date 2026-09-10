# P2 Intelligence Convergence Design

Status: design and review only. This document defines a future shared intake
boundary; it does not authorize Sheet writes, article publication, canonical
fact application, Git/GitHub automation, deployment, or Phase B.

PR #89 remains under review. The Phase A processor is intended to create local
evidence under `.runtime/intel/<validated-intel-id>/`; its safety work is not a
release or live-verification claim.
## Existing Codex article entry

The active local Codex automation is `wpb-content-scout-safe-daily-publish`,
configured at `/Users/brookesnader/.codex/automations/wpb-content-scout-safe-daily-publish/automation.toml:1-14`.
The prior read-only intake inventory is `/tmp/wpb-intake-inventory.md`.
The entry is ACTIVE, scheduled daily at 09:15, in project
`local-13326036d05035bb8a0051d559ebac05`, cwd
`/Volumes/ExternalSSD/WPB_NewConstruction`, with `gpt-5.4-mini` and medium
reasoning. Its prompt limits a run to one article, requires synchronized clean
`main`, route rotation from `content/news-source-config.json`, two independent
source hosts, and two final images. Configuration is not execution evidence:
the inventory observed skipped/no-write runs on Sep 8–9, no loaded WPB publisher LaunchAgent, and no evidence establishing historical publish absence.
The exact article path is:
```text
Codex Content Scout
  -> one Article Manager JSON input under .runtime/
  -> research/scripts/article-publish-cli.mjs --input <runtime-input> --preview
  -> research/scripts/article-publish-workflow.mjs
  -> inspect preview artifacts against standing publication gates
  -> same CLI --publish --ship when policy gates pass
```
The CLI wrapper spawns `article-publish-workflow.mjs` and derives its exit code
from the trailing result JSON (`research/scripts/article-publish-cli.mjs:1-75`).
Preview writes only `.runtime/article-previews/`; stage performs local
normalization/build/QA; publish writes allowlisted article outputs, commits and
pushes; ship performs deployment and live QA
(`docs/article-publisher-workflow.md:13-21,98-120`;
`research/scripts/article-publish-workflow.mjs:44-120,131-190`). This is the
single article publisher. The active Scout prompt says “No review queue” and
allows at most one safe story when its standing gates pass. Legacy GitHub-issue import and
`news:publish-eligible` remain manual/review-only
(`docs/news-update-pipeline.md:32-48,162-176`; `docs/automation-inventory.md:13-20`).
The legacy collector controls in `content/news-source-config.json` are `reviewOnly: true`, `dailyTarget: 1`, route-specific search families, two
independent hosts, and direct primary preferred. The companion
`content/news-automation-config.json` keeps `autoPublishEnabled: false` and
requires review for high-risk material. They do not add a per-run review queue
to the active Scout; these values express gates and intent, not claim support.
## Gemini / Google Sheet entry

The `Incoming_Intel` adapter reads the public CSV export for the configured
Sheet tab and returns only explicitly selected immutable row IDs
(`research/scripts/intel/sheet-adapter.mjs:3-25`). It has no Sheet write method.
Phase A snapshots and normalizes the selected row, verifies source hints, builds
a claim ledger, derives event identity, scans repository indexes for dedupe and
chronology conflicts, and emits local review artifacts
(`docs/P2_INTELLIGENCE_PROCESSOR_PHASE_A.md:1-9,23-72`).
The Sheet remains an intake source, not a competing database or article
publisher. Its evidence bundle may propose an article, a fact change, both, or
neither; Phase A remains `apply: false` and review-only.
## Shared convergence contract

Both streams converge before either output is considered for approval:
```text
Codex article package OR selected Incoming_Intel row
  -> immutable intake snapshot + normalized project/corridor identity
  -> source hint -> fetched source -> independent provenance classification
  -> claim-level adjudication (supported, unsupported, or conflicting)
  -> canonical event ID -> dedupe, chronology/conflict, and risk decision
  -> one review bundle with independent article and fact outcomes
       -> dated Update/article proposal
       -> canonical project-fact proposal
       -> both
       -> neither / hold
```
A URL, HTTP 200, Sheet `verified` value, matching headline, or reachable source
is metadata only. Each material claim needs claim identity, normalized value or
text, source references, provenance tier/type, support status, conflict status,
and risk. Lead sources remain distinct from verification sources and claim
evidence. Source instructions and article text are inert data.
Event identity uses project/corridor namespace, event type, action, and the
effective event date where available. Dedupe compares the event key, source
evidence, project/corridor relationship, chronology, and content overlap against
approved news, generated news, imported updates, reviewed overrides, and any
review-only open-PR index. A newer report is not automatically a new event.
Pricing, inventory, delivery promises, financing, legal/termination matters,
approvals/zoning, and chronology conflicts remain human-review decisions.
## Fact proposal boundary

The future proposal shape must include at least:
```json
{
  "project_id": "canonical-project-id",
  "field": "allowlisted-field",
  "old_value": "current-resolved-value",
  "proposed_value": "evidence-backed-value",
  "event_date": "YYYY-MM-DD",
  "effective_date": "YYYY-MM-DD",
  "evidence": [{ "claim_id": "claim-1", "source_ref_id": "source-1" }],
  "source_tier": "primary | secondary | mixed",
  "risk": "low | medium | high",
  "reason": "why this field-level change is supported",
  "review_requirement": "human_review",
  "supersedes_proposal_id": "optional-id",
  "expected_canonical_revision": "revision-or-commit",
  "expected_old_hash": "sha256-of-expected-old-value",
  "rollback": { "previous_value": "...", "source_revision": "..." },
  "apply": false
}
```
All current proposals are human-review only. The future unattended field
allowlist is empty and unapproved; no proposal may set `schemaSafe` or outrank
a Brooke-reviewed override. `content/overrides/project-fact-overrides.json` is only the existing Brooke-reviewed/manual JSON target. Future automated facts must retain explicit automated/source provenance within existing canonical machinery and must not write into or impersonate this override layer.
The existing TypeScript type and `src/lib/projectFieldAccessors.ts`/`src/lib/projectIntelligence.ts` define the accessor, precedence, and schema-review boundary; they are not write targets. No automated authority slot or new database is activated here. How provenance fits the shared resolver belongs to the next approved design/implementation slice.
## Authority and propagation

Use the existing canonical project model, identity registry, source catalog,
compare/building data, resolver, accessors, and generated schema-safe projection
(`docs/project-intelligence-architecture.md:14-30,47-70,104-129,214-226`).
Precedence remains Brooke-reviewed override, appropriate structured source, then
approved fallback. Brooke alone can approve an override and mark a value
`schemaSafe: true`.
After Brooke approves one field change, controlled regeneration must verify the
same canonical value across project pages, project/building cards, comparisons,
corridor/discovery surfaces, map, floorplan project context, JSON-LD/schema,
feeds, and AI discovery outputs. Historical Update/article content remains a
dated snapshot and is not rewritten by a current-fact change.
The first propagation proof must test these existing bypass consumers without
changing them in this design slice:

- `src/main.ts:2098-2137` — source-catalog facts are prepended to drafts.
- `src/main.ts:5575-5585` — authority comparison reads source facts directly.
- `src/main.ts:8053-8062` — related comparison IDs are hardcoded per project.
- `src/main.ts:8010-8042` — related-news fallback uses hardcoded rules.
- `src/main.ts:8138-8170` — entity brief reads source facts before projects.
- `src/main.ts:9488-9491` — floorplan lookup contains a South Flagler alias.
- `research/scripts/prerender-static-routes.mjs:73-90,521-590,1382-1413` —
  static HTML/schema use generated payloads and a separate schema-safe projection.
## Next approval slice

The next separately approved slice is limited to read-only adapters and one
shared review bundle consumed by both intake streams, followed by one isolated
single-field propagation proof in a disposable repository copy. It must not
invoke the article publisher, write the Sheet, apply a fact, create or modify a
Git branch/PR, push, merge, deploy, or change production data.
This task authorizes the design. Brooke must separately approve activation or
application of any allowlisted path, including the proposal schema, field
allowlist, review ownership, stale-revision rejection, and propagation proof.
Until then, the safe outcome is a review artifact with `apply: false` and a
clear hold decision.
