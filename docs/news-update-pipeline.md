# News Update Pipeline

This pipeline turns West Palm Beach development news into buyer-facing updates without fabricating building facts or pushing readers toward sponsor pages.

## Inputs

- Primary research file: `research/source-material-review/project-source-catalog.json`
- Existing agent briefs:
  - `research/source-material-review/live-news-agent-brief.md`
  - `research/source-material-review/biweekly-development-blog-agent-brief.md`
- Preferred sources: city records, planning materials, permits, public notices, The Real Deal, Florida YIMBY, South Florida Business Journal, Palm Beach Post, WFLX, World Red Eye, official project sites, official brochures, and direct project announcements.
- Secondary leads: brokerage posts, SEO pages, social posts, and sponsor announcements. Use these as leads to confirm, not as the whole story.

## Decision Standard

Publish only when the item changes a buyer decision:

- Construction milestone
- Financing or approval milestone
- Sales launch or meaningful pricing signal
- Released floorplans, brochures, or amenity details
- Delivery timing change
- Team or brand change
- Corridor supply pressure or district infrastructure context

Skip or hold when the lead is mostly promotional, duplicates existing guidance, lacks a reputable source, or depends on unverified live availability.

## Workflow

1. Collect candidate leads.
2. Confirm each factual claim against source material.
3. Add or update source evidence in the research catalog or relevant research note.
4. Draft the buyer angle:
   - What changed?
   - Which buyer comparison does it affect?
   - What should be confirmed before relying on it?
5. Add or update the story in the news feed source layer used by `research/scripts/build-site-intelligence.mjs`.
6. Keep public cards free of direct sponsor CTAs and unsupported urgency.
7. Run validation:

```bash
npm run news:refresh
npm run build
npm run qa:launch
npm run qa:gatekeeper
```

8. Check the homepage update module and `/updates/` page.
9. Record changed stories, skipped leads, source conflicts, route checks, and blockers in the handoff notes.

## Record Shape

Use the same fields consistently for future editorial notes and feed entries:

- `id`: stable lowercase slug.
- `status`: `draft`, `ready-for-review`, `published`, or `needs-refresh`.
- `category`: corridor or editorial bucket.
- `title`: buyer-facing headline.
- `summary`: short factual summary.
- `buyerAngle`: interpretation limited to what the evidence supports.
- `projectIds`: related internal project ids.
- `sourceLinks`: source label, URL, and source type.
- `factCheckRequired`: details that must be refreshed before publication.
- `seo`: primary query, secondary queries, suggested slug, title tag, and meta description.

Imported update candidates live in `src/data/importedUpdates.json` and are intentionally review-first. Use this shape:

```json
{
  "id": "stable-slug",
  "title": "Buyer-facing headline",
  "summary": "Short factual summary",
  "date": "2026-05-22",
  "lastCheckedAt": "2026-05-22",
  "sourceName": "Source name",
  "sourceUrl": "https://news-source.invalid/source",
  "sourceType": "developer | news | city | county | brokerage | permit | other",
  "category": "sales | construction | planning | financing | delivery | media | general",
  "relatedBuildingSlug": "optional-building-slug",
  "confidence": "high | medium | low",
  "status": "needs_review | published | archived"
}
```

Run:

```bash
npm run check:updates
```

Rules:

- Imported records default to `needs_review`.
- Do not auto-publish imported records.
- Published records require `sourceUrl`, `lastCheckedAt`, and non-low confidence.
- If a public update is older than 90 days, label it as `Older public update`.
- Never imply older information is current.

## Handoff Template

```markdown
## News Handoff

- Changed stories:
- Skipped leads:
- Source conflicts:
- Sources reviewed:
- Routes checked:
- Validation:
- Blockers:
```

## Guardrails

- Do not invent residence counts, pricing, delivery dates, inventory, views, amenities, or construction status.
- Do not smooth over source conflicts. Keep public wording conservative and internal notes explicit.
- Do not reuse source copy beyond short factual references.
- Do not add images unless usage rights are clear.
- Do not touch the live app entrypoint for editorial-only work unless the integration is scoped and conflict-free.
