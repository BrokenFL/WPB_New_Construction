# WPB New Construction Expert Audit Round Brief

Prepared for the next critic, publisher, and UI designer review round.

## Verified Build State

- Site intelligence regenerated successfully.
- Production build completed successfully.
- Static prerender completed with 17 routes.
- Launch QA completed with 37 checks and 0 findings.
- Floorplan library currently indexes 255 records across 14 projects.
- Preferred image exports currently index 93 assets across 24 project folders.
- News feed currently has 3 structured items.

## Current Site Strengths

- Project pages exist as static routes and are ready for crawler inspection.
- Floorplans are now tied to their project pages through generated data.
- Image authorization status is explicit instead of hidden in file naming.
- Lead capture exists as a standalone intake surface with a local queue/fallback pattern.
- Core answer-engine files exist, including `llms.txt`, `robots.txt`, `sitemap.xml`, RSS, JSON feed, structured FAQ data, and site metadata.
- Brokerage/compliance identity is present for Brooke Matthew Snader, The Scott Gordon Group, Douglas Elliman Real Estate Palm Beach.

## Known Review Priorities

1. Critic Review
   - Check whether the homepage map and project discovery flow feel authoritative enough for a luxury real estate buyer.
   - Identify any sections that still read like scaffolding or internal research notes.
   - Challenge whether every project page answers the questions a serious buyer would ask before contacting Brooke.

2. Publisher Review
   - Confirm legal and brokerage language is present but not overpowering.
   - Verify image captions and authorization status are clear.
   - Flag pages where source attribution, update dates, or project claims need stronger evidence.
   - Review answer-engine readiness: Q&A blocks, fresh dates, canonical pages, and source-forward structure.

3. UI Designer Review
   - Review hierarchy, spacing, mobile density, and scannability.
   - Check that cards, tabs, filters, floorplan sections, and map interactions feel coherent.
   - Identify visual sections that need richer imagery, better contrast, or a more premium waterfront feel.
   - Confirm CTAs are clear without making the site feel sales-heavy.

## Asset Authorization State

Authorized for project image usage:

- Olara
- Ritz-Carlton Residences West Palm Beach
- Mandarin Oriental Residences West Palm Beach
- Mr. C Residences West Palm Beach
- Alba Palm Beach

All other project imagery should remain marked as pending authorization unless new approval evidence is added.

## Open Professionalization Needs

- Final CRM or spreadsheet destination for lead intake.
- Broker/compliance review of all public-facing claims and disclosures.
- Final authorization evidence folder for each approved project image set.
- Human review of every downloaded floorplan for completeness and naming clarity.
- Fresh project news/source cadence with a defined owner.
- Figma design QA once Figma connector authentication is working.
- Buyer packet templates for project inquiries, waterfront comparisons, and floorplan shortlists.

## Local Evidence Files

- `research/source-material-review/launch-qa-report.md`
- `research/source-material-review/source-material-summary.md`
- `research/source-material-review/floorplan-library.md`
- `research/source-material-review/image-caption-catalog.json`
- `research/source-material-review/image-sizing-report.md`
- `research/source-material-review/launch-issue-register.md`
- `research/source-material-review/drive-command-center.md`
- `research/source-material-review/buyer-packet-system.md`
- `public/data/project-asset-status.json`
- `public/data/floorplans.json`
- `public/data/site-meta.json`
