# Rosewood Design Handoff

Updated: 2026-05-21

This handoff comes from the page-design coordinator agent. It inspected the repo and did not modify files.

## Recommended Page Shape

Use the Ritz/Olara full-project pattern rather than the snapshot fallback.

Suggested sections:

1. Full-bleed hero with desktop/mobile image or placeholder, project name, status/corridor line, short buyer-facing positioning, and CTA for advisory updates.
2. Project snapshot facts grid: address, approval status, floors, proposed residences, price availability, developer, architect, and unconfirmed fields clearly labeled.
3. Team section covering developer, brand operator, GC, architect, interiors, landscape, and sales.
4. Gallery strip with exterior/building, arrival/lobby, and amenity/residence.
5. Arrival/building story using exterior, porte-cochere, lobby, or branded arrival image.
6. Residences grid with living room, kitchen, primary suite/bath, terrace/view imagery once rights are clear.
7. Views/location context focused on North Flagler, Currie Park, the Intracoastal, Palm Beach Island, and nearby waterfront pipeline projects.
8. Amenities section limited to confirmed planning facts: reported indoor amenity square footage, fifth-floor pool, parking, and broad Rosewood-branded residential positioning.
9. Planning/market context for the May 19, 2026 Planning Board agenda, height-bonus request, and current unknowns.
10. Document/source library for municipal agenda and reference reporting; do not present it as sales collateral.

## Asset Directory

Use this structure after assets are verified or approved:

```text
public/projects/rosewood/
  asset-map.json
  project-profile.json
  media/
    rosewood-hero-waterfront-tower-2880x1800.png
    rosewood-mobile-hero-waterfront-1080x1350.png
    rosewood-gallery-card-exterior-1600x2000.png
    rosewood-arrival-context-2400x1600.png
    rosewood-amenity-pool-2400x1600.png
    rosewood-residence-view-2400x1600.png
    rosewood-logo.svg
  docs/
    rosewood-brochure.pdf
    rosewood-floorplans-all.pdf
    floorplans/
      rosewood-residence-01.pdf
      rosewood-residence-02.pdf
```

## Files To Edit For The Actual Page

- `src/proposals.ts`: add Rosewood as a `ProposalBuilding` if it should appear in the map, route cards, filters, and comparison pipeline.
- `src/main.ts`: add Rosewood constants, overrides, rank/residence data, facts/team/gallery/floorplan arrays, and a full `route-view-full-project` block.
- `public/projects/rosewood/...`: add approved media, docs, `asset-map.json`, and `project-profile.json`.
- `src/style.css`: likely not required; existing full-project classes should support the page. Edit only if Rosewood content breaks current layouts.
- `public/data/project-team-credits.json`: optional if shared team data becomes source of truth.
- `WEST_PALM_BEACH_PROJECT_BUILDINGS.md`: optional inventory update because Rosewood is still planning-stage and approval-sensitive.
