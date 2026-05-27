# WPB Project Workflow and Asset Pipeline

Inspection date: 2026-05-27

## Repositories and Local Paths

Website repo working directory:

- `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB-New-Construction-Current`
- Local branch: `main`
- Local remote found: `https://github.com/BrokenFL/WPB_New_Construction.git`
- Requested source-of-truth website repo in this task: `https://github.com/BrokenFL/WestPalmNewConstruction`
- Current local status at inspection: `main...origin/main [ahead 1]`
- Existing dirty files before this report: `src/main.ts`, `src/style.css`, `vite.config.ts`
- Existing untracked doc from the prior inspection pass: `docs/project-workflow-and-asset-map.md`

Asset repo working directory:

- `/Volumes/ExternalSSD/WPB_NewConstruction_Assets`
- Local branch: `main`
- Local remote found: `https://github.com/BrokenFL/WPB_New_Construction_Assets.git`
- Current local status at inspection: clean
- Git LFS: no `.gitattributes` file found, and `git lfs ls-files` returned no tracked LFS files. Large files appear to be tracked normally.

iCloud asset library / intake folder:

- `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library`
- This folder is not a Git working copy. It has no `.git` directory.
- It does not directly track `BrokenFL/WPB_New_Construction_Assets` as `origin`.
- Because it is not a Git repo, files here do not have Git tracked/untracked status until a later sync step copies selected approved files into the asset repo.

Important repo-name mismatch:

- The website checkout currently points to `BrokenFL/WPB_New_Construction`.
- The mission names `BrokenFL/WestPalmNewConstruction`.
- Confirm the intended website GitHub source of truth before any future branch, push, deploy, or PR work.

## Three-Layer Asset Workflow

Observed and recommended layer separation:

1. iCloud intake/review library receives source images, PDFs, logos, and materials.
2. Approved files are placed in flexible `approved-for-website` folders in iCloud.
3. Task 1 syncs approved iCloud files into the GitHub asset repo as the central warehouse.
4. Task 2 pulls approved files from the asset repo and creates optimized website-ready copies in the website repo under `public/assets`.
5. Task 3 updates website data references.
6. Task 4 audits all layers.

Hard path rule for the website:

- Website data should reference only `/assets/...` public paths.
- Website data should not reference iCloud absolute paths.
- Website data should not reference raw asset repo paths.
- Source originals should stay in iCloud or the asset warehouse; the website repo should receive only optimized public copies.

## Website Repo Data Flow

Canonical or manually curated inputs found:

- `research/source-material-review/project-source-catalog.json`: current source-material catalog used by the site-intelligence build.
- `data/project_assets.json`: current approved public asset registry for `/assets/...` project assets.
- `src/data/projectAssets.ts`: TypeScript registry lookup helpers.
- `src/main.ts`: primary app/rendering surface, including project cards, project page fallbacks, hero selection, gallery composition, floorplan viewer, and route hydration.
- `src/data/approvedImportedProjectImages.json`: placed imported/developer-image records, gated by `status: "placed"` before public rendering.
- `content/overrides/*.json`: no-code editor/content-studio overrides.
- `research/news-review/approved-development-news.json`: approved news source for feed/route generation.

Generated or derived outputs found:

- `src/generated/siteData.ts`: generated `siteMeta`, `floorplanLibrary`, `answerEngineFaq`, `researchNewsFeed`, `projectFacts`, and `prerenderRoutes`.
- `src/generated/editorOverrides.ts`: generated editor override bridge.
- `public/data/site-meta.json`
- `public/data/floorplans.json`
- `public/data/published-floorplan-assets.json`
- `public/data/project-asset-status.json`
- `public/data/image-clearance-candidates.json`
- `public/data/project-team-credits.json`
- `public/data/news-feed.json`
- `public/data/answer-engine-faq.json`
- `public/feed.json`
- `public/rss.xml`
- `public/llms.txt`
- `public/robots.txt`
- `public/sitemap.xml`
- `research/source-material-review/floorplan-library.md`
- `research/source-material-review/image-candidate-catalog.md`
- `research/source-material-review/image-candidate-catalog.json`
- `research/source-material-review/metadata-answer-engine-plan.md`
- `research/asset-library/preferred-image-exports/*`

Files specifically checked:

- `data/buildings_master.json`: not present; it is not the current canonical website data file.
- `data/master_asset_index.csv`: not present.
- `scripts/sync_openclaw_wpb_data.sh`: not present; no current asset syncing appears to be controlled by that script.
- `CODEX_CONTINUATION.md`: not present.
- `CODEX_PROMPT_ADDENDUM.md`: not present.
- `src/data/openclawSiteData.ts`: not present.
- `src/data/projectAssets.generated.json`: not present.

The current website code expects the asset registry shape in `data/project_assets.json`:

- Root object: `{ "projects": { [projectKey]: ProjectAssetRecord } }`
- Project record fields: `projectId`, `slug`, optional `aliases`, and `assets`
- Asset fields: `placement`, optional `variant`, `src`, `alt`, `title`, `credit`, `source`, `status`, optional `notes`
- Allowed current placements in TypeScript: `hero`, `residences`, `amenities`, `neighborhood`, `logos`, `team`
- Current status type: `approved`

## Website Asset Structure

Current website public asset directories:

- `public/assets/editorial`: editorial/corridor/site imagery.
- `public/assets/projects`: newer approved project asset namespace.
- `public/projects`: older live project media/docs namespace used heavily by current pages and floorplan data.
- `public/team-logos`: team logos.
- `public/maps`: map image/SVG assets.

Current observed counts:

- `public/assets`: 22 files total.
- `public/assets/projects`: 13 files, currently all under `alba-palm-beach`.
- `public/projects`: 361 files.
- `data/project_assets.json`: 1 project, 12 approved assets.

Assets currently live under:

- `public/assets/projects/...` for the newer approved registry path.
- `public/projects/...` for legacy media, floorplans, imported images, and source/docs mirrors.

No `public/assets/wpb-condos/` directory was found.

## Website Hero, Gallery, Logo, and Floorplan Logic

Approved registry lookup:

- `src/data/projectAssets.ts` imports `data/project_assets.json`.
- It exposes `getApprovedProjectAssets`, `getProjectAsset`, `getProjectHeroAsset`, and `getProjectGalleryAsset`.
- `scripts/check-assets.mjs` verifies approved registry `src` values start with `/assets/`, checks files exist under `public/`, warns on missing alt text, and warns when a registry project has no hero.

Hero selection:

- `renderDraftProjectPage` uses `getProjectHeroAsset(project)` first.
- If no approved hero exists, it falls back to the draft image, `project.heroImage`, then `project.image`.
- A `hero` asset with `variant: "vertical-exterior"` can become the mobile hero.

Gallery selection:

- `projectBrochureGallery` combines approved registry assets, legacy hardcoded galleries, draft gallery records, and placed imported images.
- Alba currently has special handling that prioritizes approved registry assets.
- Most non-Alba projects still rely on `src/main.ts`, `public/projects/...`, and `src/data/approvedImportedProjectImages.json`.

Imported/developer image records:

- `src/data/approvedImportedProjectImages.json` includes source URLs, local public paths, capture times, image type, placement, caption, alt, and credit.
- Rendering filters these records to `status === "placed"` and checks file availability.
- `research/scripts/check-image-mapping.mjs` enforces placed-only records and verifies files exist.

Floorplans:

- Floorplan records come from generated `floorplanLibrary` in `src/generated/siteData.ts` and `public/data/floorplans.json`.
- Public floorplan files mostly live under `public/projects/[project]/docs/floorplans`.
- `src/main.ts` includes a floorplan viewer that opens PDF/image/html floorplan paths from data attributes.
- `research/scripts/prerender-static-routes.mjs` reads `src/generated/siteData.ts` exports and writes static route HTML into `dist`.

Logos:

- `src/main.ts` has a `projectLogoImages` mapping with `/projects/.../media/logo.*` paths.
- `data/project_assets.json` can also carry approved `/assets/projects/.../logos/...` records; currently this exists for Alba only.

## Website Build, Test, QA, and Deploy Commands

Primary commands found in `package.json`:

- Development: `npm run dev`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Postbuild static prerender: `npm run postbuild`
- Preview: `npm run preview`
- Full no-write launch QA: `npm run qa:launch` or `npm run qa:launch:no-write`
- Launch QA with report writes: `npm run qa:launch:write-reports`
- Asset registry check: `npm run check:assets`
- Gatekeeper QA: `npm run qa:gatekeeper`
- Deploy/live ship: `npm run ship:live` or `npm run deploy:live`
- Main source-data refresh: `npm run research:site-intelligence`
- Existing asset-adjacent scripts: `import:developer-images`, `review:developer-images`, `assets:place-developer-images`, `assets:duplicates`, `assets:cleanup-approved`, `assets:plan-resize`
- Local editor: `npm run editor`, `npm run brooke:builder`, `npm run content:studio`
- Test wrapper: `npm run test`

Build flow:

```bash
npm run build
```

This runs TypeScript, Vite, then `research/scripts/prerender-static-routes.mjs`.

Deploy flow:

- Local entrypoint: `research/scripts/deploy-cloudflare-pages-with-retry.mjs`
- Default Cloudflare Pages project: `wpbnewconstruction`
- Default Wrangler version: `4.93.0`
- Preflight unless skipped: `npm run build`, `npm run qa:launch:no-write`, `npm run qa:gatekeeper`
- GitHub workflow present: `.github/workflows/deploy-cloudflare-pages.yml`
- GitHub Actions installs dependencies, installs Playwright Chromium, builds, runs QA, then deploys if Cloudflare secrets exist.

## Asset Repo Structure

Asset repo root:

- `/Volumes/ExternalSSD/WPB_NewConstruction_Assets`
- Remote: `https://github.com/BrokenFL/WPB_New_Construction_Assets.git`
- Branch: `main`
- Status: clean
- Tracked files: 1320

Top-level structure found:

- `README.md`
- `public-concepts/`
- `public-hero/`
- `public-maps/`
- `public-projects/`
- `public-team-logos/`
- `research-asset-library/`

Asset repo README describes:

- `research-asset-library/` as collected research assets, indexes, source notes, clearance status, and project-specific folders.
- `public-projects/` as media mirrored from the deployable site's `public/projects/`.
- `public-team-logos/`, `public-hero/`, `public-maps/`, and `public-concepts/` as shared visual assets mirrored from the live site.
- Publishing rule: live site should only publish user-provided, licensed, approved, or otherwise cleared assets.

Research asset library files:

- `research-asset-library/README.md`
- `research-asset-library/asset-manifest.json`
- `research-asset-library/asset-index.md`
- `research-asset-library/wpb-asset-library-master-index.xlsx`
- `research-asset-library/projects/...`
- `research-asset-library/preferred-image-exports/...`
- `research-asset-library/shared/...`

Important asset repo observations:

- No approved website folders were found in the asset repo using the flexible approved-folder scan.
- The asset repo currently looks like a central raw/mirrored warehouse, not yet the final approved-folder publication source.
- It has many large PDFs/images tracked normally, including multiple ~26.7 MB Olara floorplan PDFs.
- It stores both raw research assets and mirrored public-site assets, so future sync scripts must preserve rights/approval boundaries.

Asset repo file type counts found:

- 530 JPG
- 190 PDF
- 161 JSON
- 147 PNG
- 74 WebP
- 64 HTML
- 53 Markdown
- 45 SVG
- 25 XLSX
- 24 CSV

## iCloud Asset Library Structure

iCloud root:

- `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library`

Top-level folders found:

- `00_INBOX_unsorted`
- `01_PROJECTS`
- `02_CORRIDORS`
- `03_LIFESTYLE_WPB`
- `04_DEVELOPERS_TEAMS`
- `05_GENERAL_SITE_IMAGES`
- `06_AI_GENERATED_CANDIDATES`
- `07_APPROVED_FOR_WEBSITE`
- `08_REJECTED_DO_NOT_USE`
- `99-archive`

Project folders found under `01_PROJECTS`:

- `alba-palm-beach`
- `berkeley`
- `forte-on-flagler`
- `maison-dor`
- `mandarin-oriental`
- `mr-c`
- `nora-house`
- `olara`
- `ritz-carlton-wpb`
- `rosewood`
- `shorecrest`
- `south-flagler-house`
- `unknown-project`

Standard project subfolders found:

- `00_review`
- `amenities`
- `floorplans`
- `hero`
- `logos`
- `neighborhood`
- `rejected`
- `residences`
- `source_docs`
- `team`

Approved project-level folders found:

- `01_PROJECTS/alba-palm-beach/approved-for-website`
- `01_PROJECTS/berkeley/approved-for-website`

Flexible approved-folder scan did not find `approved_for_website`, `Approved For Website`, `approved website`, `website-approved`, `approved-web`, `Website Approved`, or `For Website` folders.

iCloud file type counts found:

- 319 JPG
- 130 PNG
- 90 PDF
- 30 WebP
- 15 SVG
- 15 JPEG
- 6 `.DS_Store`
- 4 GLB
- 1 extensionless JPEG-like file in an approved Alba folder.

Approved-folder file type counts:

- 25 JPG
- 10 WebP
- 7 PDF
- 4 JPEG
- 1 PNG
- 1 `.DS_Store`
- 1 extensionless JPEG-like file.

Approved project folder counts:

- `alba-palm-beach`: 30 total files, 21 in `approved-for-website`
- `berkeley`: 36 total files, 28 in `approved-for-website`
- All other inspected project folders currently have 0 files in approved folders.

Approved-folder condition notes:

- Approved files are mixed by role inside each approved folder: hero/exterior, amenities, residences, logos, neighborhood, and floorplans.
- Some names are not final-public-safe yet: spaces, uppercase letters, underscores, apostrophes, `copy`, double hyphens, typo-like words, and double `.pdf.pdf` suffixes were found.
- Some assets are already web-sized, but others are raw/heavy or mismatched. Example: `berkeley-hero-exterior-lake-view-v01.webp` is about 11.4 MB and was detected as JPEG data despite the `.webp` extension in prior file inspection.

## Proposed Implementation Scripts

Task 1: iCloud approved assets to asset repo

- Proposed script in asset repo or website tooling: `scripts/sync-approved-icloud-assets.mjs`
- Inputs: iCloud approved folders only.
- Output: asset repo approved area, likely `approved-for-website/projects/[project-slug]/[placement]/...` or a similarly explicit structure.
- Behavior: dry-run default; `--write` required; copy only, never move; preserve originals; normalize filenames for the warehouse; record source path only in private asset-repo manifest, not in website data.

Task 2: asset repo to website public assets

- Proposed website script: `scripts/publish-approved-assets-from-asset-repo.mjs`
- Inputs: asset repo approved area.
- Outputs: optimized website copies under `public/assets/projects/[project-slug]/[placement]/...`.
- Registry output: `data/project_assets.json`.
- Behavior: dry-run default; `--write` required; generate `/assets/...` paths only; reject raw asset repo paths and iCloud paths.

Task 3: website data reference refresh

- Proposed website script: `scripts/refresh-project-asset-references.mjs`
- Inputs: `data/project_assets.json`, current `src/main.ts` project IDs, optional generated/project data.
- Outputs: updated registry metadata and, only if explicitly approved, small code/data wiring changes.
- Should avoid running broad `research:site-intelligence` unless the source catalog needs refresh.

Task 4: audit

- Proposed website script: `scripts/audit-asset-pipeline.mjs`
- Checks all layers without writing:
  - iCloud approved folders found.
  - Asset repo approved warehouse exists and matches approved iCloud selections.
  - Website `public/assets/projects` matches `data/project_assets.json`.
  - Website data contains no iCloud absolute paths.
  - Website data contains no raw asset repo paths.
  - Final public filenames are lowercase dash/kebab-case with no underscores/spaces/apostrophes.
  - Registry paths all start with `/assets/`.
  - Legacy `public/projects/...` references are reported separately and not treated as new approved-registry output.

## Proposed Package Scripts

Website repo package scripts to add later:

- `assets:sync-approved-to-warehouse`
- `assets:publish-approved`
- `assets:refresh-references`
- `assets:audit-pipeline`
- `assets:audit-pipeline:json` if machine-readable output is useful.

Asset repo package scripts only if the asset repo later receives a Node toolchain:

- `assets:ingest-approved`
- `assets:audit-approved`

The asset repo currently has no inspected `package.json`; implementation can live in the website repo and operate on configured external paths if that is safer.

## Exact Files Later Tasks Should Create or Update

Website repo likely additions:

- `scripts/sync-approved-icloud-assets.mjs`
- `scripts/publish-approved-assets-from-asset-repo.mjs`
- `scripts/refresh-project-asset-references.mjs`
- `scripts/audit-asset-pipeline.mjs`
- `package.json`
- `data/project_assets.json`
- `scripts/check-assets.mjs`
- `docs/ASSET_WORKFLOW.md`
- `docs/project-workflow-and-asset-pipeline.md`
- `public/assets/projects/[project-slug]/...` only after explicit approval and only for optimized public copies.

Asset repo likely additions:

- `approved-for-website/projects/[project-slug]/...` or another clearly named approved warehouse root.
- `manifests/approved-assets.json` or `approved-assets.json`
- `docs/asset-warehouse-workflow.md`

Files to avoid changing without explicit approval:

- iCloud source originals.
- Existing legacy `public/projects/...` assets.
- Existing generated site data from `research:site-intelligence`.
- Existing dirty website files until their current modifications are classified.

## Current Risks and Brooke Review Items

- Website repo remote mismatch needs Brooke confirmation before any push/deploy.
- Website checkout is already dirty and ahead of origin; classify current changes before implementation.
- iCloud is not the asset repo working copy; the sync step must intentionally bridge iCloud to `/Volumes/ExternalSSD/WPB_NewConstruction_Assets`.
- Asset repo has no approved-folder structure yet, so Task 1 likely needs to create one after approval.
- Asset repo stores raw and mirrored materials together. Scripts must not treat all asset repo files as approved.
- Asset repo does not appear to use Git LFS despite large files. Confirm whether this is acceptable before adding more large optimized or raw assets.
- Website code still relies heavily on legacy `public/projects/...`; asset migration should be incremental by project.
- Floorplans have a separate generated-data flow and mostly live under `public/projects/[project]/docs/floorplans`. Moving them into `/assets/...` would be a larger design choice.
- Approved iCloud filenames require normalization before public use.
- Some approved iCloud files have extension/MIME mismatches or oversized dimensions.
- Confirm whether `07_APPROVED_FOR_WEBSITE` top-level iCloud folder should be used in addition to project-level approved folders; current project-level approved files were found only for Alba and Berkeley.

## Recommended Next Implementation Order

1. Confirm the website repo remote/source-of-truth mismatch.
2. Classify existing dirty website files.
3. Decide the approved warehouse structure inside `WPB_New_Construction_Assets`.
4. Build report-only `assets:audit-pipeline`.
5. Build dry-run iCloud-to-asset-repo sync for one project.
6. Build dry-run asset-repo-to-website publisher for one project.
7. Add registry update support for `data/project_assets.json`.
8. Run `npm run check:assets`, targeted image QA, then full no-write launch QA after any approved write pass.
