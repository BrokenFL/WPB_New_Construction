# Gemini Visual Handoff Brief

Date: 2026-05-26

## Current State Snapshot

2026-06-03 update: the primary local website checkout for new work is now `/Volumes/ExternalSSD/WPB_NewConstruction`. The CloudDocs path below is part of this 2026-05-26 historical snapshot and should not be used for new implementation unless Brooke explicitly asks for CloudDocs recovery or comparison work.

- Current repo path: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB-New-Construction-Current`
- Current branch: `main`
- Inspected HEAD before this handoff doc was added: `1d49b7d6e0f2c9d4b7eb2231ad98b11326e23f84` (`Add Alba approved asset registry test`)
- Worktree at inspection: clean
- Local branch at inspection: `main` was ahead of `origin/main` by 1 commit
- Alba commit `1d49b7d` pushed: no. `1d49b7d6e0f2c9d4b7eb2231ad98b11326e23f84` was not an ancestor of `origin/main`.
- Alba commit `1d49b7d` deployed: no confirmed deploy. The live Alba page did not reference the new Alba asset filenames, and the checked Alba asset URL did not return the image asset as production image content.
- Current asset registry files present: `docs/ASSET_WORKFLOW.md`, `docs/alba-approved-assets-report.md`, `data/project_assets.json`, `src/data/projectAssets.ts`, `scripts/check-assets.mjs`
- Expected registry/inventory files not present in this clean repo snapshot: `docs/ICLOUD_ASSET_LIBRARY.md`, `docs/asset-inventory-report.md`, `docs/asset-drive-organization-report.md`, `data/project_assets.review_queue.json`, `data/project_assets.draft.json`, `data/project_asset_inventory.csv`, `data/project_asset_inventory.json`
- Current approved Alba assets present in repo: 12 files under `public/assets/projects/alba-palm-beach/`
- Current iCloud asset library exists: yes
- Alba approved iCloud folder exists: yes

## Project Overview

WPB New Construction is a West Palm Beach new construction condo intelligence site. The goal is a buyer-facing, local-authority experience with clean visual presentation, strong project clarity, and pages that remain readable to AI search systems.

Primary audiences:

- Buyers comparing West Palm Beach and Palm Beach new construction options
- Agents researching projects for clients
- Local real estate researchers
- High-intent new construction shoppers

The site should feel like useful luxury real estate intelligence, not generic brochure copy.

## Current Site Architecture

GitHub `main` is the source of truth:

`https://github.com/BrokenFL/WPB_New_Construction`

The active local repo path is:

`/Volumes/ExternalSSD/WPB_NewConstruction`

The live site is:

`https://www.wpbnewconstruction.com`

Cloudflare Pages deploys production from the repo workflow. Static and prerendered pages matter for SEO and AI-search/GEO readability. Visual work must not break sitemap, robots, llms, static HTML, JSON-LD, internal links, or generated project-page structure.

Important files and surfaces to protect:

- `src/main.ts`
- `src/style.css`
- `src/generated/siteData.ts`
- `src/lib/contact.ts`
- `public/assets/projects/`
- `public/sitemap.xml`
- `public/robots.txt`
- `public/llms.txt`

## Codex And Gemini Role Split

Codex owns implementation and release safety:

- Make code and repo changes
- Validate paths and filenames
- Run QA checks
- Commit, push, and deploy only when explicitly approved
- Protect repo cleanliness
- Manage deterministic asset registry implementation
- Preserve source-of-truth facts and generated SEO/GEO structure

Gemini should support visual judgment:

- Review page visuals
- Suggest best hero and gallery choices
- Critique layout, hierarchy, crop, and aspect ratios
- Help create image prompts or composition directions if new visuals are needed
- Recommend asset placement and visual sequencing
- Flag weak, generic, mismatched, or off-brand images
- Avoid deciding deployment, source-of-truth facts, pricing, availability, or public claims

Gemini should not directly edit random repo files. Gemini output should be a precise recommendation package for Codex to implement.

## Asset Workflow

Asset library source:

`/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library`

Important Alba approved folder:

`/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library/01_PROJECTS/alba-palm-beach/approved-for-website`

Workflow rules:

- iCloud Asset Library is the staging and review warehouse.
- Project `approved-for-website` folders are the only human-approved production candidates.
- Repo `public/assets` contains production website assets only.
- Do not dump the full iCloud image library into GitHub.
- Website placement should use the deterministic asset registry, not random image picking.
- New public folders, filenames, and slugs must be lowercase dash/kebab-case.
- Approved repo paths should be final optimized assets only.

Registry and checks:

- Main registry: `data/project_assets.json`
- TypeScript helpers: `src/data/projectAssets.ts`
- Asset checker: `scripts/check-assets.mjs`
- Required validation for registry work: `npm run check:assets`

Use statuses intentionally. Current registry status is `approved`; do not invent new status values unless Codex updates the implementation.

Do not use:

- Review, staging, source, rejected, or neighboring iCloud folders
- Files with spaces, uppercase fragments, underscores, apostrophes, or accidental punctuation in new public paths
- Unapproved lifestyle or filler imagery
- Oversized source packages in GitHub

## Alba Proof Of Concept Status

The Alba proof of concept exists locally in commit:

`1d49b7d6e0f2c9d4b7eb2231ad98b11326e23f84` (`Add Alba approved asset registry test`)

It has not been pushed to `origin/main` and has not been confirmed deployed.

Approved Alba assets copied into the repo:

- `public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-aerial-waterfront-rendering-v01.jpg`
- `public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-wide-aerial-v01.webp`
- `public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-vertical-exterior-tower-v01.jpg`
- `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-living-room-v01.webp`
- `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-kitchen-with-view-v01.webp`
- `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-bedroom-01-v01.webp`
- `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-patio-v01.webp`
- `public/assets/projects/alba-palm-beach/amenities/alba-palm-beach-amenities-pool-deck-v01.jpg`
- `public/assets/projects/alba-palm-beach/amenities/alba-palm-beach-amenities-valet-v01.webp`
- `public/assets/projects/alba-palm-beach/neighborhood/alba-palm-beach-neighborhood-clock-tower-v01.jpg`
- `public/assets/projects/alba-palm-beach/logos/alba-palm-beach-developer-bgi-logo-v01.jpeg`
- `public/assets/projects/alba-palm-beach/logos/alba-palm-beach-architect-spina-orourke-logo-v01.jpeg`

Selected hero:

`public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-aerial-waterfront-rendering-v01.jpg`

Selected gallery categories:

- Hero/context
- Residences
- Amenities
- Neighborhood
- Logos

Registry status:

- Alba entries are in `data/project_assets.json`
- All listed Alba paths are repo-local `/assets/...` paths
- Entries use status `approved`
- Runtime lookup helpers are in `src/data/projectAssets.ts`

Gemini should review:

- Hero crop and whether the aerial waterfront rendering works across desktop/mobile
- Gallery balance across exterior, residences, amenities, and neighborhood context
- Whether image quality feels premium enough for Alba
- Whether logos belong in gallery, developer/team, or a compact attribution area
- Whether the selected images feel project-specific rather than generic luxury filler

## Visual Style Direction

Optimize for:

- Clean luxury real estate intelligence, not brochure fluff
- Restrained editorial layout
- High-end but useful presentation
- Palm Beach and West Palm Beach warmth
- Strong hierarchy
- Buyer clarity
- Project-specific imagery first
- Lifestyle imagery only when it adds buyer context
- Clear scannability for people comparing projects

Avoid:

- Generic luxury filler
- Overused stock-feeling lifestyle images
- Visual treatments that make project facts harder to scan
- Decorative design that fights SEO/GEO readability
- Brochure-only composition with weak buyer utility

## Approved Visual Categories

Use these categories for project asset planning:

- `hero`
- `residences`
- `amenities`
- `neighborhood`
- `logos`
- `floorplans`
- `lifestyle`
- `corridor`
- `developer/team`

## Lifestyle Layer Guidance

Gemini may later help select or critique lifestyle context for:

- restaurants
- shopping
- waterfront
- walkability
- culture
- beaches
- marinas
- arts-entertainment
- palm-beach-island
- downtown-street-scenes
- brightline-transportation
- parks-public-spaces

Lifestyle imagery should support buyer context and GEO pages such as:

- North Flagler lifestyle
- Downtown West Palm Beach lifestyle
- What's near Olara/Shorecrest/Ritz
- Palm Beach vs West Palm Beach

Lifestyle imagery should never replace project-specific imagery when approved project assets exist.

## File And Path Rules

- Use lowercase dashes only for new public folders and filenames.
- Do not use underscores in new names.
- Do not use spaces.
- Do not upload random files to the repo.
- Do not use unapproved iCloud files.
- Only `approved-for-website` can feed production candidates.
- Keep GitHub limited to selected, final, optimized production assets.

Final repo paths should look like:

`public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-aerial-waterfront-rendering-v01.jpg`

## QA And Deploy Guardrails

Gemini should understand:

- No direct deploy.
- No direct source-fact edits.
- No pricing, availability, timeline, or factual claims.
- No touching dirty source-refresh or news batches.
- Codex must implement, validate, commit, push, and deploy when approved.

Codex should run the relevant gates before release:

- `npm run build`
- `npm run check:assets`
- `npm run qa:copy`
- `npm run qa:customer-copy`
- `npm run qa:internal-links`
- `npm run qa:image-alt`
- `npm run qa:project-pages`
- `npm run qa:launch` when appropriate

This handoff task only runs the requested documentation checks and does not deploy.

## Dirty And Stale Repo Warnings

Avoid the stale old iCloud repo with the trailing-space name:

`/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/New Construction `

Use the current primary checkout for new work:

`/Volumes/ExternalSSD/WPB_NewConstruction`

Treat this older CloudDocs checkout as secondary/historical unless Brooke explicitly asks for it:

`/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB-New-Construction-Current`

There may be source-refresh, news, or other dirty files in other working copies. Do not mix those into visual work. Inspect the active repo before any implementation, and classify dirty paths before running generators, staging, pushing, or deploying.

## How Gemini Should Provide Output

Gemini should return:

- Visual recommendations by page/project
- Specific asset filenames and paths
- Placement recommendations
- Crop and aspect-ratio notes
- Alt-text suggestions
- Design issues found
- Exact changes Codex should make
- Clear rationale tied to buyer usefulness and project specificity

Gemini should avoid vague advice such as "make it premium." Recommendations should be concrete enough for Codex to implement safely.

## First Gemini Assignment

Copy-ready prompt:

```text
Review the Alba project page visual system using the approved Alba assets and current site structure. Evaluate hero choice, gallery composition, visual hierarchy, crop/aspect issues, and whether the assets feel project-specific and premium. Return specific recommendations for Codex, including filenames, placements, alt text, and any layout/crop changes. Do not suggest factual copy changes or deployment steps.
```
