# Untracked Image Inventory

Generated: 2026-05-22

The eight untracked images previously sat under `public/projects/.../media/imported/`, which made them deployable without review. They have been moved to `research/imported-project-images/review/` and are not wired into public pages.

| Path | Size | Dimensions | Visual Description | Likely Use | Duplicate? | Recommended Action |
| --- | ---: | --- | --- | --- | --- | --- |
| `research/imported-project-images/review/ritz-carlton-wpb/interior-2026-05-22-050.jpg` | 500K | 1800x1234 | Lifestyle photo/rendering of a couple reclining on resort-style beach or pool loungers under palms. It is not an interior despite the importer filename. | Possible Ritz-Carlton lifestyle/amenity support only if source rights and project match are confirmed. | Near duplicate group with `051` and `052`; best candidate among the three only because it is largest. | needs-human-review |
| `research/imported-project-images/review/ritz-carlton-wpb/interior-2026-05-22-051.jpg` | 452K | 1800x1234 | Same lounge-chair couple image as `050`, with nearly identical crop. | Do not use unless it proves to be the only approved version, which is unlikely. | Near duplicate of `050`. | duplicate-do-not-use |
| `research/imported-project-images/review/ritz-carlton-wpb/interior-2026-05-22-052.jpg` | 468K | 1800x1235 | Same lounge-chair couple image as `050`, with nearly identical crop. | Do not use unless it proves to be the only approved version, which is unlikely. | Near duplicate of `050`. | duplicate-do-not-use |
| `research/imported-project-images/review/ritz-carlton-wpb/interior-2026-05-22-053.jpg` | 408K | 1800x1089 | Bright resort bar/lifestyle image of a couple holding drinks. It is not a clear project interior rendering. | Possible Ritz-Carlton lifestyle/amenity support only if source rights and project match are confirmed. | Not an exact duplicate of the other Ritz files, but generic lifestyle context overlaps. | needs-human-review |
| `research/imported-project-images/review/south-flagler-house/unknown-2026-05-22-054.jpg` | 392K | 1800x1012 | Exterior upper-tower or penthouse rendering with Intracoastal/ocean context. | Strong South Flagler House gallery or exterior context candidate after rename, metadata, source verification, and optimization. | No exact duplicate found among tracked imported files by filename/hash. | move-to-review |
| `research/imported-project-images/review/south-flagler-house/unknown-2026-05-22-055.jpg` | 488K | 1800x1199 | Indoor golf simulator amenity rendering with wood ceiling and arched details. | Useful South Flagler House amenity candidate after rename, metadata, source verification, and optimization. | No exact duplicate found among tracked imported files by filename/hash. | move-to-review |
| `research/imported-project-images/review/south-flagler-house/unknown-2026-05-22-056.jpg` | 344K | 1800x1199 | Warm interior bar/lounge amenity rendering. | Useful South Flagler House amenity/interior candidate after rename, metadata, source verification, and optimization. | No exact duplicate found among tracked imported files by filename/hash. | move-to-review |
| `research/imported-project-images/review/south-flagler-house/unknown-2026-05-22-057.jpg` | 172K | 1800x767 | Fitness/wellness lifestyle image with treadmill, waterfront view, and screen showing a tower rendering. | Possible South Flagler House wellness amenity support after source verification; lower priority than true renderings. | No exact duplicate found among tracked imported files by filename/hash. | move-to-review |

## Use Decision

Likely usable after human review: the four South Flagler House files, especially `054`, `055`, and `056`.

Potentially usable but weaker: Ritz-Carlton `050` and `053`, only if the import source proves they are authorized project marketing assets.

Should not be used: Ritz-Carlton `051` and `052`, because they are near duplicates of `050`.

No image was wired into the public site in this branch. The safe next step is to verify source URLs in `research/imported-project-images/importedProjectImages.json` or rerun the developer-image import/review workflow, then rename and place only approved images.
