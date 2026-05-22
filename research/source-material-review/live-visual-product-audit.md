# Live Visual Product Audit

Generated: 2026-05-22

## Routes Reviewed

Rendered with Playwright against local preview `http://127.0.0.1:4173` and current live `https://www.wpbnewconstruction.com`.

- `/`
- `/updates/`
- `/market-notes/`
- `/floorplans/`
- `/buildings/`
- `/map/`
- `/compare/`
- `/inquire/`
- `/projects/olara/`
- `/projects/rosewood/`
- `/projects/nora-house/`
- `/projects/south-flagler-house/`
- `/corridors/north-flagler/`
- `/corridors/downtown/`
- `/corridors/south-flagler/`

Evidence files: `output/playwright/visual-audit-results.json` and route screenshots under `output/playwright/`.

## Homepage Flow Problems

- Before this branch, Updates read as external headlines and Guidance/Market Notes sat too close to a feed-card pattern.
- The desired homepage flow is now Hero, Map, Corridors, Updates, Guidance, Featured Buildings, CTA.
- Public labels now use Updates and Guidance. Blog is not visible in the rendered local pass.

## Repeated Image Problems

- The first local pass found adjacent Olara imagery in Guidance because two guidance cards resolved through project-image precedence.
- The corrected local pass removed adjacent visible repetition on the homepage, Updates, Floor Plans, and Olara project route.
- Guidance card affinity was adjusted so the index no longer shows Olara back-to-back.
- Google map tile sprites and hidden route DOM can create false positives in raw image scans; visible-image checks were used for product judgment.

## News / Updates UX Problems

- Live site still treats update cards as source-first links.
- Local branch changes cards to image, headline, deck/excerpt, related project/corridor, and primary `Read Update`.
- The Updates index no longer exposes a primary off-site source CTA in the visible local route.

## Project Page Link-Out Problems

- Public project pages should not behave like a sales-office directory.
- Local branch removes or reroutes visible project brochure/source actions to Brooke, inquiry, internal update pages, or floorplan library anchors.
- Source URLs remain in research and article attribution, not as project-page primary CTAs.

## Floorplan UX Problems

- Live behavior was link/PDF-oriented.
- Local branch has 243 floorplan buttons opening an internal viewer. Mobile Playwright opened the viewer successfully and rendered an inline PDF iframe.
- External floorplan pages route to a packet-request viewer state rather than sending buyers directly to sales-office pages.

## Buyer Journey Problems

- The strongest conversion path is now internal: Updates -> article -> Brooke CTA, Project -> inquiry/floorplans, Floorplans -> viewer -> packet request.
- Remaining risk: some legacy hidden project views still exist in source, but rendered project routes use the newer brochure-style project pages.

## Mobile Issues

- Floorplan viewer was checked at `390x844`; it opens as a full-screen modal with close, next/previous, packet request, and Brooke CTA.
- No mobile horizontal-overflow blocker was observed in the floorplan viewer check.

## Fixes Applied

- Internal update article pages added at `/updates/:id/`.
- Update cards changed from off-site primary links to internal `Read Update`.
- Source links moved to article footers as `Read the original source`.
- Public labels changed to Updates and Guidance.
- Floorplan cards changed from direct links to internal viewer buttons.
- Project source/brochure link-outs rerouted to inquiry/internal surfaces.
- Image repetition QA now checks rendered homepage output after build.
- Brooke Builder now has a Homepage Editor and `content/overrides/homepage-overrides.json` storage.

## Remaining Recommendations

- After deployment, repeat visible-image checks on live because the current live bundle is pre-branch.
- Add a small visual regression check that filters only visible images, avoiding hidden route DOM and map tile false positives.
- If Brooke approves, add per-card homepage image override mapping rather than section-level overrides only.
