# Research Refresh Agent Brief

Use this brief when refreshing WPB New Construction project facts from current official pages and recent reporting.

## Mission

Update the buyer-facing fact layer with the newest source-backed details buyers ask for first:

- When will it be ready?
- What will it cost?
- Which projects offer water views?
- How many stories?
- How many residences / condos / hotel keys?
- Which projects are actually under construction?
- Which details conflict across sources?

## Source Order

1. Official project website, brochure, fact sheet, floorplan page, and legal notices.
2. Developer or brand press releases.
3. City planning, PPRC, permit, and public-meeting records.
4. Reputable real estate reporting such as The Real Deal, Florida YIMBY, South Florida Business Journal, World Red Eye, and PR Newswire.
5. Brokerage pages only when official/developer sources do not answer the question, and mark those facts as needing confirmation.

## Required Fields Per Project

- Project name
- Address and any address conflicts
- Corridor: North Flagler, Downtown, South Flagler, or Pipeline
- Status: under construction, sales launched, planning, delivered, resale benchmark
- Stories
- Residences / units / hotel keys
- Completion or delivery timing
- Pricing guidance and date/source of that pricing
- Water-view positioning
- Floorplan availability
- Developer
- Architect
- Interior designer
- Landscape architect
- Sales team or sales gallery if public
- Main amenities and service model
- Current conflicts
- Current gaps
- Source URLs with accessed date

## Search Pattern

For each project, search both the official name and likely development terms:

- `<project name> West Palm Beach official residences pricing stories`
- `<project name> West Palm Beach completion residences floorplans`
- `<project name> West Palm Beach The Real Deal 2026`
- `<project name> West Palm Beach Florida YIMBY 2026`
- `<project name> West Palm Beach construction loan`
- `<project name> West Palm Beach sales launched`
- `<project address> West Palm Beach condo project`

## Publication Rules

- Do not publish live inventory as fact unless the source is current and dated.
- Use "from/about/reported" pricing language unless official current pricing is available.
- If sources conflict, keep the conflict visible in internal notes and use conservative buyer-facing language.
- Do not claim a project is available, sold out, topped out, complete, or delivery-ready without a current source.
- Do not turn reporting into recommendation language. Say "documented," "reported," "source notes show," or "request current confirmation."

## Update Workflow

1. Refresh source facts in `research/source-material-review/project-source-catalog.json`.
2. Update generated Q&A source copy in `research/scripts/build-site-intelligence.mjs`.
3. Run `npm run research:site-intelligence`.
4. Run `npm run build`.
5. Run `npm run qa:launch`.
6. Browser-check `/`, `/answers/`, and at least one project page with changed facts.
