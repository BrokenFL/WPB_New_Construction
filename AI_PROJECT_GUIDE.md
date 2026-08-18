# WPB New Construction - Required AI Project Guide

REQUIRED READING FOR CODEX / ANTIGRAVITY / GEMINI / CLAUDE / FUTURE AI AGENTS: Read this file before making changes. Do not rely on older assumptions, stale repo names, or historical OpenClaw paths unless current files prove they are still active.

This root-level copy mirrors `docs/AI_PROJECT_GUIDE.md` so tools opened at the project root can find the handoff without browsing `docs/` first.

## 1. Current Source Of Truth

- Active website repo: `BrokenFL/WPB_New_Construction`
- Primary local website path: `/Volumes/ExternalSSD/WPB_NewConstruction`
- Approved laptop fallback checkout: `/Users/brookesnader/Documents/WPB_New_Consrtuction_Git`
- Secondary/historical CloudDocs checkout: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB-New-Construction-Current`
- Asset repo: `BrokenFL/WPB_New_Construction_Assets`
- Local asset repo: `/Volumes/ExternalSSD/WPB_NewConstruction_Assets`
- iCloud asset intake library: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library`
- Historical/stale repo name: `BrokenFL/WestPalmNewConstruction`

As of 2026-06-18, use `/Volumes/ExternalSSD/WPB_NewConstruction` as the primary local website working checkout when the SSD is available. The approved laptop fallback is `/Users/brookesnader/Documents/WPB_New_Consrtuction_Git`; use it when working on a machine without the SSD checkout, but still confirm `pwd`, `git remote -v`, `git branch --show-current`, and `git status --short --branch` before editing so it stays aligned with `BrokenFL/WPB_New_Construction`. Treat the CloudDocs checkout as secondary/historical unless Brooke explicitly asks you to inspect or recover from it. On 2026-06-03 the CloudDocs checkout was behind `origin/main` and dirty, so do not use it for normal implementation, QA, push, or deploy work without first proving it is intended and clean.

Treat `BrokenFL/WPB_New_Construction` as the active operational website repo unless Brooke explicitly says a repo migration happened. Treat `BrokenFL/WestPalmNewConstruction` as historical, stale, or research metadata only unless current repo files and Brooke both confirm otherwise.

The website repo is the live site code and deployment repo. The asset repo is the approved source warehouse. The iCloud asset library is a local intake/drop zone and is not a Git repo.

Before editing, confirm the local checkout with `pwd`, `git remote -v`, `git branch --show-current`, and `git status --short --branch`. Approved website work paths are `/Volumes/ExternalSSD/WPB_NewConstruction` and `/Users/brookesnader/Documents/WPB_New_Consrtuction_Git`. If the path is not one of those approved checkouts, stop and explain why you are in another checkout before changing files.

## 2. Three-Layer Asset Architecture

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
cd "/Volumes/ExternalSSD/WPB_NewConstruction"
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
- Always verify the SSD website repo and the asset repo working trees before starting and before pushing.
- If the website repo is dirty, classify each path as user work, generated output, report-only output, or your intended edit before running scripts that rewrite files.
- Do not stage, revert, overwrite, or clean dirty paths you did not create unless Brooke explicitly asks.
- If a deploy is needed while the primary checkout is dirty with unrelated work, deploy from committed `main` or a fresh clean worktree, not from the dirty local state.
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
2. Confirm you are in `/Volumes/ExternalSSD/WPB_NewConstruction` or the approved laptop fallback `/Users/brookesnader/Documents/WPB_New_Consrtuction_Git` for website work.
3. Confirm active website repo is BrokenFL/WPB_New_Construction.
4. Confirm asset repo is BrokenFL/WPB_New_Construction_Assets.
5. Run git status in the active website repo checkout you are using and the asset repo.
6. Classify any dirty paths before running generators, QA that writes reports, staging, pushing, or deploying.
7. Run npm run assets:audit before asset work.
8. Ask Brooke before changing repo remotes or deployment workflow.

If current files contradict this guide, inspect carefully and report the contradiction before changing behavior.

Article publishing is transaction-protected: preview validates canonical URLs and image repetition in `.runtime/`; stage/publish require clean synchronized `main`; automated runs get one persisted attempt; and pre-commit failures, signals, or command timeouts roll back article outputs. The implementation remains `research/scripts/article-publish-cli.mjs` plus `research/scripts/article-publish-workflow.mjs`.

## 13. Content Studio / Builder — Current State (updated 2026-06-19)

This section mirrors `docs/AI_PROJECT_GUIDE.md` section 13. Read that file for full workflow detail.

### Project Intelligence and Project Facts

- Brooke Builder includes a local-only Project Intelligence Review cockpit for compare/source/schema conflict review.
- The cockpit is unlinked, noindex, and must not be added to public navigation or sitemap output.
- Manual overrides live in `content/overrides/project-fact-overrides.json` (written by `/api/project-fact-override`).
- For buyer-facing fields, the compare database is the preferred source unless Brooke overrides a value manually.
- `qa:content-studio` is a safety check for builder exposure.
- `qa:project-intelligence` is a warning-only audit that reports real conflicts for Brooke review. A non-zero issue count is not a code bug.
- **Project Facts** panel in the sidebar lets Brooke update any building field directly without the review queue.

### Article Manager — All Articles View

Article Manager round-trips structured content for News Updates, Buyer Intelligence, and Downtown Spotlight. The All Articles view shows all three destinations together (18 articles as of 2026-06-19: 6 news, 8 buyer, 4 downtown).

Market notes (`src/data/marketNotes.ts`) are loaded by `readTsArray()` in `server.mjs`. Do not add comment-stripping logic that removes `//` globally — it would corrupt URL strings inside the data.

### Article Manager — Delete Published Articles

A **Delete** button now appears on every published article row.

- **News** → hard-deletes from `research/news-review/approved-development-news.json`
- **Buyer / Downtown** → sets `status: "archived"` in `src/data/marketNotes.ts` via targeted string replace

`MarketNoteStatus` includes `"archived"`. Typecheck is clean.

### Auto-Deploy on Delete / Archive / Publish

| Action | Auto-commit+push | Deploy |
|---|---|---|
| Delete article (any destination) | Yes | Yes |
| Archive article (news) | Yes | Yes |
| New / edited article → Publish Live | Yes | Yes |
| Save Draft / Import Draft | Never | Never |

Deploy is triggered by `git push` → GitHub Actions `deploy-cloudflare-pages.yml`. No `gh` CLI required.

### Article Commit Allowlist (current)

```
research/news-review/approved-development-news.json
src/data/approvedExternalNews.ts
src/data/marketNotes.ts
src/generated/siteData.ts
public/data/news-feed.json
public/feed.json / public/rss.xml / public/llms.txt / public/sitemap.xml
public/assets/editorial/
content/overrides/change-log.json
content/overrides/content-studio-change-log.json
```

### Visual Editor — Real-Site Iframe + Project Editor (2026-06-19)

The Visual Editor now loads the actual Vite dev server (`http://localhost:5174`) in an `<iframe>` instead of rendering a custom HTML approximation client-side.

**Key facts for agents:**
- Content Studio spawns `vite dev --port 5174` on startup. `GET /api/vite-status` exposes ready state.
- Page selector navigates the iframe to the correct live route (homepage, updates, guidance, floorplans, corridors, any of the 18 project pages).
- Project page editor (`#projectEditorPanel`) saves to `research/content-editor/site-overrides.json` → `syncEditorOverrides()` regenerates `src/generated/editorOverrides.ts` → Vite HMR hot-reloads the iframe.
- All image processing uses **Sharp** (replaces macOS-only `sips`). Hard 750 KB output limit enforced before writing.
- `POST /api/visual-editor/pre-commit-check` gates commits: typecheck + qa:content-studio + image size scan must all pass.
- `POST /api/visual-editor/commit` stages only the Visual Editor allowlist and pushes, triggering a deploy.
- Old client-side renderer functions (`sitePreviewMarkup`, `visualHeroSection`, `visualCardSection`, etc.) have been **removed**. Do not re-add them.
- QA scripts `check-builder-visual-editor.mjs` and `check-builder-remote-images.mjs` have been updated to assert the iframe architecture instead.

**Visual Editor commit allowlist:**
```
research/content-editor/site-overrides.json
src/generated/editorOverrides.ts
content/overrides/homepage-card-overrides.json
content/overrides/homepage-overrides.json
content/overrides/content-studio-change-log.json
public/assets/editorial/
public/projects/
```

Full details: `docs/AI_PROJECT_GUIDE.md` → "Visual Editor — Real-Site Iframe + Project Editor (2026-06-19)".

### Recent confirmed commits

```
be27a0b  Update visual editor QA scripts for real-site iframe architecture
0d72510  Raise JS performance budget to 650 KB (main chunk ~613 KB)
8525184  Wire Visual Editor to real Vite site, add project editor + image pipeline
2d91cde  Auto-commit+push on delete/archive; add MarketNoteStatus archived
cd04625  Add Delete button for all published articles in Article Manager
dd9b516  Fix All Articles view crash: implement readTsArray for market notes
094cb12  (prior) Project Facts panel + PI docs update
```
