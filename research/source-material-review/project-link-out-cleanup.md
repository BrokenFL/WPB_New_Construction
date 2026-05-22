# Project Link-Out Cleanup

Generated: 2026-05-22

## Goal

Keep buyers on WPB New Construction instead of sending them to project sponsor, sales-office, brochure, or floorplan-download surfaces from public project pages.

## Public Behavior Changed

- Project brochure CTAs now route to inquiry/current-packet requests.
- Project related-news rows now route to internal update articles first.
- Project documents with external URLs or PDF URLs are rendered as buyer-packet inquiry actions rather than external links.
- Floorplan links are handled by the internal viewer or by the floorplan library route.

## CTA Replacements

- Ask Brooke About This Building
- Request Current Availability
- Compare This Building
- See Floor Plans
- Contact Brooke

## Allowed Source Links

- Research/source catalog files may keep source URLs.
- News article pages may link to the original source at the bottom only.
- Douglas Elliman legal/privacy links remain in legal pages.

## QA Notes

Rendered local spot checks found no visible external project/sales-office links on:

- `/`
- `/updates/`
- `/market-notes/`
- `/floorplans/`
- `/projects/olara/`

Broader source scans will still find research URLs and hidden/internal source material; those are not public project-page CTAs.
