# Repo State Before Asset Automation

Inspection date: 2026-05-27

## Go / No-Go

No-go for asset automation until the current website repo state is resolved.

Reasons:

- The website checkout is ahead of `origin/main` by 1 commit.
- Three pre-existing dirty files are present: `src/main.ts`, `src/style.css`, and `vite.config.ts`.
- Two untracked inspection docs are present, including this workflow documentation set.
- The dirty changes are unrelated to asset automation and should not be mixed into future asset scripts, registry changes, or public asset publishing.
- The website repo remote mismatch should be acknowledged before any push/deploy work.

## Current Website Git State

Website repo path:

`/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB-New-Construction-Current`

Current branch:

`main`

Current remote:

```text
origin https://github.com/BrokenFL/WPB_New_Construction.git
```

Current status:

```text
## main...origin/main [ahead 1]
 M src/main.ts
 M src/style.css
 M vite.config.ts
?? docs/project-workflow-and-asset-map.md
?? docs/project-workflow-and-asset-pipeline.md
?? docs/reports/repo-state-before-asset-automation.md
```

Ahead/behind:

```text
origin/main...HEAD: behind 0, ahead 1
```

Staged files:

None.

Dirty tracked files:

```text
M src/main.ts
M src/style.css
M vite.config.ts
```

Recent commit evidence:

```text
02cabe4 (HEAD -> main) feat: overhaul project page visuals
7c78023 (origin/main, origin/HEAD) Merge pull request #14 from BrokenFL/visual/alba-approved-assets-refinement
d879763 Refine Alba approved asset presentation
917f0bf Add Gemini visual handoff brief
1d49b7d Add Alba approved asset registry test
fd59134 Install Playwright Chromium in deploy workflow
```

The local-only commit `02cabe4` changed `src/data/localIntelligence.ts`, `src/main.ts`, and `src/style.css` with a project-page visual/content overhaul.

## Website Repo Identity

Current origin remote:

`https://github.com/BrokenFL/WPB_New_Construction.git`

The repo contains strong evidence that `BrokenFL/WPB_New_Construction` is the active working/deploy repo:

- `docs/GEMINI_FIRST_TASK_PROMPT.md` references `https://github.com/BrokenFL/WPB_New_Construction`.
- `docs/GEMINI_VISUAL_HANDOFF.md` references `https://github.com/BrokenFL/WPB_New_Construction`.
- `docs/github-auth-for-news-automation.md` uses `BrokenFL/WPB_New_Construction`.
- `docs/news-update-pipeline.md` says the scheduled importer checks issues in `BrokenFL/WPB_New_Construction`.
- `research/scripts/import-gpt-news-issues.mjs` defaults to `BrokenFL/WPB_New_Construction`.
- `research/scripts/process-gpt-news-issues.mjs` defaults to `BrokenFL/WPB_New_Construction`.
- `docs/post-launch-product-audit.md` explicitly says the deployed site is `BrokenFL/WPB_New_Construction`, not `BrokenFL/WestPalmNewConstruction`, and warns that external inspection of `BrokenFL/WestPalmNewConstruction` can show stale or unrelated code.

The repo also contains historical or source-library references to `BrokenFL/WestPalmNewConstruction`:

- `research/scripts/harvest-assets.mjs` points to `research/source-repos/WestPalmNewConstruction`.
- `research/scripts/expand-public-asset-library.mjs` references `research/source-repos/WestPalmNewConstruction/data/buildings_master.json`.
- `research/scripts/apply-approved-asset-cleanup.mjs` references a placeholder path under `research/source-repos/WestPalmNewConstruction`.
- `research/source-material-review/project-source-catalog.json` and `research/asset-library/asset-manifest.json` contain `https://github.com/BrokenFL/WestPalmNewConstruction` as source inventory metadata.

Interpretation:

- `BrokenFL/WPB_New_Construction` appears to be the current active website repo for this checkout and deploy workflow.
- `BrokenFL/WestPalmNewConstruction` appears in older source/research metadata and should not be assumed to be the active deploy source without Brooke confirmation.

## Source-of-Truth Recommendation

Recommended handling:

1. Keep the current `origin` remote unchanged for now.
2. Treat `BrokenFL/WPB_New_Construction` as the operational source of truth for this local checkout unless Brooke explicitly confirms a repo migration.
3. Do not rename `origin` automatically.
4. Do not add a secondary remote yet unless future work needs to compare against `BrokenFL/WestPalmNewConstruction`.
5. If Brooke wants the canonical GitHub name to become `BrokenFL/WestPalmNewConstruction`, handle that as a separate repo-migration task after this dirty tree is clean.

Asset automation should be developed against this checkout only after the dirty work is either committed separately or moved to a clean branch/worktree.

## Dirty File Classification

### `src/main.ts`

Change size:

- 263 insertions
- 13 deletions

Observed change type:

- Imports `localIntelligence`.
- Adds Brooke's Local Take section to project pages when local intelligence exists.
- Adds project-page nav entries for Brooke's Take and Floor Plans.
- Adds a new project floorplan section with inquiry/download cards.
- Replaces the old team module render block with a new `renderProjectTeamSection`.
- Changes parking fallback copy from `Available upon request` to `Not publicly confirmed`.
- Adds new helper renderers for local take, floorplans, and project team summaries.

Classification:

- Related to prior site fixes: yes. It appears to continue the local project-page visual/content overhaul represented by local commit `02cabe4`.
- Related to asset automation: no. It does not add asset sync, asset repo publishing, iCloud handling, or registry automation.
- Should be committed separately before asset work: yes, if Brooke approves this visual/content change set.
- Should be left untouched by asset automation: yes.

Risk notes:

- `git diff --check` reports trailing whitespace in this file.
- The new code uses broad `any` types for `intel`, `floorplanProject`, and plans, which may pass existing style but is not asset-pipeline work.
- It inserts visible UI text and layout behavior; this deserves normal browser/QA review before being bundled with any unrelated automation.

### `src/style.css`

Change size:

- 445 insertions
- 0 deletions

Observed change type:

- Adds styling for Phase 2 content/detail panels.
- Adds styles for Brooke's Local Take.
- Adds floorplan card/grid styling.
- Adds project team pedigree/summary styling.
- Adds responsive rules for the new sections.

Classification:

- Related to prior site fixes: yes. The comment header says `PHASE 2 CONTENT & DETAIL PANELS STYLING`, which aligns with the project-page visual overhaul.
- Related to asset automation: no.
- Should be committed separately before asset work: yes, if Brooke approves this visual/content change set.
- Should be left untouched by asset automation: yes.

Risk notes:

- `git diff --check` reports trailing whitespace and a new blank line at EOF in this file.
- The changes use many `!important` declarations and affect page layout; they should be reviewed visually before asset automation begins.

### `vite.config.ts`

Change size:

- 10 insertions
- 1 deletion

Observed change type:

- Renames the approved-news manual chunk from `news-data` to `index-news-data`.
- Adds explicit manual chunks for:
  - `src/generated/siteData.ts` as `index-site-data`
  - `src/data/localIntelligence.ts` as `index-local-intel`
  - `src/data/marketNotes.ts` as `index-market-notes`

Classification:

- Related to prior site fixes: likely yes. It appears connected to project-page visual/content performance and bundle organization after adding `localIntelligence`.
- Related to asset automation: no.
- Should be committed separately before asset work: yes, if build/QA confirms it.
- Should be left untouched by asset automation: yes.

Risk notes:

- This changes bundle names/chunking and should be verified by build and deploy preview before shipping.
- It does not implement any asset pipeline behavior.

## Deploy Workflow References

Deploy workflow found:

- `.github/workflows/deploy-cloudflare-pages.yml`

Deploy script found:

- `research/scripts/deploy-cloudflare-pages-with-retry.mjs`

Package aliases:

- `npm run deploy:live`
- `npm run ship:live`

Deploy target:

- Cloudflare Pages project defaults to `wpbnewconstruction`.
- Production domains referenced in docs/scripts: `wpbnewconstruction.com` and `www.wpbnewconstruction.com`.

This supports the finding that the current checkout is operationally tied to the live `wpbnewconstruction` deployment flow.

## Recommended Next Action

Before starting asset automation:

1. Ask Brooke whether to keep using `BrokenFL/WPB_New_Construction` as the active website repo. Current evidence says yes.
2. Decide what to do with local commit `02cabe4` and the three dirty follow-on files.
3. If approved, clean up trailing whitespace and commit the visual/content work separately from asset automation.
4. Commit the inspection/report docs separately, or explicitly leave them untracked until Brooke decides.
5. Start asset automation from a clean worktree or a fresh branch/worktree after the above is resolved.

Recommended remote action:

- Do not change remotes now.
- Keep current `origin` as `BrokenFL/WPB_New_Construction`.
- Ask Brooke to confirm whether `BrokenFL/WestPalmNewConstruction` is historical/stale, or whether a formal repo migration is planned.

## Automation Warning

Do not proceed with asset sync/publish/refresh implementation in this working tree yet.

The current dirty files are not asset-related, and mixing asset automation with this visual/content work would make review, QA, and rollback harder.
