# Image SEO Accessibility Audit

## Images Reviewed

- Imported project images in `src/data/approvedImportedProjectImages.json`.
- Public project media under `public/projects`.
- Inline image alt text in `src/main.ts`.
- Editorial image metadata in `src/data/editorialImagery.ts`.

## Alt Improvements Made

- Replaced generic imported-image alt text such as "Project image" and "Interior image" with project-specific descriptions.
- Added clearer alt text for Alba, Banyan Tree, Berkeley, Forte, Maison d'Or, NORA House, Ritz-Carlton, Shorecrest, and South Flagler House imported assets.
- Replaced weak captions such as "Developer image" and "Amenity image" with concise project-specific captions.
- Added homepage hero alt text in `src/data/homeHeroImages.ts` for geography, North Flagler, South Flagler, CityPlace/The Square, and NORA imagery.
- Kept developer/project marketing credit fields on placed imported images.
- Renamed placed imported images to descriptive project/image-type filenames where the subject was clear.

## Gallery QA Changes

- Archived the Alba beach-yoga image from card use because it was not the best project-specific building visual.
- Promoted the Alba waterfront exterior/aerial rendering to card placement.
- Archived several Banyan Tree tear-image downloads that rendered nearly blank in the contact sheet.
- Moved one Shorecrest lifestyle image from interior placement to supporting gallery context.
- Moved five non-placed imported records to `research/source-material-review/archived-imported-project-images.json` so the public image bundle contains only placed images.

## Weak Alt Text Remaining

- Some older hand-authored inline gallery assets still use concise labels such as "reference card image"; these are not blocking but can be improved during a future broader media pass.

## Filename Cleanup Result

- Completed for placed imported project images in `src/data/approvedImportedProjectImages.json`.
- Full mapping is documented in `research/source-material-review/imported-image-filename-cleanup.md`.
- Candidate-only archived/imported files that are not public placements remain unchanged until they are approved for use.
