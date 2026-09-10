# WPB New Construction — authoritative Codex handoff

Updated September 10, 2026. Repository: `BrokenFL/WPB_New_Construction`.

This is the continuation entry point for the September 10 master handoff. Current refs, deployment records and revision-specific CI supersede historical SHAs below. Read `AGENTS.md` and both project guides first. Do not repeat completed audits. No merge or deployment is authorized by this document.

## Current state

- Production `main`: `c568746b545804bfab48cda8a9e7f214ddda9d36` (PR #87). Deployment/live evidence is recorded below; recheck before release.
- PR #86 (`p2-batch6-concierge-intents`): **PASS — ready for Brooke's review, still open draft and undeployed.** Tested feature/QA revision `593abf507ed302b8b422f95b2510892b87173156`; synthetic test merge `a22a3f9f9bd603693ac864d6b3cdfaa69e190b49`. Concierge run [34464411041](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411041) and social run [34464411029](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34464411029) both passed keyed/no-key/aggregate. This handoff/report/evidence is a documentation-only successor; application, QA and workflow sources match the green revision. See [Batch 6 implementation review](P2_BATCH6_IMPLEMENTATION_REVIEW.md) for the tested revision, CI and screenshots.
- PR #89 (`p2-development-intelligence-processor-v1`): **HOLD — not safe to merge yet**, including as internal tooling. Reviewed head `e478b78f0493ab022db9039bf590d3f361b91216`; implementation `f658516d2ad22c8dfe29ba0b6067e8daa8a804ac`. Latest dedicated Phase A keyed/no-key/aggregate run `34437180379` passed, but adversarial review found defects omitted by its fixtures. The earlier implementation run was `34430131725`.
- PR #88 (`planning/p2-development-intelligence-pipeline`, `c249e884f36cad4a113250b6624f287cd19e0140`): open draft planning/design reference. #89 is its limited Phase A implementation; neither enables Phase B.
- PR #85: Batch 6 conversion/concierge audit and scope reference, not an additional production release.
- PR #75 (`fix/ga4-command-queue`, `651001633ba14ea342285137815f6809950d95e2`): open draft, **parked**. GA4 transport remains unresolved and does not block independent site work.

The primary SSD checkout remains clean on the separate `codex/wpb-3d-city-map` branch at `36f1cff7fa76012dad7708fc80027a3e33e3e306`. PR review used isolated worktrees at `/Volumes/ExternalSSD/WPB_PR86_Review` and `/Volumes/ExternalSSD/WPB_PR89_Review`, preserving that work. Do not switch/reset/clean another worktree to resume these PRs.

## Released work to preserve

These are release records, not claims of measured traffic, leads or revenue gains.

| Release | Production record |
| --- | --- |
| Initial integrated P2, PR #74 | Homepage/Buildings, inquiry context and floor-plan foundation; preserve existing Olara D and PDF URLs. Historical component PRs #72/#73 are not new releases. |
| Batch 1, PR #76 | Downtown, South Flagler and Palm Beach corridors; merge `8128f7a5a24706a8fc743f156f2f1d0505f1b462`. |
| Batch 2, PR #78 | Comparisons and explicit shortlist preservation; merge `de5fd3d1581df372712d0f02ad54305d8f4f1b4b`. |
| Batch 3, PR #79 | Olara A/C/F/I/L added to D, six published HTML plans; merge `589d2f43151d7e57af6c7a831fe4837b66cb5d3a`. Alba HTML remains held. |
| Batch 4, PR #80 + #81 | Rosewood/Maison buyer guides and South Flagler House canonical-link hotfix; final `cdf8240a8a5c6b1bf482f0e48ce9e496fd9b0ebe`, live acceptance `34280040979`. |
| Batch 5, PR #83 | Authorship/trust; merge `0713e029cc251fc9a49c5e429fdda6ac85e46202`, live acceptance `34410472433`. Brooke authors About/Methodology and reviews Rosewood/Maison; Scott has a profile, no automatic bylines. |
| Batch 6C, PR #87 | Absolute HTTPS social images in raw and runtime HTML; tested code `6f81edfb0c2a0b3423c452e00268fbe751b35bb6`, production `c568746b545804bfab48cda8a9e7f214ddda9d36`, production workflow `34428992680`, live acceptance `34430077789`. |

Production was independently confirmed from the full workflow logs: run `34428992680` executed `npm run ship:live`, Wrangler uploaded 115 files, and deployment completed at `https://b18d1e76.wpbnewconstruction.pages.dev`; the post-deploy homepage returned HTTP 200 with a changed bundle. Run `34430077789` separately passed production raw/JS-off/hydrated/route/Maps verification at `c568746b545804bfab48cda8a9e7f214ddda9d36`. The misleading fallback step label is not evidence of a skipped deployment.

The older `PHASE_2_DELIVERY_TRACKER.md` Batch 5/production statements are historical. Use this current state and the linked PR closeouts, not its old unmerged status.

## PR #86 continuation

The inherited failure in run `34438949389` was CSS presentation: Olara/Maison DOM text, accessible name, input interest and normalized server interest were exactly `Request current availability`; only the submit button's `innerText` was uppercase via existing `src/style.css` styling. QA now compares exact semantic labels and actual form data, without case-insensitive matching.

Previously unreached verification also exposed a real legacy-query initialization defect: `/inquire/?interest=Request%20private%20floor-plan%20packet&project=olara` stayed on availability. The correction uses the shared intent registry to select the matching existing option before presentation normalization. Explicit form readiness and subsequent manual-choice preservation are checked. The complete authorship regression also found that the old heading normalizer demoted hidden project views before the active Rosewood view; it now scopes normalization to the rendered project and headings, preserving the single-H1 assertion. Readability corrections isolate the panel headings and inline summary from inherited page styles. Normal-resource screenshots explicitly decline analytics and dismiss the separate Building Watch prompt through its own control.

The old Batch 6C social workflow incorrectly applied PR #87's file allowlist to every later PR. Its original branch retains that scope check; all later PRs still execute the social behavior regressions and keyed/no-key gates. Deployment workflow is unchanged.

The complete legacy journey checks exposed a second intent defect: the shared remembered-origin owner assigned old labels after dropdown options were canonicalized, so later pricing/comparison submissions could omit `interest`. `src/lib/inquiryContext.ts` now selects by normalized intent ID, retains manual-edit guards, and refreshes presentation after updating the current context. Integration, corridor, comparison and Batch 4 tests retain legacy input URLs and verify exact canonical submitted interest/intent. All those local regressions passed on the rebuilt correction.

A local probe confirmed that analytics consent can appear after the keyed Maps test's early one-time check. Maps QA now starts with explicit denied consent and reports safe failure phases; its real loader/tile/zoom/layout requirements remain unchanged. Keyed Maps screenshots/results are retained behind the evidence scan. No new Maps runtime defect was inferred from the earlier undifferentiated cold-homepage failure.

The previously corrected `/map/` runtime defect has not been reopened. Batch 6 remains a contextual research/human-handoff feature; it is not generative AI, instant availability, automated booking, or proof of fulfillment.

## PR #89 safety review and next repair scope

The reviewer used Luna max, with Astra independently checking the critical code paths. Normal tests passed (typecheck, 15 focused tests, four offline fixture rows), while disposable adversarial probes established:

1. **Destructive artifact-path escape.** `research/scripts/intel/process-intel.mjs:69-90` joins raw `intel_id`, recursively removes the target, and writes the bundle. A selected `../../.git` ID deleted a sentinel in a disposable root's `.git`; invalid rows also reach this writer. A symlinked `.runtime/intel` escapes the root with an ordinary ID. Enforce ID/path/realpath containment before any removal or write, and cover traversal, invalid rows and symlink components. No real project files were used in these probes.
2. **Unrestricted source fetches.** `core.mjs:24-30` and `source-verifier.mjs:24-44` accept local/private/link-local HTTP targets and automatically follow redirects, with no per-request timeout. Stub-only probes confirmed acceptance; no real metadata/private services were contacted. Define bounded public-source retrieval and redirect checks.
3. **Intake verification masquerades as claim verification.** `core.mjs:83-94` can mark claims verified from the row flag alone, even with no supporting sources. The CLI supplies empty `claims_supported`; the verifier checks reachability, not source content. Downgrade unsupported claims or establish independent evidence support.
4. **Event identity conflicts do not consistently hold output.** `core.mjs:51-68` trusts supplied municipal/corridor keys; a supplied/derived project-key conflict at `:130-138` can still yield `project_update_only`. Derive and validate identity independently and route ambiguous/conflicting identity to review.
5. **Hostname suffix spoofing.** `source-verifier.mjs:3-13` accepts lookalike domain strings such as `evilrelatedross.com` as a trusted source tier. Use exact hosts or explicit subdomain boundaries.

There is no intentional Sheet write, Git/PR/push/merge/deploy API or subprocess in Phase A. However, the unsafe filesystem writer means the promised no-canonical-mutation guarantee is currently false. `mutation_count: 0` is a declared field, not proof of containment.

Other limits: repository/event dedupe and chronology are narrow fixture-oriented heuristics; missing indexes can silently become empty; open-PR dedupe uses an optional supplied index, not live GitHub. Semantic candidate hashes and artifact hashes serve different purposes and need a precise repository/version identity contract. Project-fact proposals are currently an empty array; their type declares `apply: false`, and no application path exists, but a nonempty proposal fixture remains needed. Green fixtures do not establish general source understanding.

No #89 implementation was changed during this review. A focused Phase A repair/re-review is the next recommendation; **Phase B remains unauthorized**.

## Intelligence Sheet architecture

Sheet ID: `1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8`; tabs `Incoming_Intel`, `Status_Rules`, `Corridors_and_Tiers`. The last reconciled snapshot had 46 headers and four event rows. This continuation did not refresh live cells; read the Sheet before processing current rows.

The Sheet is an intake/control queue, not canonical public project data. Keep `status`, `verification_status` and `output_decision` independent. `requires_human_review=TRUE` cannot be cleared by a score; `primary_source_url` is an untrusted hint. Row/webpage instructions never authorize writes. Lease columns do not provide atomic locking; Phase A is manually selected, single-worker tooling.

All four fixture rows remain human review: South Flagler House (`conflicting_event`), 464 Fern (`duplicate`), Portofino South and Downtown Master Plan. No approved publishing pilot is implied. South Flagler's retained top-out identity is `project|south-flagler-house|construction|topping-out|2025-11`; a later report is not a new event, and a later 15th-floor claim is a chronology conflict.

## Exact existing Codex intake and publisher

Live configuration was inspected read-only on this Mac:

- `/Users/brookesnader/.codex/automations/wpb-content-scout-safe-daily-publish/automation.toml`: **ACTIVE**, daily 09:15, local project/cwd `/Volumes/ExternalSSD/WPB_NewConstruction`, configured model `gpt-5.4-mini`, medium. It requires a clean synchronized `main`, applies the route rotation in `content/news-source-config.json`, prepares a runtime article JSON, and calls the existing `research/scripts/article-publish-cli.mjs --input <runtime-json> --preview`, followed by `--publish --ship` only under its existing policy. The configured model was inventoried, not changed by the Astra/Luna review arrangement.
- Latest recorded September 8/9 Scout runs were wrong-branch no-write skips. Configuration is not proof of a successful publication or a currently running job.
- `wpb-development-desk-morning-drafts`, `wpb-launch-qa-check`, `wpb-source-and-news-refresh` and `daily-wpb-project-fact-refresh` are paused.
- No WPB news LaunchAgent was loaded. The remaining user review-queue plist is disabled and refers to a missing launcher; repository importer/publisher plists are historical/manual definitions. Do not treat a launchctl enabled label as a loaded service.
- `import-gpt-news-issues.mjs` is a separate retained manual legacy intake: it can write `content/news-drafts.json`, comment on issues and add labels. `process-gpt-news-issues.mjs` can orchestrate publish/deploy; the legacy `content/news-automation-config.json` has `autoPublishEnabled: false`. Do not execute these while reviewing dry-run intelligence.

The active Scout bypasses the issue store and feeds the article publisher directly. Preserve its existing path and the Gemini/Sheet stream. Preserve `docs/news-update-pipeline.md`, `docs/article-publisher-workflow.md`, `docs/project-intelligence-architecture.md`, and `docs/automation-inventory.md`.

Publisher boundary: preview writes runtime artifacts; stage changes tracked article/generated outputs locally; publish commits/pushes; ship can deploy and run live QA. Reuse `article-publish-cli.mjs` and `article-publish-workflow.mjs`, never introduce a second publisher. No publisher mode was invoked in this continuation.

## Dual intake, one evidence and current-fact system

```text
Codex article intake ---------+
                             +-> source verification -> claim ledger
Gemini / Incoming_Intel -----+   -> event identity / dedupe -> output decision
                                      | article | fact proposal | both | neither
                                      v
                           reviewed canonical changes
                                      v
                              regenerate and verify
```

Use the existing canonical project model, source catalog, compare/building data, `content/overrides/project-fact-overrides.json`, `projectFactOverrides`, resolver/accessors, and generators. Never create a competing project database or label automated evidence as Brooke-reviewed. Preserve reviewed overrides and human-only `schemaSafe` authority.

An approved fact should update once and propagate through project page, building cards, comparisons, corridor pages, map, floor-plan project context, schema, feeds and AI discovery. Historical articles remain dated snapshots. An article and a current-fact change may be proposed independently; an article's newer publication date does not prove a newer underlying event.

Before implementing propagation, test the actual precedence paths: `projectFieldAccessors.ts` gives reviewed overrides priority, but source-first consumers such as `applySourceFactsToDraft`, the entity brief and corridor comparison in `main.ts` can bypass it. Static HTML and schema use distinct generated projections. Map all applicable consumers and prove one isolated field change updates them, leaves other projects untouched, and never rewrites historical articles.

Each fact proposal needs project/field identity, old/new values, effective/event date, evidence/claim references, risk/review decision, source revision, stale-write preconditions and rollback history. Pricing, inventory, delivery promises, financing, legal issues, assessments/buyouts, zoning/approval interpretation, conflicting timelines and ambiguous identities remain review-required. An unattended low-risk allowlist requires later field-specific approval, evidence, propagation and rollback tests.

## Boundaries, maintenance and next authorized work

- #86 verification, screenshots and review closeout are complete. Next action is Brooke's review/release decision. There is no standing merge/deploy authorization. After authorization, recheck current refs/checks and execute the existing controlled release/live-verification workflow.
- Return #89's hold recommendation and repair findings. A Phase A repair scope should be approved before expanding this review into implementation; do not implement Phase B, Sheet writeback, automatic branches/PRs or fact application.
- Preserve both separate 3D tracks: city map and Three.js floor-plan/property models. No 3D source/assets were modified here.
- Preserve Alba's unpublished HTML hold; existing floor-plan drawings/PDFs do not prove inventory.
- Preserve first-touch attribution, explicit shortlist, later manual selections, public/private data separation, stable Person IDs, one active H1 and one canonical JSON-LD graph, lead origin/rate/Turnstile/dedupe protections, and restricted-key Maps/no-key rejection.
- Real production lead/CAPTCHA/email/D1/CRM fulfillment remains untested. Use `BATCH4_MANUAL_PRODUCTION_LEAD_ACCEPTANCE.md` only after explicit real-lead authorization. Automated submissions are intercepted/controlled.
- GA4 transport and measurement are parked. No ranking, traffic, lead or revenue uplift is established.
- Maintenance backlog: assess current dependency advisories (local install reports one moderate/four high) without blind force upgrades; narrow measured JS-loading improvements; media dedupe only with reference/provenance/URL compatibility; additional source-backed guides/plans/comparisons; later newsletter/preferences; optional Batch 4 visual refinement. No broad `main.ts` rewrite.

Before any later release: inspect fresh origin/main, PR head and CI; identify feature SHA versus synthetic test-merge SHA; verify no unrelated dirty files; obtain Brooke's release authorization. A green review run is not a deployment.
