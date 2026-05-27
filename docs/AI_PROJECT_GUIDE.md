# WPB New Construction - Required AI Project Guide

REQUIRED READING FOR CODEX / ANTIGRAVITY / GEMINI / CLAUDE / FUTURE AI AGENTS: Read this file before making changes. Do not rely on older assumptions, stale repo names, or historical OpenClaw paths unless current files prove they are still active.

This guide documents the current operational architecture for WPB New Construction. It exists to prevent future agents from guessing paths, reviving stale repo names, mixing unrelated work, or publishing assets from the wrong layer.

## 1. Current Source Of Truth

- Active website repo: `BrokenFL/WPB_New_Construction`
- Local website path: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB-New-Construction-Current`
- Asset repo: `BrokenFL/WPB_New_Construction_Assets`
- Local asset repo: `/Volumes/ExternalSSD/WPB_NewConstruction_Assets`
- iCloud asset intake library: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library`
- Historical/stale repo name: `BrokenFL/WestPalmNewConstruction`

Treat `BrokenFL/WPB_New_Construction` as the active operational website repo unless Brooke explicitly says a repo migration happened. Treat `BrokenFL/WestPalmNewConstruction` as historical, stale, or research metadata only unless current repo files and Brooke both confirm otherwise.

The website repo is the live site code and deployment repo. The asset repo is the approved source warehouse. The iCloud asset library is a local intake/drop zone and is not a Git repo.

## 2. Three-Layer Asset Architecture

The asset system has three distinct layers:

```text
iCloud Asset Library
-> Asset Repo approved warehouse
-> Website public/assets/projects
-> data/project_assets.json
-> deployed site
```

- iCloud Asset Library: messy intake/drop zone for new materials and review folders.
- Asset repo: approved warehouse/source asset repository for files that have passed the website approval gate.
- Website repo: optimized deployed public assets, generated asset registry, website code, QA, and deployment workflow.

The website repo must never directly reference iCloud paths or asset repo absolute paths. Website-facing asset references must use `/assets/...` public paths only.

## 3. Never Do These Things

- Never publish directly from iCloud to the website repo.
- Never reference `/Users/...` paths in website data.
- Never reference `/Volumes/...` paths in website data.
- Never reference asset repo absolute paths in website data.
- Never reference source asset library paths in website data.
- Never assume `data/buildings_master.json` exists.
- Never assume `data/master_asset_index.csv` exists.
- Never assume old OpenClaw sync scripts exist.
- Never recreate old OpenClaw assumptions unless current files prove they are active.
- Never use `BrokenFL/WestPalmNewConstruction` as the active repo without Brooke confirmation.
- Never mix asset automation commits with curated content edits.
- Never mix visual/content changes with asset pipeline changes unless the user explicitly asks.
- Never force-push.
- Never change remotes without Brooke confirmation.
- Never push website changes before asset repo changes if the website depends on new asset repo state.
- Never delete or overwrite existing public website assets blindly.
- Never modify curated project copy when the task is asset automation or registry refresh only.

## 4. Asset Intake Rules

Approved iCloud folders may use flexible names. Recognize these case-insensitively:

- `approved-for-website`
- `approved_for_website`
- `Approved For Website`
- `approved website`
- `website-approved`
- `approved-web`
- `Website Approved`
- `For Website`

Only files inside approved folders are eligible for intake. Originals stay in the iCloud library and approved source-quality copies go to the asset repo warehouse.

Current asset intake script:

```bash
cd "/Volumes/ExternalSSD/WPB_NewConstruction_Assets"
node scripts/sync-icloud-approved-assets.mjs --dry-run
node scripts/sync-icloud-approved-assets.mjs --write
```

Current asset repo manifest:

```text
/Volumes/ExternalSSD/WPB_NewConstruction_Assets/asset-manifest.json
```

Asset repo warehouse destination convention:

```text
public-projects/{project-slug}/approved-for-website/images
public-projects/{project-slug}/approved-for-website/logos
public-projects/{project-slug}/approved-for-website/floorplans
public-projects/{project-slug}/approved-for-website/site-plans
public-projects/{project-slug}/approved-for-website/docs
public-projects/{project-slug}/approved-for-website/misc
```

Use lowercase dash/kebab-case stored filenames. Do not use underscores in final warehouse or public website filenames.

## 5. Website Publishing Rules

Current website publisher script:

```bash
cd "/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB-New-Construction-Current"
npm run assets:publish:dry
npm run assets:publish
```

Publisher implementation:

```text
scripts/publish-assets-from-asset-repo.mjs
```

Publisher source:

```text
/Volumes/ExternalSSD/WPB_NewConstruction_Assets/public-projects/{project-slug}/approved-for-website
```

Publisher destination:

```text
public/assets/projects/{project-slug}/{category}/...
```

Website repo gets optimized website-ready copies only. It should not receive raw source files or unapproved originals.

Publishing expectations:

- WebP is preferred for renderings and photographic gallery images.
- PNG is preserved when transparency, logos, or cutouts make PNG safer.
- SVG is acceptable for clean logos/icons.
- PDFs are preserved for floorplans when the site supports floorplan links/documents.
- Raw/source/design formats do not belong in `public/assets/projects`.
- Existing website assets should not be deleted or overwritten blindly.

## 6. Website Registry Rules

Current registry refresh script:

```bash
npm run assets:refresh:dry
npm run assets:refresh
```

Registry implementation:

```text
scripts/refresh-website-asset-references.mjs
```

Website asset registry:

```text
data/project_assets.json
```

Generated publish manifest:

```text
data/generated_asset_publish_manifest.json
```

Website asset references must begin with `/assets/`, for example:

```text
/assets/projects/{project-slug}/{category}/{filename}
```

Do not place `/Users/...`, `/Volumes/...`, iCloud paths, or asset repo paths in website data.

Alba Palm Beach and Berkeley are currently wired through the approved registry. The gallery consumer can use approved registry assets for non-Alba projects. If approved registry assets exist for a project, old imported/draft gallery fallbacks should not create broken visible gallery images.

## 7. Audit And QA Rules

Current audit script:

```bash
npm run assets:audit
```

Audit implementation:

```text
scripts/audit-asset-pipeline.mjs
```

Before asset work and before website pushes, run:

```bash
npm run assets:audit
npm run typecheck
npm run build
npm test
```

Rules:

- Broken `/assets` references must be `0`.
- Local path leaks in live/rendered output are blockers.
- Website data must not expose iCloud or asset repo absolute paths.
- Audit findings may include legacy research-script warnings. Those are not automatically live blockers unless they affect website output or generated public data.
- If the working tree has unrelated dirty files, stop and classify them before proceeding.

## 8. Deployment Rules

Deploy workflow:

```text
Deploy Cloudflare Pages
```

Workflow file:

```text
.github/workflows/deploy-cloudflare-pages.yml
```

Deploy script:

```text
research/scripts/deploy-cloudflare-pages-with-retry.mjs
```

Cloudflare Pages project:

```text
wpbnewconstruction
```

Production domains:

```text
wpbnewconstruction.com
www.wpbnewconstruction.com
```

The current deploy path is working. A misleading fallback label can appear in the GitHub Actions step view. Check the full logs before deciding that Cloudflare is not configured. The real deploy step should show the Pages project, masked credentials, upload count, deployment URL, and before/after live bundle evidence.

Latest confirmed Pages deployment:

```text
https://e901a7a0.wpbnewconstruction.pages.dev
```

Latest confirmed production bundle:

```text
/assets/index-CMPjqao9.js
```

Required GitHub secrets by name:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

Optional repository variable:

- `VITE_GOOGLE_MAPS_MAP_ID`

Do not print secret values. Secret names and masked values are safe to report.

## 9. Current Scripts Cheat Sheet

Website repo commands:

```bash
npm run assets:audit
npm run assets:publish:dry
npm run assets:publish
npm run assets:refresh:dry
npm run assets:refresh
npm run typecheck
npm run build
npm test
```

Asset repo direct commands:

```bash
cd "/Volumes/ExternalSSD/WPB_NewConstruction_Assets"
node scripts/sync-icloud-approved-assets.mjs --dry-run
node scripts/sync-icloud-approved-assets.mjs --write
```

Safe manual deploy trigger after pushing `main`:

```bash
gh workflow run deploy-cloudflare-pages.yml --ref main
```

## 10. Commit And Push Order

- Commit and push asset repo changes before dependent website changes.
- Push the website repo only after the asset repo state it depends on is available.
- Always verify both working trees are clean before starting and before pushing.
- Never force-push.
- Never rewrite history unless Brooke explicitly instructs it and understands the impact.
- Run full website verification before website push:

```bash
npm run assets:audit
npm run typecheck
npm run build
npm test
```

Suggested separation:

- Asset repo intake commit: intake script, asset manifest, intake reports, approved warehouse files.
- Website audit commit: audit script and audit reports.
- Website publisher commit: publisher script, optimized public assets, publish manifest, publish reports.
- Website registry commit: registry refresh script, `data/project_assets.json`, site registry consumption changes, refresh reports.
- Deployment/report-only commits should stay separate from behavior or asset changes.

## 11. Recent Known Good State

Asset repo pushed clean with:

```text
d4adf95 Sync approved website assets into asset repository
```

Website pushed clean through:

```text
4ace950 Merge remote-tracking branch 'origin/main'
```

Recent website asset pipeline commits:

```text
546ecfc Add asset pipeline audit
c900a4c Publish approved assets from asset repository
fd18092 Refresh project asset registry from published assets
4ace950 Merge remote-tracking branch 'origin/main'
```

Recent asset repo intake commit:

```text
d4adf95 Sync approved website assets into asset repository
```

Known good checks:

- CI passed.
- Cloudflare Pages deploy succeeded.
- Production smoke checks passed for homepage, Alba Palm Beach, and Berkeley.
- Broken `/assets` references: `0`.
- No local `/Users` or `/Volumes` paths appeared in rendered route HTML for the smoke-checked pages.
- Production `www.wpbnewconstruction.com` served bundle `/assets/index-CMPjqao9.js`.

## 12. Handoff Instruction For Future AI

Before making changes:

1. Read this guide.
2. Run git status in both repos.
3. Confirm active website repo is BrokenFL/WPB_New_Construction.
4. Confirm asset repo is BrokenFL/WPB_New_Construction_Assets.
5. Run npm run assets:audit before asset work.
6. Do not proceed if the working tree contains unrelated dirty files.
7. Ask Brooke before changing repo remotes or deployment workflow.

If current files contradict this guide, inspect carefully and report the contradiction before changing behavior.
