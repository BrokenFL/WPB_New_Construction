# Expert Review Rounds Summary

## Round 1

Personas: critic, publisher, UI designer, creative visual director.

Primary findings:

- Homepage needed stronger proof and a clearer buyer value proposition.
- Mobile map and project cards needed more decision data.
- Internal/prototype language needed removal.
- Image and brokerage/compliance language needed safer wording.
- Inquiry page needed to explain what the buyer receives.
- Static answer-engine route needed crawler-visible Q&A content.

Implemented:

- Added homepage proof strip.
- Added buyer-facing corridor summary drawer.
- Restored concise project-card intelligence.
- Rewrote Olara/internal copy into buyer-facing copy.
- Strengthened inquiry deliverables and consent.
- Added static FAQ/JSON-LD prerendering for `/answers/`.

## Round 2

Personas: critic and publisher/compliance.

Primary findings:

- Licensed brokerage identity needed the legal brokerage name.
- Static FAQ citations needed links, access dates, and confidence limitations.
- Card chips needed explicit labels.
- Image captions needed to avoid implying developer endorsement.
- Privacy page needed site-specific lead handling language.

Implemented:

- Updated brokerage identity to `Douglas Elliman Florida, LLC d/b/a Douglas Elliman`.
- Added brokerage license `CQ1020232` adjacent to contact surfaces.
- Rewrote consent language around manual contact and no automated marketing consent.
- Added site-specific privacy handling language.
- Added clickable citation/access/confidence text to static FAQ prerender.
- Rewrote image labels to separate site-use clearance from developer endorsement.

## Round 3

Personas: combined critic/UI/creative and publisher/compliance.

Primary findings:

- Pending-rights images should not be publicly rendered.
- Local-only floorplan copies should not be public links without republication rights.
- Mobile filters should not rely on hidden horizontal scrolling.
- Lead destination is still a final operational approval item.

Implemented:

- Pending-rights project images now render as `Image withheld pending written publication clearance` placeholders.
- Generated floorplan data no longer publishes local `/projects/.../docs/floorplans` links.
- Local-only floorplan records remain in the catalog but are marked as internal/withheld and prompt packet requests.
- Mobile filter chips wrap into visible rows.
- Final QA passes with 37 checks and 0 findings.

## Current Status

Ready for broker/compliance review and operational lead-routing decision.

Still needed before public launch:

- Final lead destination: CRM, Google Sheet, email workflow, or form provider.
- Written image-use evidence folder for all assets marked cleared.
- Final decision on whether withheld local floorplan copies may ever be published.
- Broker/compliance signoff on live URL, disclosures, brokerage naming, and contact placement.
