# Alba Palm Beach Approved Asset Implementation

Date: 2026-05-26

Approved iCloud folder:

`/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library/01_PROJECTS/alba-palm-beach/approved-for-website`

Only assets from `approved-for-website` were used. No files were copied from review, staging, source, rejected, or neighboring Alba folders.

## Source Inventory

- Approved files found, excluding `.DS_Store`: 21
- Images with standard image extensions: 14
- Image-like no-extension JPEG logo file: 1
- PDFs: 7

PDFs were not copied in this pass because the first registry test is for Alba hero/gallery visual routing, not floorplan publishing.

## Selected Website Assets

| Placement | Source filename | Repo path |
|---|---|---|
| Hero (Primary Desktop) | `alba-hero-wide-aerial-v01.webp` | `public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-wide-aerial-v01.webp` |
| Hero context (Secondary) | `alba-hero-aerial-waterfront-rendering-v01.jpg` | `public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-aerial-waterfront-rendering-v01.jpg` |
| Hero portrait (Mobile) | `alba-hero-vertical_exterior_tower-v01.jpg` | `public/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-vertical-exterior-tower-v01.jpg` |
| Residences (Living Room) | `alba-residences-living-room-v01.webp` | `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-living-room-v01.webp` |
| Residences (Interior) | `alba-hero-interior-view-v01.webp` | `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-interior-view-v01.webp` |
| Residences (Kitchen) | `alba-residences-kitchen-with-view-v01.webp` | `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-kitchen-with-view-v01.webp` |
| Residences (Bedroom) | `alba-residences-bedroom-01-v01.webp` | `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-bedroom-01-v01.webp` |
| Residences (Patio) | `alba-residences-patio-v01.webp` | `public/assets/projects/alba-palm-beach/residences/alba-palm-beach-residences-patio-v01.webp` |
| Amenities (Pool Deck) | `alba-amenities-pool_deck-v01.jpg` | `public/assets/projects/alba-palm-beach/amenities/alba-palm-beach-amenities-pool-deck-v01.jpg` |
| Amenities (Valet) | `alba-amenities-valet-v01.webp` | `public/assets/projects/alba-palm-beach/amenities/alba-palm-beach-amenities-valet-v01.webp` |
| Logo (Developer) | `alba-developer-BGI-Companies-logo-v01.jpeg` | `public/assets/projects/alba-palm-beach/logos/alba-palm-beach-developer-bgi-logo-v01.jpeg` |
| Logo (Architect) | `alba-architect-spina-o'rourke-logo-v01.jpeg` | `public/assets/projects/alba-palm-beach/logos/alba-palm-beach-architect-spina-orourke-logo-v01.jpeg` |

*Note: The neighborhood clock tower image (`alba-neighborhood- clocktower-v01.jpg`) was removed from the active registry because it represents Palm Beach Island rather than the North Flagler neighborhood context where Alba is built.*

## Hero Sourcing and Art Direction

- **Primary Desktop Hero:** `alba-palm-beach-hero-wide-aerial-v01.webp` is selected as the primary hero image. Its wide aspect ratio (16:9) fits the desktop split-hero layout cover behavior with minimal vertical cropping.
- **Mobile Hero Art Direction:** `alba-palm-beach-hero-vertical-exterior-tower-v01.jpg` is configured as the mobile/portrait hero. Code inside `src/main.ts` resolves this `vertical-exterior` variant for mobile viewports to prevent awkward side-clipping of the tower structure on narrow screens.
- **Secondary Hero:** The square rendering `alba-palm-beach-hero-aerial-waterfront-rendering-v01.jpg` is retained in the registry under variant `wide-context` and serves as context imagery in the gallery rather than the primary hero block.

## Registry and Helper Code

Alba entries are maintained in `data/project_assets.json` with status `approved`. Code in `src/main.ts` was refined to look up the `vertical-exterior` hero variant from the asset registry automatically if present.
