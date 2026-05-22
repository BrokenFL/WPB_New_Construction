# Project Gallery Performance Resize Report

Updated 2026-05-22.

## Summary

- Created 34 optimized JPG variants for heavy photographic media used by Olara, Ritz-Carlton WPB, and Shorecrest.
- Moved rendered references from multi-megabyte PNG/JPG originals to hero/card/gallery-sized JPG variants.
- Estimated referenced-image transfer reduction for the optimized set: 142.4 MB original assets to 13.8 MB optimized assets, about 128.6 MB saved across the replaced references.
- Original files were preserved in place for source traceability; no source assets were deleted.

## Images Resized And Rewired

| Project | Usage | Original | New Rendered Asset | Savings |
| --- | --- | --- | --- | --- |
| Olara | Hero | `olara-hero-exterior-1536x1024.png` 2.6 MB | `olara-hero-exterior-1536x1024.jpg` 552 KB | ~2.1 MB |
| Olara | Mobile hero | `olara-mobile-hero-exterior-1080x1350.png` 2.1 MB | `olara-mobile-hero-exterior-900x1125.jpg` 247 KB | ~1.8 MB |
| Olara | Gallery card | `olara-gallery-card-pool-1600x2000.png` 4.4 MB | `olara-gallery-card-pool-1200x1500.jpg` 392 KB | ~4.0 MB |
| Olara | Gallery/residence/amenity | 13 `2400x1600` PNG files, each about 3.6-5.4 MB | 13 `1600x1067` JPG files, about 300-536 KB | ~55 MB |
| Ritz-Carlton WPB | Hero | `ritz-hero-waterfront-building-2880x1800.png` 6.0 MB | `ritz-hero-waterfront-building-2200x1375.jpg` 737 KB | ~5.3 MB |
| Ritz-Carlton WPB | Mobile hero | `ritz-mobile-hero-tower-sunset-1080x1350.png` 2.0 MB | `ritz-mobile-hero-tower-sunset-900x1125.jpg` 191 KB | ~1.8 MB |
| Ritz-Carlton WPB | Gallery card | `ritz-gallery-card-waterfront-tower-1600x2000.png` 4.0 MB | `ritz-gallery-card-waterfront-tower-1200x1500.jpg` 349 KB | ~3.6 MB |
| Ritz-Carlton WPB | Gallery/residence/amenity | 12 `2400x1600` PNG files, each about 3.6-5.9 MB | 12 `1600x1067` JPG files, about 280-618 KB | ~50 MB |
| Shorecrest | Hero candidate | `shorecrest-exterior-hero.jpg` 5.7 MB | `shorecrest-exterior-hero-2200x1466.jpg` 670 KB | ~5.0 MB |
| Shorecrest | Card candidate | `card.png` 1.4 MB | `card-1200x688.jpg` 265 KB | ~1.1 MB |
| Shorecrest | Demoted portrait asset | `shorecrest-residence.png` 885 KB | `shorecrest-residence-900x1179.jpg` 107 KB | Documented only after visual QA |

## Route / Project Usage

- `/projects/olara/`: hero, mobile hero, legacy full profile, residence/gallery/amenity strips.
- `/projects/ritz-carlton-wpb/`: hero, mobile hero, legacy full profile, residence/gallery/amenity strips, CSS background.
- `/projects/shorecrest/`: card/exterior candidates and gallery QA; the portrait-like residence slot was replaced with the approved Shorecrest interior rendering.

## Deferred Items

- Floorplan JPG previews under `public/projects/*/docs/floorplans/` remain large in places, especially South Flagler House site-plan sheets. They are document-review assets rather than card/gallery media and should be handled in a document-preview-specific branch.
- The original heavy PNG/JPG source assets remain in `public/projects` for traceability. A later cleanup branch can archive or remove them after explicit approval.
