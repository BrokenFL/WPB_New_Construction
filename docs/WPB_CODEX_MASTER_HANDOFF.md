# WPB New Construction — authoritative Codex handoff

Updated September 10, 2026. Repository: `BrokenFL/WPB_New_Construction`.

This is the continuation entry point for the September 10 master handoff. Current refs, deployment records and revision-specific CI supersede historical SHAs below. Read `AGENTS.md` and both project guides first. Do not repeat completed audits. No additional merge or deployment is authorized by this document.

## Current state

- Production `main`: `2d0175eed5157afa58b57cfb8327ec590e2dda95`, following approved PR #86 head `e8483fc3a7a43aabd1827b98667f60f64ff0deb1`; the merge commit and production SHA are `2d0175eed5157afa58b57cfb8327ec590e2dda95` at `2026-09-10T19:58:49Z`. Normal deploy [34523585398](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34523585398) succeeded at `https://c0498f38.wpbnewconstruction.pages.dev`; no duplicate manual deployment was initiated.
- PR #86 (`p2-batch6-concierge-intents`): **APPROVED / MERGED / DEPLOYED; live acceptance is BLOCKED by a confirmed mobile hit-target overlap — not LIVE-VERIFIED.** All nine CI jobs passed in [concierge 34468567260](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34468567260), [Batch 5 34468567325](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34468567325) and [social 34468567278](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34468567278). Application sources are unchanged after last application change `85eeae70d59fdbc87f169692dc6464128910bbbf`; approved PR head `e8483fc3a7a43aabd1827b98667f60f64ff0deb1` full CI governs this release record. The retained production manifest records 11 representative routes × desktop/mobile, six Olara plans × desktop/mobile, real Maps tile/zoom checks, an explicit shortlist submission, and hydrated metadata checks, with intercepted leads only. The focused 390px `/map/` check failed: Ask WPB overlaps native Zoom-out by 1,495px² and the pointer opens the concierge; do not mark LIVE-VERIFIED. See the [review report](P2_BATCH6_IMPLEMENTATION_REVIEW.md), [historical 3cc QA acceptance record](evidence/batch6-2026-09-10/final-acceptance.json) and [durable live evidence](evidence/batch6-live-2026-09-10/README.md).
- PR #93 (`fix/batch6-mobile-map-controls`): **OPEN DRAFT / CANDIDATE ONLY; NOT APPROVED / NOT DEPLOYED.** Candidate revision `ae076dc5926baeebedb30b8d45b23a2ade710c05` carries application source `f761a0057460a98a45c333b2ffb16fad5b22e59d` against production base `2d0175eed5157afa58b57cfb8327ec590e2dda95`; it moves the shared native Google Maps zoom controls with `zoomControlOptions` `LEFT_CENTER`. Local typecheck, build, 22 concierge views and no-key Maps checks pass; a candidate-only real-Maps override reports zero overlap. Revision-specific CI is linked at [concierge 34531549077](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34531549077) and [social 34531549133](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34531549133); the latest conclusion belongs to [PR #93](https://github.com/BrokenFL/WPB_New_Construction/pull/93). The final QA contract retains six scenarios for bounded native-control readiness and independent fresh-context mobile zoom directions. A complete successful check set and separate Brooke release approval are required; production remains blocked by the recorded overlap and one authorized deploy has already been used.
- PR #89 (`p2-development-intelligence-processor-v1`): **SAFETY REVIEW PASSED — MERGE INTERNAL TOOLING ONLY recommended; NOT APPROVED / NOT MERGED / NOT DEPLOYED.** Verified source revision `7953d4a66e13b37e4d9ffc02447ca19735d603bf` passes the focused 45-test safety set, typecheck, four offline rows, bundle-hash and unchanged-canonical checks. All four required CI runs and 12 jobs are green: [Phase A 34527256679](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34527256679), [concierge 34527256629](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34527256629), [Batch 5 34527256644](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34527256644) and [social 34527256689](https://github.com/BrokenFL/WPB_New_Construction/actions/runs/34527256689). The recommendation is bounded to the documented trusted-local single-worker model; separate Brooke authorization is still required. See the [compact safety acceptance](evidence/intel-phase-a-safety-2026-09-10/acceptance.json) and [Phase A](P2_INTELLIGENCE_PROCESSOR_PHASE_A.md). Phase B, Sheet writeback, fact application and external publication remain unauthorized.
- PR #88 (`planning/p2-development-intelligence-pipeline`, `c249e884f36cad4a113250b6624f287cd19e0140`): open draft planning/design reference. #89 is its limited Phase A implementation; neither enables Phase B.
- PR #85: Batch 6 conversion/concierge audit and scope reference, not an additional production release.
- PR #75 (`fix/ga4-command-queue`, `651001633ba14ea342285137815f6809950d95e2`): open draft, **parked**. GA4 transport remains unresolved and does not block independent site work.
- PR #5 (`research/copy-intelligence-briefs`, `5753f10ec570b61f747a195a6878ed40a509769f`): older copy-framework reference, open and untouched.

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
| Batch 6, PR #86 | Concierge/intents; approved PR head `e8483fc3a7a43aabd1827b98667f60f64ff0deb1`; merge commit/production `2d0175eed5157afa58b57cfb8327ec590e2dda95`, normal deploy `34523585398` at `https://c0498f38.wpbnewconstruction.pages.dev`; real Maps, shortlist and hydrated metadata probes pass, but the 390px Ask WPB/Maps Zoom-out hit-target check failed with a 1,495px² overlap and pointer interception, blocking LIVE-VERIFIED. |

Earlier Batch 6C release evidence: workflow run `34428992680` executed `npm run ship:live`, Wrangler uploaded 115 files, and deployment completed at `https://b18d1e76.wpbnewconstruction.pages.dev`; the post-deploy homepage returned HTTP 200 with a changed bundle. Run `34430077789` separately passed production raw/JS-off/hydrated/route/Maps verification at `c568746b545804bfab48cda8a9e7f214ddda9d36`. The misleading fallback step label is not evidence of a skipped deployment.

The tracker now records the PR #86 release and the confirmed mobile hit-target blocker. Older Batch 5/production statements remain historical; use this current state and linked closeouts.

## PR #86 continuation

The approved PR #86 head `e8483fc3a7a43aabd1827b98667f60f64ff0deb1` reached production through merge commit `2d0175eed5157afa58b57cfb8327ec590e2dda95` at `2026-09-10T19:58:49Z` via the single successful normal deploy `34523585398` (`https://c0498f38.wpbnewconstruction.pages.dev`). No manual or duplicate deploy was run.

Existing production evidence at `/Volumes/ExternalSSD/WPB_PR86_Review/.runtime/batch6-live-2026-09-10/manifest.json` records 11 representative routes × desktop/mobile, six Olara plans × desktop/mobile, real Maps tile/zoom checks, an explicit shortlist submission, and hydrated metadata, with intercepted inquiries only. The manifest references the current `index-BNfunLZT.js` bundle. Those probes pass; the focused 390px `/map/` Ask WPB/Maps Zoom-out check failed with a 1,495px² overlap and pointer interception, so do not mark this release LIVE-VERIFIED. The selected durable evidence is in [batch6-live-2026-09-10](evidence/batch6-live-2026-09-10/README.md).

The inherited failure in run `34438949389` was CSS presentation: Olara/Maison DOM text, accessible name, input interest and normalized server interest were exactly `Request current availability`; only the submit button's `innerText` was uppercase via existing `src/style.css` styling. QA now compares exact semantic labels and actual form data, without case-insensitive matching.

Previously unreached verification also exposed a real legacy-query initialization defect: `/inquire/?interest=Request%20private%20floor-plan%20packet&project=olara` stayed on availability. The correction uses the shared intent registry to select the matching existing option before presentation normalization. Explicit form readiness and subsequent manual-choice preservation are checked. The complete authorship regression also found that the old heading normalizer demoted hidden project views before the active Rosewood view; it now scopes normalization to the rendered project and headings, preserving the single-H1 assertion. Readability corrections isolate the panel headings and inline summary from inherited page styles. Normal-resource screenshots explicitly decline analytics and dismiss the separate Building Watch prompt through its own control.

The old Batch 6C social workflow incorrectly applied PR #87's file allowlist to every later PR. Its original branch retains that scope check; all later PRs still execute the social behavior regressions and keyed/no-key gates. Separately, commit `8401e8dc70c063c42115e1c5aefee5ef3f9702f6` limits the historical Batch 5 protected-file freeze to its original authorship branch while retaining its ancestry, deferred-track exclusions and full regression suite. Deployment workflow is unchanged.

The complete legacy journey checks exposed a second intent defect: the shared remembered-origin owner assigned old labels after dropdown options were canonicalized, so later pricing/comparison submissions could omit `interest`. `src/lib/inquiryContext.ts` now selects by normalized intent ID, retains manual-edit guards, and refreshes presentation after updating the current context. Integration, corridor, comparison and Batch 4 tests retain legacy input URLs and verify exact canonical submitted interest/intent. All those local regressions passed on the rebuilt correction.

A local probe confirmed that analytics consent can appear after the keyed Maps test's early one-time check. Maps QA now starts with explicit denied consent and reports safe failure phases; its real loader/tile/zoom/layout requirements remain unchanged. QA revision `3cc9052c0c52d094aa888ce5a4c42d90c3b71f48` replaces the keyed legacy fixed wait with bounded visible semantic readiness and loaded Google tile evidence; the no-key fixed wait is unchanged. Keyed Maps screenshots/results are retained behind the evidence scan. No new Maps runtime defect was inferred from the earlier undifferentiated cold-homepage failure.

The previously corrected `/map/` runtime defect has not been reopened. Batch 6 remains a contextual research/human-handoff feature; it is not generative AI, instant availability, automated booking, or proof of fulfillment.

## PR #89 safety review and repair state

PR #89 has **PASSED SAFETY REVIEW with a MERGE INTERNAL TOOLING ONLY recommendation**, but remains **NOT APPROVED / NOT MERGED / NOT DEPLOYED**; separate Brooke authorization is required. Verified source revision `7953d4a66e13b37e4d9ffc02447ca19735d603bf` passes 45 focused tests, typecheck, four offline rows, bundle-hash and unchanged-canonical checks, and all four CI runs/12 jobs are green. The [compact safety acceptance](evidence/intel-phase-a-safety-2026-09-10/acceptance.json) records exact run, job and artifact identities. The accepted repair direction is recorded in [Phase A](P2_INTELLIGENCE_PROCESSOR_PHASE_A.md): required repository indexes fail closed; the runtime writer accepts only a strict ID and six fixed files under the canonical `.runtime/intel/<id>/` chain, rejects traversal/symlink/hard-link escapes, performs per-file atomic replacement without recursive deletion, and remains bounded to a trusted single local worker. Source retrieval is bounded and remains unadjudicated; a separate trusted local evidence API binds review to the exact intake, claim and fetched-source digest. Unsupported or human-review material yields `candidate: null`; fact proposals remain held/review-only with `apply: false`. No branch automation or deployment occurred.

Remaining limits are narrow event/dedupe heuristics, optional absent review indexes, and the absence of an openat-style guarantee against a concurrent hostile filesystem race. No Sheet write, canonical-data mutation, Git/GitHub action, publication, deployment or Phase B is authorized by this tooling. **Phase B remains unauthorized.**

## Intelligence Sheet architecture

Sheet ID: `1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8`; tabs `Incoming_Intel`, `Status_Rules`, `Corridors_and_Tiers`. The last reconciled snapshot had 46 headers and four event rows. This continuation did not refresh live cells; read the Sheet before processing current rows.

The Sheet is an intake/control queue, not canonical public project data. Keep `status`, `verification_status` and `output_decision` independent. `requires_human_review=TRUE` cannot be cleared by a score; `primary_source_url` is an untrusted hint. Row/webpage instructions never authorize writes. Lease columns do not provide atomic locking; Phase A is manually selected, single-worker tooling.

All four fixture rows remain human review: South Flagler House (`conflicting_event`), 464 Fern (`duplicate`), Portofino South and Downtown Master Plan. No approved publishing pilot is implied. South Flagler's retained top-out identity is `project|south-flagler-house|construction|topping-out|2025-11`; a later report is not a new event, and a later 15th-floor claim is a chronology conflict.

## Exact existing Codex intake and publisher

Live configuration was inspected read-only on this Mac:

- `/Users/brookesnader/.codex/automations/wpb-content-scout-safe-daily-publish/automation.toml`: **ACTIVE**, daily 09:15, local project/cwd `/Volumes/ExternalSSD/WPB_NewConstruction`, configured model `gpt-5.4-mini`, medium. It requires a clean synchronized `main`, applies the route rotation in `content/news-source-config.json`, prepares a runtime article JSON, and calls the existing `research/scripts/article-publish-cli.mjs --input <runtime-json> --preview`, followed by `--publish --ship` under its standing policy. The active prompt says “No review queue” and permits at most one safe story when its gates pass; the configured model was inventoried, not changed by the Astra/Luna review arrangement.
- The legacy collector configs retain `reviewOnly: true` and `autoPublishEnabled: false`; they do not add a per-run review queue to the active Scout. The intake inventory observed skipped/no-write Sep 8/9 Scout runs. Configuration is not proof of historical publication or a currently running job.
- `wpb-development-desk-morning-drafts`, `wpb-launch-qa-check`, `wpb-source-and-news-refresh` and `daily-wpb-project-fact-refresh` are paused.
- No WPB news LaunchAgent was loaded. The remaining user review-queue plist is disabled and refers to a missing launcher; repository importer/publisher plists are historical/manual definitions. Do not treat a launchctl enabled label as a loaded service.
- `import-gpt-news-issues.mjs` is a separate retained manual legacy intake: it can write `content/news-drafts.json`, comment on issues and add labels. `process-gpt-news-issues.mjs` can orchestrate publish/deploy; the legacy `content/news-automation-config.json` has `autoPublishEnabled: false`. Do not execute these while reviewing dry-run intelligence.

The active Scout bypasses the issue store and feeds the article publisher directly. Preserve its existing path and the Gemini/Sheet stream. Preserve `docs/news-update-pipeline.md`, `docs/article-publisher-workflow.md`, `docs/project-intelligence-architecture.md`, and `docs/automation-inventory.md`.

Publisher boundary: preview writes runtime artifacts; stage changes tracked article/generated outputs locally; publish commits/pushes; ship can deploy and run live QA. Reuse `article-publish-cli.mjs` and `article-publish-workflow.mjs`, never introduce a second publisher. No live article publication or publisher `--ship` deployment was invoked in this handoff; the separate PR #86 site deployment is recorded above, and automated publisher QA used isolated fixtures.

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

Use the existing canonical project model, source catalog, compare/building data, `content/overrides/project-fact-overrides.json`, `projectFactOverrides`, resolver/accessors, and generators. The JSON overrides file is only the existing Brooke-reviewed/manual target; future automated facts must retain explicit automated/source provenance and must not write into or impersonate that layer. Never create a competing project database or label automated evidence as Brooke-reviewed. Preserve reviewed overrides and human-only `schemaSafe` authority.

An approved fact should update once and propagate through project page, building cards, comparisons, corridor pages, map, floor-plan project context, schema, feeds and AI discovery. Historical articles remain dated snapshots. An article and a current-fact change may be proposed independently; an article's newer publication date does not prove a newer underlying event.

Before implementing propagation, test the actual precedence paths: `projectFieldAccessors.ts` gives reviewed overrides priority, but source-first consumers such as `applySourceFactsToDraft`, the entity brief and corridor comparison in `main.ts` can bypass it. Static HTML and schema use distinct generated projections. Map all applicable consumers and prove one isolated field change updates them, leaves other projects untouched, and never rewrites historical articles.

Each fact proposal needs project/field identity, old/new values, effective/event date, evidence/claim references, risk/review decision, source revision, stale-write preconditions and rollback history. Pricing, inventory, delivery promises, financing, legal issues, assessments/buyouts, zoning/approval interpretation, conflicting timelines and ambiguous identities remain review-required. An unattended low-risk allowlist requires later field-specific approval, evidence, propagation and rollback tests.

## Boundaries, maintenance and next authorized work

- #86 is approved, merged and deployed at production `2d0175eed5157afa58b57cfb8327ec590e2dda95`; all nine CI jobs passed and the normal deploy succeeded. Final live acceptance is blocked by the confirmed 390px `/map/` Ask WPB/Maps Zoom-out overlap and pointer interception; do not label it LIVE-VERIFIED. See the [durable live evidence](evidence/batch6-live-2026-09-10/README.md).
- #89 safety review passed at source revision `7953d4a66e13b37e4d9ffc02447ca19735d603bf`; its focused 45-test set, typecheck, four offline rows, bundle-hash, unchanged-canonical checks and all four CI runs/12 jobs pass. **MERGE INTERNAL TOOLING ONLY** is recommended under the trusted-local single-worker model, but the PR remains NOT APPROVED / NOT MERGED / NOT DEPLOYED pending separate Brooke authorization. Preserve the Phase A dry-run boundary and do not implement Phase B, Sheet writeback, automatic branches/PRs or fact application.
- Preserve the separate MapLibre-selected 3D city-map track and Three.js floor-plan/property dollhouse track. No 3D source/assets were modified here.
- Preserve Alba's unpublished HTML hold; existing floor-plan drawings/PDFs do not prove inventory.
- Preserve first-touch attribution, explicit shortlist, later manual selections, public/private data separation, stable Person IDs, one active H1 and one canonical JSON-LD graph, lead origin/rate/Turnstile/dedupe protections, and restricted-key Maps/no-key rejection.
- Real production lead/CAPTCHA/email/D1/CRM fulfillment remains untested. Use `BATCH4_MANUAL_PRODUCTION_LEAD_ACCEPTANCE.md` only after explicit real-lead authorization. Automated submissions are intercepted/controlled.
- GA4 transport and measurement are parked. No ranking, traffic, lead or revenue uplift is established.
- Maintenance backlog: assess current dependency advisories (local install reports one moderate/four high) without blind force upgrades; narrow measured JS-loading improvements; media dedupe only with reference/provenance/URL compatibility; additional source-backed guides/plans/comparisons; later newsletter/preferences; optional Batch 4 visual refinement. No broad `main.ts` rewrite.

Before any later release: inspect fresh origin/main, PR head and CI; identify feature SHA versus synthetic test-merge SHA; verify no unrelated dirty files; obtain Brooke's release authorization. A green review run is not a deployment.
