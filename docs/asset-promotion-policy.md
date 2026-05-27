# Production Asset Promotion Policy

This policy defines how WPB New Construction images move from iCloud review folders into the GitHub website repo and Cloudflare production.

## Source Of Truth

The asset system has four layers:

- iCloud Asset Library: staging, review, and original-file preservation.
- GitHub repo `public/assets`: production source for final approved optimized website assets.
- `data/project_assets.json`: deterministic placement control for project pages.
- Cloudflare Pages: live delivery surface for assets built from the repo.

The repo should contain only selected, final, web-ready assets. It should not mirror the full iCloud library.

## Approved Folder Rule

Only files inside each project's `approved-for-website` folder may be promoted into production.

Approved source folder pattern:

```text
/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library/01_PROJECTS/[project-slug]/approved-for-website
```

Do not promote files from:

- `00_review`
- `needs-review`
- `rejected`
- `source_docs`
- neighboring project folders
- general lifestyle folders
- local staging folders
- any folder with unclear approval status

If an image looks useful but is not in `approved-for-website`, stop and ask Brooke to approve or move it first.

## Production Path Convention

Promoted assets live under:

```text
public/assets/projects/[project-slug]/[placement]/[filename]
```

Allowed placements:

- `hero`
- `residences`
- `amenities`
- `neighborhood`
- `logos`
- `floorplans` only when explicitly approved
- `lifestyle` later, after lifestyle handling is defined separately

## Filename Convention

Use lowercase dash/kebab-case only:

```text
[project-slug]-[placement]-[descriptor]-v01.[ext]
```

Examples:

- `shorecrest-hero-waterfront-tower-v01.webp`
- `ritz-carlton-wpb-residences-living-room-v01.webp`
- `olara-amenities-pool-deck-v01.webp`

Avoid spaces, underscores, apostrophes, uppercase fragments, source-library prefixes, accidental punctuation, and generic names such as `image1.webp`.

## Image Size And Format

Recommended production targets:

| Placement | Size target |
| --- | --- |
| Desktop hero | Max 2400 px wide, target under 1.2 MB |
| Mobile hero | Max 1600 px tall, target under 900 KB |
| Gallery | Max 1800 px wide, target under 800 KB |
| Logos | SVG, PNG, or WebP; keep small |

Prefer WebP for photos and renderings unless transparency, brand mark requirements, or source quality requires PNG. JPG is acceptable when it is already efficient and visually clean.

Do not place 10-13 MB raw images in the production repo unless Brooke explicitly approves the exception.

## Optimization Step

Before copying any image into `public/assets`, Codex should:

1. Inspect dimensions and byte size.
2. Decide whether optimization is needed.
3. Create an optimized copy when needed.
4. Preserve the iCloud original unchanged.
5. Copy only the final web-ready file into the repo.
6. Confirm the repo filename follows the production convention.

Never modify or overwrite the iCloud original. If multiple crops are needed, create versioned production files such as `v01`, `v02`, or placement-specific descriptors.

## Registry Rule

Every promoted production asset must be represented in `data/project_assets.json`.

Required fields:

- `src`
- `placement`
- `variant`
- `alt`
- `title`
- `credit`
- `source`
- `status`

The `src` must point to the repo-served `/assets/...` path, not an iCloud path. Use `status: "approved"` only for files that are approved, optimized, copied into `public/assets`, and intended for website rendering.

The Alba Palm Beach registry is the current proof of concept for this pattern.

## Validation

Every asset promotion must run:

```bash
npm run check:assets
npm run build
npm run qa:image-alt
npm run qa:project-pages
npm run qa:internal-links
```

Use the SSD repo for heavy build and QA when available:

```text
/Volumes/ExternalSSD/WPB_NewConstruction
```

The iCloud repo is acceptable for light edits and emergency verification, but large build output may hang because CloudDocs can interfere with Vite output preparation. If an iCloud build stalls after module transform, clear `dist` and prefer the SSD repo or a local non-iCloud clone for the final build/deploy path.

## What Not To Promote

Do not promote:

- duplicate images
- source PDFs unless explicitly approved
- raw huge files
- files from review or rejected folders
- unrelated lifestyle images inside project folders
- images with unclear rights
- screenshots or temporary export artifacts
- files whose project identity is ambiguous

If rights, source, or project identity is unclear, keep the file in iCloud review and do not copy it into the repo.

## Project Rollout Order

Promote future projects one folder/project at a time:

1. Alba Palm Beach - already live as the proof of concept.
2. Shorecrest
3. Ritz-Carlton WPB
4. Olara
5. South Flagler House
6. Mr. C
7. Berkeley
8. Nora House
9. Mandarin
10. Rosewood

Each project should get its own review, asset copy, registry update, QA run, and commit. Avoid multi-project asset dumps.

## Release Boundary

Asset promotion is not deployment. Copying files and updating the registry prepares a branch for review. Cloudflare production changes only after the repo change is merged and a deploy is explicitly approved.
