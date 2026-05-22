# Local Visual Site Review

Generated: 2026-05-22

## Routes Reviewed

- `/`
- `/buildings/`
- `/map/`
- `/compare/`
- `/updates/`
- `/market-notes/`
- `/answers/`
- `/floorplans/`
- `/inquire/`
- `/projects/olara/`
- `/projects/rosewood/`
- `/projects/nora-house/`
- `/projects/south-flagler-house/`
- `/corridors/north-flagler/`
- `/corridors/downtown/`
- `/corridors/south-flagler/`

Reviewed against local preview at `http://127.0.0.1:4174/`, not the live site.

## Image Repetition Problems

- Olara repeated the same hero rendering across the hero, residence, amenity, and team modules. This was the clearest rendered-page problem.
- Rosewood, NORA House, and South Flagler House reuse some same-project renderings, but after the cleanup no reviewed project page uses one non-logo image more than three times.
- The homepage and building grid still repeat a small number of project images because the same project appears in news, corridor, and project-card contexts. This is acceptable for now, but the homepage should keep moving toward more distinct card imagery as approved images are added.

## Images That Appear in the Wrong Context

- No rendered route showed Rosewood imagery outside Rosewood context.
- No rendered route showed the Kravis image as a building image.
- No rendered South Flagler project page used North Flagler corridor imagery.
- The previous Olara issue was not a wrong-project image; it was same-image overuse.

## Sections That Feel Backend/Admin

- Project-page update sections are now simple text rows, not image cards or feed cards.
- Public blocked-copy scan did not find visible `backend`, `needs-sourcing`, `public-source record`, `data model`, or `generated` language in the reviewed rendered routes.
- Remaining workflow terms belong in docs/research, not public UI.

## Project Pages That Need Better Visual Hierarchy

- Project pages have a strong brochure-like structure: identity header, hero, quick facts, overview, image modules, team, location, resources, notes.
- Olara needed the most correction because repeated hero imagery made the page feel templated. The residences, amenity, and team modules now use distinct approved Olara imagery where available and intentional placeholders where not.
- Compact planning-watch pages such as Rosewood and NORA House appropriately stay lighter than full brochure pages.

## Update Sections That Should Be Simplified

- Individual project pages use `Recent project notes`.
- Rows show date, title, one-sentence summary, source name, and source/inquiry actions.
- `/updates/` remains the richer update/news page.

## Missing Developer / Designer / Architect Material

- `src/data/projectTeamResources.ts` now supports the requested team resource schema and role list.
- Public rendering should continue to prefer approved logos or clean placeholders. Do not use fake people, fake offices, or invented affiliation imagery.
- Priority sourcing remains: Olara developer/design team, Rosewood brand/developer team, NORA district team, South Flagler architecture/design team.

## Mobile Visual Issues

- Mobile spot checks were run for `/`, `/projects/rosewood/`, `/projects/south-flagler-house/`, and `/updates/`.
- No visible blocked copy was found.
- Continued recommendation: keep project-note rows text-first on mobile and avoid adding thumbnail cards back into project pages.

## Fixes Applied

- Added image repetition QA and markdown report generation.
- Wired `qa:image-repetition` into `qa:launch`.
- Changed project brochure gallery logic to dedupe image assets.
- Prevented thin image sets from recycling the same hero image into amenities and team tiles.
- Added intentional placeholder fallback behavior for missing amenity/team visual resources.
- Hardened the Cloudflare deploy script diagnostics and cleanup.

## Remaining Recommendations

- Add more approved, project-specific card/gallery images for pages that still depend on a small source set.
- Convert the rendered route summary into a reusable visual QA script if this review becomes a recurring workflow.
- Keep live visual review separate from local review whenever Cloudflare deployment is stale or unhealthy.
