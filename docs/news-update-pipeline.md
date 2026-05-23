# News Update Pipeline

This pipeline turns West Palm Beach development news into on-site buyer-facing updates without fabricating building facts or pushing readers toward sponsor pages. Brooke can keep giving guidance through ChatGPT/Codex; the Builder console is not required for the newsroom workflow.

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

1. GPT/automation gathers 2-3 relevant West Palm Beach new-construction or development leads per day.
2. Drafts arrive through GitHub issues and `npm run news:import-gpt`, or are entered directly into `content/news-drafts.json`.
3. Confirm each factual claim against source material.
4. Add or update source evidence in the research catalog or relevant research note.
5. Draft the buyer angle:
   - What changed?
   - Which buyer comparison does it affect?
   - What should be confirmed before relying on it?
6. Low-risk queued drafts can be promoted by `npm run news:publish-queued`; medium/high-risk drafts stay reviewable until Codex or Brooke approves the wording.
7. Approved public updates live in `research/news-review/approved-development-news.json` and are promoted into `src/data/approvedExternalNews.ts` with `npm run news:promote`.
8. The public reading path is always on-site:
   `Homepage Updates -> /updates/ archive -> /updates/:slug/ article -> inquiry or newsletter CTA`.
9. Keep archive cards and homepage cards free of direct source links. Original source links belong at the bottom of each article page as attribution.
10. Run validation:

```bash
npm run news:refresh
npm run build
npm run qa:launch
npm run qa:gatekeeper
```

11. Check the homepage update module, `/updates/`, and at least two `/updates/:slug/` article pages.
12. Record changed stories, skipped leads, source conflicts, route checks, and blockers in the handoff notes.

## Record Shape

Use the same fields consistently for future editorial notes and feed entries:

- `id`: stable lowercase slug.
- `status`: `draft`, `ready-for-review`, `published`, or `needs-refresh`.
- `category`: corridor or editorial bucket.
- `title`: buyer-facing headline.
- `summary`: short factual summary.
- `deck`: article intro shown on the article page.
- `bodySections`: article body sections for what happened, where it fits, and what to verify.
- `buyerAngle`: interpretation limited to what the evidence supports.
- `whyItMatters`: buyer-useful interpretation.
- `brookeTake`: advisory guidance in Brooke's voice.
- `buyerContext`: comparison context for buyers.
- `projectIds`: related internal project ids.
- `relatedCorridorIds`: related corridor ids.
- `newsletterHeadline`, `newsletterBlurb`, `newsletterCta`: fields used by `npm run newsletter:draft`.
- `sourceLinks`: source label, URL, and source type.
- `factCheckRequired`: details that must be refreshed before publication.
- `seo`: primary query, secondary queries, suggested slug, title tag, and meta description.

## Newsletter Readiness

`npm run newsletter:draft` reads both:

- published public updates from `research/news-review/approved-development-news.json`
- published or queued intake drafts from `content/news-drafts.json`

Digest blurbs should be short, advisory, and useful without copying source language. Each blurb should include a related project or corridor when available, a simple CTA, and the original source in `sourceLinks`.

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
