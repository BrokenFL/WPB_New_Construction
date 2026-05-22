# Project Gallery Visual QA

## Method

- Built a contact sheet at `research/source-material-review/project-gallery-contact-sheet.jpg`.
- Built a homepage hero contact sheet at `research/source-material-review/hero-image-contact-sheet.jpg`.
- Reviewed imported placed images for project fit, crop, duplication, placement, caption clarity, and likely page weight risk.
- Reviewed homepage hero candidates for local geography, lack of baked-in labels, and whether they avoid implying Downtown WPB sits on the Atlantic surf line.

## Homepage Hero Results

- Selected five images: WPB geography map hero, North Flagler waterfront, South Flagler corridor, CityPlace/The Square, and NORA growth corridor.
- Omitted project-specific hero renderings from the rotating homepage hero to keep the first viewport about buyer orientation rather than one building.
- No visible carousel controls, text changes, or slide-specific captions were added beyond the subtle stable caption area.
- No obvious wrong-geography or oceanfront-Downtown implication was found in the selected set.

## Project Results

- Alba: beach-yoga card visual was not a strong project-specific building image; archived it and moved the exterior waterfront rendering to card placement.
- Banyan Tree: several tear-image downloads rendered nearly blank; archived the weak/duplicate assets and kept the stronger terrace/interior rendering.
- Berkeley: amenity, spa, dining, terrace, gym, and building visuals are appropriate; kept placements.
- Forte: interior and exterior/waterfront renderings are appropriate; panoramic water image is supporting gallery only.
- Maison d'Or: interior, pool, and tower images are appropriate; kept placements.
- NORA House: exterior/card and rooftop/pool amenity image are appropriate; kept placements.
- Ritz-Carlton WPB: imported residence/interior images are appropriate; kept placements.
- Shorecrest: residence and tower images are appropriate; one lifestyle image was reclassified as supporting gallery context.
- South Flagler House: residence, terrace, kitchen, living, and pool visuals are appropriate; kept placements.
- Rosewood: user-provided project renderings remain project-specific planning-watch visuals.
- Olara: existing curated project imagery remains strong and project-specific.

Archived imported records are preserved in `research/source-material-review/archived-imported-project-images.json`; original files remain on disk.

## Performance Notes

- No new public image assets were added in this pass.
- The rotating hero eagerly loads only the first image and lazily preloads the next layer.
- Large source images remain controlled by the existing asset budget and performance QA.
