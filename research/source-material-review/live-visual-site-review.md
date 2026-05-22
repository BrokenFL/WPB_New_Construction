# Live Visual Site Review

## Routes Reviewed

Live and local preview review covered `/`, `/buildings/`, `/map/`, `/compare/`, `/updates/`, `/market-notes/`, `/answers/`, `/floorplans/`, `/inquire/`, `/projects/olara/`, `/projects/rosewood/`, `/projects/nora-house/`, `/projects/south-flagler-house/`, `/corridors/north-flagler/`, `/corridors/downtown/`, and `/corridors/south-flagler/`.

All reviewed live routes visibly rendered after the emergency fix. Playwright reported zero console errors on the visible route pass.

## Repetitive Image Issues

- The homepage, map, and Market Notes still lean heavily on the WPB geography/editorial image. This is acceptable as a shared orientation image, but it should not become the default for every article.
- Olara imagery appears in multiple buyer-note contexts because the current notes compare Olara to Shorecrest and floor-plan depth. This is contextually defensible, but future notes should use topic-specific images when available.
- Project cards for earlier-stage projects still depend on corridor/context imagery when official project media is not cleared.

## Images That Feel Misplaced

- No critical Rosewood/NORA/Kravis/South Flagler cross-context misuse was observed in the reviewed routes.
- The comparison and inquiry pages use the buyer-intelligence interior image appropriately, but it should remain reviewed as a buyer advisory image rather than a project-specific image.

## Sections That Still Feel Backend/Admin

- Floorplans are useful but dense; labels such as `Request current packet` are buyer-safe, but the table-like repetition still feels operational.
- Some project facts panels remain very data-heavy. They are readable, but a few lower-confidence project pages need more editorial hierarchy.

## Project Pages Needing Better Imagery

- Rosewood: public rendering is present and correctly scoped, but branding/logo sourcing remains incomplete.
- NORA House: project rendering exists and context is appropriate; more official interiors or amenity imagery would help.
- South Flagler House: page has a correct project reference image and logo, but would benefit from more varied gallery images.
- Early pipeline/watch pages still need better project-specific imagery before they feel fully editorial.

## Team / Developer / Architect Visual Gaps

- Developer, architect, and designer resources are still mostly placeholder-led.
- The Content Studio now creates a path to add reviewed team imagery without exposing fake people or internal sourcing labels.

## Copy That Still Needs Human Polish

- Some project update summaries are accurate but still compact and source-led. Keep them as simple text rows, but improve phrasing as new verified updates are approved.
- Some lower-confidence project pages repeat `not publicly confirmed` often. This is honest, but future polish should group uncertainty into a tighter buyer note.

## Mobile Issues

- No blank or broken mobile route state was found in this pass.
- Dense floorplan and answer matrix sections should remain on the watch list for long labels and repeated rows.

## Recommended Fixes

- Continue replacing shared editorial fallback images with project-specific approved assets.
- Prioritize team resource imagery for developer, architect, interior designer, landscape architect, and brand partner records.
- Keep project updates as simple text rows, not image cards.
- Add more topic-specific Market Notes images before expanding the article library.

## Fixes Applied This Branch

- Restored live rendering by fixing the project-page `heroImage` initialization order.
- Added a live route smoke test that catches blank roots and critical console errors.
- Added Brooke Content Studio foundation for local copy overrides, upload manifests, project update rows, team resources, and automation status.
