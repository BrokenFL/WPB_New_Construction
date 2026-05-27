# Asset Workflow

This is the short operating rulebook for moving project images from review into the production website. See [asset-promotion-policy.md](/Volumes/ExternalSSD/WPB_NewConstruction/docs/asset-promotion-policy.md) for the full promotion policy.

## Source Of Truth Model

- iCloud Asset Library is the staging and review warehouse.
- Repo `public/assets` is the production source for final approved web-ready assets.
- `data/project_assets.json` controls website placement.
- Cloudflare Pages serves the production assets from the repo build.

Do not dump the full iCloud library into GitHub. Promote assets one project or folder at a time.

## Approved Folder Rule

For website work, the approved source is the project `approved-for-website` folder. Only files in that folder should be copied into the repo for production use.

Do not promote images from review, staging, source, rejected, neighboring project, or lifestyle folders unless Brooke explicitly approves the specific file and target placement.

## Production Repo Paths

Repo-local production assets live under:

```text
public/assets/projects/[project-slug]/[placement]/[filename]
```

Allowed project placements are:

- `hero`
- `residences`
- `amenities`
- `neighborhood`
- `logos`
- `floorplans` only when explicitly approved
- `lifestyle` later, after a separate policy pass

New asset folders and filenames must use lowercase dash/kebab-case names. Do not introduce underscores, accidental spaces, uppercase words, or source-library naming artifacts in new public asset paths.

Filename pattern:

```text
[project-slug]-[placement]-[descriptor]-v01.[ext]
```

Examples:

- `shorecrest-hero-waterfront-tower-v01.webp`
- `ritz-carlton-wpb-residences-living-room-v01.webp`
- `olara-amenities-pool-deck-v01.webp`

## Optimization Rule

GitHub should receive only final selected, approved website assets. Do not commit the full iCloud asset library, review folders, rejected files, source folders, or oversized source packages unless a specific public website feature requires them.

Before copying into `public/assets`, inspect file dimensions and byte size. Create an optimized web-ready copy when needed, preserve the iCloud original unchanged, and keep large raw files out of the production repo. No 10-13 MB images should enter production unless explicitly approved.

Default targets:

- Desktop hero: max 2400 px wide, target under 1.2 MB.
- Mobile hero: max 1600 px tall, target under 900 KB.
- Gallery: max 1800 px wide, target under 800 KB.
- Logos: SVG, PNG, or WebP; keep small.
- Prefer WebP for photos and renderings unless transparency or source format requires PNG.

## Registry Rule

The deterministic registry lives in `data/project_assets.json`, with TypeScript lookup helpers in `src/data/projectAssets.ts`. Current lookup priority is:

1. Approved registry asset for the requested placement.
2. Existing project image fields from the generated/current site data.
3. Existing project-intelligence and editorial fallbacks.

Every promoted production asset must be represented in `data/project_assets.json` with:

- `src`
- `placement`
- `variant`
- `alt`
- `title`
- `credit`
- `source`
- `status`

## Validation

Run these checks for every asset promotion before committing:

```bash
npm run check:assets
npm run build
npm run qa:image-alt
npm run qa:project-pages
npm run qa:internal-links
```

For documentation-only changes to this policy, run:

```bash
npm run qa:copy
npm run qa:customer-copy
npm run qa:internal-links
```

## Rollout Order

Alba is the live registry proof of concept. Promote future projects one project at a time in this order:

1. Shorecrest
2. Ritz-Carlton WPB
3. Olara
4. South Flagler House
5. Mr. C
6. Berkeley
7. Nora House
8. Mandarin
9. Rosewood

Use the SSD repo, or a local non-iCloud clone, for heavy build and deploy work when available. The iCloud repo can build after clearing `dist`, but large build output may hang because CloudDocs sync can interfere with Vite output preparation.
