# Alba Palm Beach Approved Asset Implementation

Date: 2026-05-26

Approved iCloud folder:

`/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library/01_PROJECTS/alba-palm-beach/approved-for-website`

Only assets from `approved-for-website` were used. No files were copied from review, staging, source, rejected, or neighboring Alba folders.

## Source Inventory

- Approved files found, excluding `.DS_Store`: 21
- Images with standard image extensions: 13
- Image-like no-extension JPEG logo file: 1
- PDFs: 7

PDFs were not copied in this pass because the first registry test is for Alba hero/gallery visual routing, not floorplan publishing.

## Selected Website Assets

| Placement | Source filename | Repo path |
|---|---|---|
| Hero | `alba-hero-aerial-waterfront-rendering-v01.jpg` | `public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-aerial-waterfront-rendering-v01.jpg` |
| Hero context | `alba-hero-wide-aerial-v01.webp` | `public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-wide-aerial-v01.webp` |
| Hero portrait | `alba-hero-vertical_exterior_tower-v01.jpg` | `public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-vertical-exterior-tower-v01.jpg` |
| Residences | `alba-residences-living-room-v01.webp` | `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-living-room-v01.webp` |
| Residences | `alba-residences-kitchen-with-view-v01.webp` | `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-kitchen-with-view-v01.webp` |
| Residences | `alba-residences-bedroom-01-v01.webp` | `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-bedroom-01-v01.webp` |
| Residences | `alba-residences-patio-v01.webp` | `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-patio-v01.webp` |
| Amenities | `alba-amenities-pool_deck-v01.jpg` | `public/assets/projects/alba-palm-beach/amenities/alba-palm-beach-amenities-pool-deck-v01.jpg` |
| Amenities | `alba-amenities-valet-v01.webp` | `public/assets/projects/alba-palm-beach/amenities/alba-palm-beach-amenities-valet-v01.webp` |
| Neighborhood | `alba-neighborhood- clocktower-v01.jpg` | `public/assets/projects/alba-palm-beach/neighborhood/alba-palm-beach-neighborhood-clock-tower-v01.jpg` |
| Logo | `alba-developer-BGI-Companies-logo-v01.jpeg` | `public/assets/projects/alba-palm-beach/logos/alba-palm-beach-developer-bgi-logo-v01.jpeg` |
| Logo | `alba-architect-spina-o'rourke-logo-v01.jpeg` | `public/assets/projects/alba-palm-beach/logos/alba-palm-beach-architect-spina-orourke-logo-v01.jpeg` |

## Hero Choice

Selected hero: `alba-hero-aerial-waterfront-rendering-v01.jpg`.

Reason: it is the highest-resolution approved hero candidate at 1800 x 1645 and shows the building, waterfront, marina, and neighborhood context. The current brochure hero uses `object-fit: cover`, so this image is appropriate for the layout with standard art direction.

## Registry

Alba entries were added to `data/project_assets.json` only. The live registry uses repo-local `/assets/...` paths and status `approved`; it does not use iCloud paths at runtime.

## Naming Cleanup

Copied filenames were normalized to lowercase dash/kebab-case. Underscores, uppercase source fragments, apostrophes, and accidental spaces were removed from public asset paths.
