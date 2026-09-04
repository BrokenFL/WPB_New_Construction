# WPB Project Workflow and Asset Map

Inspection date: 2026-05-27

## Scope Inspected

- Local working repo: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB-New-Construction-Current`
- Approved asset library: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library`
- Requested GitHub repo name: `BrokenFL/WestPalmNewConstruction`
- Configured Git remote found locally: `https://github.com/BrokenFL/WPB_New_Construction.git`
- Current branch found locally: `main`
- Current local state at inspection: `main...origin/main [ahead 1]` with local modifications already present in `src/main.ts`, `src/style.css`, and `vite.config.ts`

No website behavior or asset files were changed during this inspection. This report is the only intended write.

## Package Scripts Found

The project is a Vite/TypeScript site. Dependencies are intentionally small: `vite`, `typescript`, and `playwright` in dev dependencies.

Primary commands:

- Development: `npm run dev`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Postbuild static prerender: `npm run postbuild`
- Preview: `npm run preview`
- Full no-write launch QA: `npm run qa:launch` or `npm run qa:launch:no-write`
- Full launch QA with report writes: `npm run qa:launch:write-reports`
- Asset registry check: `npm run check:assets`
- Deploy/live ship: `npm run ship:live` or `npm run deploy:live`
- Main source-data refresh: `npm run research:site-intelligence`
- Daily maintenance: `npm run daily:maintenance`
- News refresh/import/publish scripts: `news:refresh`, `news:fetch`, `news:promote`, `news:import-gpt`, `news:process-gpt-issues`, `news:daily-publisher`, `news:publish-queued`
- Asset-related scripts already present: `import:developer-images`, `review:developer-images`, `assets:place-developer-images`, `assets:duplicates`, `assets:cleanup-approved`, `assets:plan-resize`
- Local editor: `npm run editor`, `npm run brooke:builder`, `npm run content:studio`
- Test wrapper: `npm run test` runs no-write launch QA plus gatekeeper QA.

## Build, QA, and Deploy Flow

Build command:

```bash
npm run build
```

`npm run build` runs `tsc` and Vite, then `postbuild` runs `research/scripts/prerender-static-routes.mjs`.

Default QA command:

```bash
npm run qa:launch:no-write
```

`qa:launch:run` chains the launch readiness script plus copy, image, SEO, project-page, logo, news, content-studio, map, and untracked-asset checks.

Deploy workflow:

- Local deploy entrypoint: `research/scripts/deploy-cloudflare-pages-with-retry.mjs`
- Package aliases: `deploy:live` and `ship:live`
- Deploy target default: Cloudflare Pages project `wpbnewconstruction`
- Wrangler default: `wrangler@4.93.0`
- Preflight before deploy unless skipped: `npm run build`, `npm run qa:launch:no-write`, `npm run qa:gatekeeper`
- GitHub Actions workflow: `.github/workflows/deploy-cloudflare-pages.yml`
- GitHub Actions installs dependencies with `npm ci`, installs Playwright Chromium, builds, runs launch QA and gatekeeper QA, then deploys if Cloudflare secrets are configured.

## Canonical and Generated Data Files

Canonical or manually curated inputs found:

- `research/source-material-review/project-source-catalog.json`: primary source-material catalog used by `research:site-intelligence`.
- `data/project_assets.json`: deterministic approved public asset registry for `/assets/...` project assets.
- `src/data/projectAssets.ts`: TypeScript lookup helpers for the approved registry.
- `src/main.ts`: current main app data/rendering surface, including many project definitions, legacy image references, project page rendering, gallery behavior, floorplan UI, and route hydration.
- `src/data/approvedImportedProjectImages.json`: placed developer/imported image records, all gated by `status: "placed"` in rendering checks.
- `content/overrides/*.json`: no-code/content-studio overrides.
- `research/news-review/approved-development-news.json`: approved news source for generated routes/feed.

Generated or derived outputs found:

- `src/generated/siteData.ts`: generated site metadata, floorplan library, FAQ, research news feed, project facts, and prerender route list.
- `src/generated/editorOverrides.ts`: generated editor override bridge.
- `public/data/site-meta.json`
- `public/data/floorplans.json`
- `research/generated/published-floorplan-assets.json`
- `research/generated/project-asset-status.json`
- `research/generated/image-clearance-candidates.json`
- `research/generated/project-team-credits.json`
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

Requested files checked and status:

- `data/buildings_master.json`: not present
- `src/data/buildings.json`: not present
- `src/data/updates.json`: not present
- `src/data/sources.json`: not present
- `src/data/openclawSiteData.ts`: not present
- `src/data/projectAssets.generated.json`: not present
- `public/data/website_review_feed.json`: not present
- `research/scripts/prerender-static-routes.mjs`: present; reads `src/generated/siteData.ts` exports and writes route-specific HTML into `dist`

OpenClaw references were not found in the current inspected source/data/doc paths. Some older scripts refer to `research/source-repos/WestPalmNewConstruction/...` as historical/source-repo paths, but those are not current website data files.

## Website Asset Directories

Production public asset roots:

- `public/assets/editorial`: editorial/corridor/site images.
- `public/assets/projects`: newer approved project asset namespace. Currently contains `alba-palm-beach` only.
- `public/projects`: legacy project media/docs namespace used heavily by existing project pages, floorplan PDFs, imported images, and asset maps.
- `public/team-logos`: project/team logo assets used separately from the new project asset registry.
- `public/maps`: map image/SVG assets.

Current counts found:

- `public/assets`: 22 files total.
- `public/assets/projects`: 13 files, all under `alba-palm-beach`.
- `public/projects`: 361 files.
- `data/project_assets.json`: 1 project, 12 approved assets.

Important distinction: `public/assets/projects/...` is the approved-registry path for new production assets. `public/projects/...` still contains the older live project media and floorplan/doc archive, and current code still references it in many places.

## Current Gallery, Hero, Logo, and Floorplan Handling

Approved project assets:

- `data/project_assets.json` stores approved asset records with `src`, `alt`, `title`, `credit`, `source`, `status`, `placement`, and `variant`.
- `src/data/projectAssets.ts` exposes `getApprovedProjectAssets`, `getProjectAsset`, `getProjectHeroAsset`, and `getProjectGalleryAsset`.
- The registry currently supports placements: `hero`, `residences`, `amenities`, `neighborhood`, `logos`, and `team`.
- `scripts/check-assets.mjs` requires approved asset `src` values to start with `/assets/`, verifies the file exists under `public/`, warns on missing alt text, and warns when a registry project has no hero.

Hero selection:

- `renderDraftProjectPage` first asks for `getProjectHeroAsset(project)`.
- If no approved hero exists, it falls back to the project draft image, then `project.heroImage`, then `project.image`.
- A vertical hero variant can become the mobile hero when present.

Gallery selection:

- `projectBrochureGallery` combines approved registry assets, legacy hardcoded galleries, draft gallery records, and placed imported images.
- Alba has a special path that prioritizes approved registry assets from `data/project_assets.json`.
- Other projects still rely mostly on `src/main.ts`, `public/projects/...`, and `src/data/approvedImportedProjectImages.json`.

Imported/developer images:

- `src/data/approvedImportedProjectImages.json` records `projectId`, source URLs, local path, capture timestamp, type, placement, caption, alt, and credit.
- Public rendering filters these records to `status === "placed"` and checks that the file can be shown.
- QA script `research/scripts/check-image-mapping.mjs` enforces placed-only records and verifies files exist.

Floorplans:

- Floorplan records are generated into `src/generated/siteData.ts` and `public/data/floorplans.json` from the source-material catalog.
- Public floorplan files live mostly under `public/projects/[project]/docs/floorplans`.
- `src/main.ts` includes a floorplan viewer that opens PDF/image/html floorplan paths from data attributes.
- `research/scripts/prerender-static-routes.mjs` renders static floorplan route content from `floorplanLibrary`.

Logos:

- `src/main.ts` has a `projectLogoImages` mapping with `/projects/.../media/logo.*` paths.
- `data/project_assets.json` can also carry approved logo assets under `/assets/projects/.../logos/...`; currently this exists for Alba.
- `qa:project-logos` checks project logo behavior.

## Approved Asset Library Structure

Asset library root:

`/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library`

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

Project-level approved folders found:

- `01_PROJECTS/alba-palm-beach/approved-for-website`
- `01_PROJECTS/berkeley/approved-for-website`

Only these exact `approved-for-website` project folders were found from the flexible approved-folder name scan. No `approved_for_website`, `Approved For Website`, `approved website`, `website-approved`, or `approved-web` folders were found.

Approved-folder file types and condition:

- Alba approved folder: 21 files.
- Berkeley approved folder: 28 files including `.DS_Store`; usable website candidates are mixed with one Finder metadata file.
- File types across approved folders include JPG/JPEG, PNG, WebP, PDF, and one extensionless JPEG-logo file.
- Assets are mixed by role inside the approved folders: hero/exterior images, amenity images, residence images, logos, neighborhood image, and floorplans.
- Several source filenames are not final-public-safe yet: spaces, uppercase letters, underscores, apostrophes, `copy`, double hyphens, typo-like names, and double `.pdf.pdf` suffixes were found.
- Some files appear already web-sized or compressed, while others are raw/heavy enough to require optimization before public promotion. Example: one Berkeley file named `.webp` is actually JPEG data and is about 11.4 MB at 4718x5000.

Project folder counts:

- `alba-palm-beach`: 30 files, 21 in approved folder.
- `berkeley`: 36 files, 28 in approved folder.
- `forte-on-flagler`: 13 files, 0 in approved folder.
- `maison-dor`: 5 files, 0 in approved folder.
- `mandarin-oriental`: 11 files, 0 in approved folder.
- `mr-c`: 51 files, 0 in approved folder.
- `nora-house`: 43 files, 0 in approved folder.
- `olara`: 158 files, 0 in approved folder.
- `ritz-carlton-wpb`: 71 files, 0 in approved folder.
- `rosewood`: 5 files, 0 in approved folder.
- `shorecrest`: 26 files, 0 in approved folder.
- `south-flagler-house`: 34 files, 0 in approved folder.
- `unknown-project`: 67 files, 0 in approved folder.

## Recommended Asset Publisher Plan

The publisher should be a controlled copy-and-optimize workflow, not a move/rename workflow inside the source library.

Recommended script name:

- `scripts/publish-approved-assets.mjs` or `research/scripts/publish-approved-assets.mjs`

Recommended behavior:

- Accept one project slug at a time, for example `--project berkeley`.
- Read only from the project's `approved-for-website` folder in the iCloud asset library.
- Refuse to read from `00_review`, `hero`, `amenities`, `floorplans`, `logos`, `residences`, `source_docs`, `team`, or any non-approved project folder unless explicitly running in audit mode.
- Normalize output filenames to lowercase dash/kebab-case with no underscores, apostrophes, spaces, uppercase, or duplicate extensions.
- Derive placement from filename prefix when clear: `hero`, `residences`, `amenities`, `neighborhood`, `logos`, `team`, `floorplans`.
- Copy optimized web-ready outputs into `public/assets/projects/[project-slug]/[placement]/`.
- Do not write iCloud absolute paths into website data.
- Update `data/project_assets.json` only with `/assets/projects/...` paths.
- Include alt/title/credit/source/status fields for each registry asset.
- Preserve source originals untouched in the asset library.
- Produce a dry-run summary by default; require `--write` for copies and registry updates.
- Run or recommend `npm run check:assets` after registry writes.

## Recommended Asset Refresh Plan

The refresh should compare approved-library files to the repo registry and public files, not blindly republish everything.

Recommended script name:

- `scripts/refresh-approved-assets.mjs` or `research/scripts/refresh-approved-assets.mjs`

Recommended behavior:

- For each project with `approved-for-website`, inventory source filename, size, detected MIME type, dimensions when possible, and content hash.
- Compare against `data/project_assets.json` and `public/assets/projects/[slug]`.
- Report new, changed, missing, duplicate, nonconforming, and already-published files.
- Keep project-by-project refresh; do not bulk-promote all folders.
- Flag approved files that are not public-safe: extension mismatch, double extension, spaces, underscores, apostrophes, uppercase, `copy`, `.DS_Store`, missing extension, raw/heavy dimensions, or unexpected type.
- Preserve registry order and manual metadata where possible.
- Require `--write` before changing `public/assets` or `data/project_assets.json`.

## Recommended Asset Audit Plan

The audit should be report-only and safe to run anytime.

Recommended script name:

- `scripts/audit-approved-assets.mjs` or `research/scripts/audit-approved-assets.mjs`

Recommended behavior:

- Inspect the asset library and repo without copying or converting.
- Verify which project folders have approved-for-website folders.
- Verify source files have final-safe candidate names or need normalization.
- Verify every approved registry path exists under `public/`.
- Verify every registry path uses `/assets/...`, not iCloud/source-library paths.
- Verify no final public asset filename contains underscores, spaces, uppercase, apostrophes, or source-library artifacts.
- Verify no `.DS_Store` or unsupported file is present in a public asset path.
- Verify source-library paths are absent from `src`, `data`, `public/data`, and generated files.
- Cross-check `public/assets/projects` against `data/project_assets.json` to find orphaned public assets and missing registry entries.
- Keep separate notes for legacy `public/projects/...` assets because those are still live and should not be deleted as part of the new approved-asset audit.

## Risks and Unknowns

- The local Git remote is `BrokenFL/WPB_New_Construction`, while the mission named `BrokenFL/WestPalmNewConstruction`. Confirm the intended GitHub source-of-truth repo before any future branch, push, or PR work.
- The worktree was already dirty before this report: `src/main.ts`, `src/style.css`, and `vite.config.ts`. Future implementation should classify those changes before editing or testing.
- `public/assets/projects` currently contains only Alba, while the approved asset library also has Berkeley ready for promotion. Berkeley will need filename cleanup and optimization before registry publication.
- Several approved-library filenames are not public-safe yet.
- Some approved-library files are already optimized; others are raw/heavy or have mismatched extensions. The publisher should inspect MIME/dimensions, not trust extensions.
- Floorplans are currently handled through `public/projects/[slug]/docs/floorplans` and generated floorplan data. Moving floorplans into `/assets/projects/...` would be a larger data-flow change and should be planned separately.
- The old `public/projects/...` asset archive is still live. The new asset publisher should not prune it until rendering references have been migrated and QA proves those paths are no longer needed.
- `src/main.ts` remains a major source of manually curated project imagery and fallback logic. Asset automation should integrate with the registry first, then migrate project-by-project.
- `research:site-intelligence` writes many generated files and can touch assets/reports. Use no-write audits unless source refresh is explicitly requested.

## Files Codex Proposes to Change Later

For implementation, likely changes should be limited to:

- `scripts/publish-approved-assets.mjs` or `research/scripts/publish-approved-assets.mjs`
- `scripts/refresh-approved-assets.mjs` or `research/scripts/refresh-approved-assets.mjs`
- `scripts/audit-approved-assets.mjs` or `research/scripts/audit-approved-assets.mjs`
- `data/project_assets.json`
- `src/data/projectAssets.ts` only if lookup helpers need small additions.
- `scripts/check-assets.mjs` if the existing registry check should enforce stricter filename and orphan rules.
- `package.json` to add explicit `assets:publish-approved`, `assets:refresh-approved`, and `assets:audit-approved` commands.
- `docs/ASSET_WORKFLOW.md` to document finalized command usage after scripts exist.
- `public/assets/projects/[project-slug]/...` only for approved optimized copies after explicit approval.

Avoid changing these until specifically approved:

- Existing source originals in the iCloud asset library.
- Legacy `public/projects/...` media/docs archive.
- Existing generated files from `research:site-intelligence`.
- Existing dirty files unless their changes are first classified and accepted.
