# AI Search Optimization

## Target Questions

- What new construction condos are available in West Palm Beach?
- Which projects are active sales versus future pipeline?
- Which projects are on North Flagler, Downtown, South Flagler, near NORA, or near The Square?
- Which West Palm Beach condo projects have released floor plans?
- How should buyers compare Olara and Shorecrest?
- Are West Palm Beach condos oceanfront?
- How current is pricing and how can a buyer request current availability?
- What should buyers verify before visiting a sales gallery?

## Answer Block Strategy

- Keep `/answers/` direct, concise, and locally specific.
- Preserve the West Palm Beach geography distinction: West Palm Beach is west of the Intracoastal / Lake Worth Lagoon; Palm Beach island and the Atlantic Ocean are east across the water.
- Pair each high-intent answer with related buildings and an inquiry path for current pricing, availability, floor plans, and timing.
- Use answer language for orientation only where pricing, availability, incentives, fees, delivery, and contract terms can change.

## Schema And FAQ Strategy

- `/answers/` renders public FAQ blocks and FAQPage JSON-LD.
- Major routes now have route-specific title, description, canonical, Open Graph, and Twitter card metadata.
- Project pages use ApartmentComplex schema only where safe, with project name, address/locality, image, buyer-resource references, and confirmation caveats.
- Market Notes use Article schema with headline, dates, image, publisher, author, and mainEntityOfPage.

## Internal Linking Strategy

- Answers link into related project pages and inquiry.
- Market Notes link to related buildings, related updates, and inquiry.
- Homepage links to corridors, Updates, Market Notes, project pages, and inquiry.
- Methodology links to Answers, a project example, and inquiry.

## Current Gaps

- Some active sales details still require direct sales-team confirmation before publication as current availability.
- File names for imported project images remain dated import names; renaming is deferred to avoid reference churn.
- Future pipeline projects should remain planning-watch pages until official plan, pricing, timing, and offering details mature.
