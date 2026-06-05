# News Update Pipeline

This pipeline turns West Palm Beach development, real estate, and luxury-market news into on-site buyer-facing updates without fabricating building facts or pushing readers toward sponsor pages. Brooke can keep giving guidance through ChatGPT/Codex; the Builder console is not required for the newsroom workflow.

## Inputs

- Primary research file: `research/source-material-review/project-source-catalog.json`
- Existing agent briefs:
  - `research/source-material-review/live-news-agent-brief.md`
  - `research/source-material-review/biweekly-development-blog-agent-brief.md`
- Preferred sources: city records, planning materials, permits, public notices, Markets of Tomorrow/OFTMW, The Real Deal, Florida YIMBY, South Florida Business Journal, Palm Beach Post, Palm Beach Daily News, WFLX, World Red Eye, official project sites, official brochures, and direct project announcements.
- Secondary leads: brokerage posts, SEO pages, social posts, and sponsor announcements. Use these as leads to confirm, not as the whole story.

## Decision Standard

Publish only when the item changes a buyer decision, explains the luxury-market map, or gives useful local context:

- Construction milestone
- Financing or approval milestone
- Sales launch or meaningful pricing signal
- Released floorplans, brochures, or amenity details
- Delivery timing change
- Team or brand change
- Corridor supply pressure or district infrastructure context
- Developer deal, assemblage, land sale, buyout, loan, lawsuit, or ownership dispute
- Planning, zoning, code, public meeting, permit, or city-record movement
- Major restaurant, private club, hotel, wellness, culture, retail, or lifestyle opening that affects a buyer’s view of a corridor
- New luxury-market signal around Palm Beach, downtown West Palm Beach, North Flagler, South Flagler, NORA, El Cid, Flamingo Park, or CityPlace

Skip or hold when the lead is mostly promotional, duplicates existing guidance, lacks a reputable source, or depends on unverified live availability.

## Workflow

1. GPT/automation gathers enough leads to draft two review-ready West Palm Beach updates per day.
2. Drafts arrive through GitHub issues and `npm run news:process-gpt-issues`, or are entered directly into `content/news-drafts.json`.
3. Confirm each factual claim against source material.
4. For every publishable article lead, search for more context before drafting. A good article should usually have the original report plus one or more support sources: official project site, developer release, city/planning record, earlier reporting, or a related market-context article.
5. Add or update source evidence in the research catalog or relevant research note.
6. Draft the article in the voice of the WPB Development Desk:
   - What changed?
   - Why would a serious buyer, seller, developer, investor, or Palm Beach local care?
   - Which corridor, project, or lifestyle pattern does it affect?
   - What should be confirmed before relying on it?
7. Low-risk queued drafts can be promoted by `npm run news:publish-eligible`; medium/high-risk drafts stay reviewable until Codex or Brooke approves the wording.
8. Approved public updates live in `research/news-review/approved-development-news.json` and are promoted into `src/data/approvedExternalNews.ts` with `npm run news:promote`.
9. The public reading path is always on-site:
   `Homepage Updates -> /updates/ archive -> /updates/:slug/ article -> inquiry or newsletter CTA`.
10. Keep archive cards and homepage cards free of direct source links. Source links belong at the bottom of each article page as attribution.
11. Run validation:

```bash
npm run news:refresh
npm run build
npm run qa:launch:no-write
npm run qa:gatekeeper
```

For a deliberate manual audit artifact, run `npm run qa:launch:write-reports` instead. No-write QA writes generated reports to `.runtime/qa/`; tracked reports stay unchanged unless the write-reports command is used.

12. Check the homepage update module, `/updates/`, and at least two `/updates/:slug/` article pages.
13. Record changed stories, skipped leads, source conflicts, route checks, and blockers in the handoff notes.

## Editorial Voice

Articles should feel like WPB New Construction reporting, not a clipping service. The writer posture is:

- Palm Beach/West Palm Beach local news editor with taste.
- Luxury real-estate reporter who understands developers, land, lawsuits, financing, planning, and construction.
- Culture and hospitality scout who can spot restaurants, private clubs, hotels, wellness, retail, and lifestyle openings that change the map.
- Buyer advisor who knows condos, corridors, timing, approvals, lifestyle fit, and tradeoffs.
- SEO-aware without sounding like generic SEO copy.

Good public copy should be concise, polished, newsy, and useful. Lead with what happened. Then explain why it matters, where it fits in the local map, and what still needs direct verification. Avoid stiff phrases like "the useful takeaway," "buyer lane," and "sharpens the comparison" on public cards. It is fine to name sources in the source footer and in factual attribution where needed.

## Daily Morning Review Package

The morning workflow should prepare a review package, not publish automatically.

- Target: two review-ready article drafts per morning.
- Include: headline, homepage card summary, article deck, body sections, source links, confidence/risk note, and suggested route/category.
- Include image direction for each draft:
  - best existing local image candidate from the approved library,
  - suggested generated-image prompt if a new asset would help,
  - source references used for visual direction,
  - rights/provenance note.
- End with a clear approval checklist: publish as-is, revise copy, generate/select image, hold, or discard.
- Do not add drafts to the public feed, commit, push, or deploy without Brooke approval.

## Article Images

Use images only when rights and provenance are clear:

- Prefer the site’s approved local library first.
- Use article imagery only as visual reference for a new generated asset, not as a direct copied asset, unless reuse rights are explicit.
- Generated assets should be labeled internally with the prompt, source references, date, and review status before being promoted.
- Public imagery should match the article’s buyer use: building, corridor, skyline, plan-review, construction, or lifestyle context. Avoid generic stock-like filler.

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

## Review-Only Automation

Manual command:

```bash
npm run news:prepare-review
```

The desired scheduled behavior is a Codex morning review packet. It should scan the named source set, prepare up to two article drafts, suggest image direction, and wait for Brooke approval. It should not call publish, promote, deploy, or live QA.

`news:prepare-review` is local support for that morning workflow. It refreshes candidates, updates the newsletter digest, runs news QA, and writes `.runtime/qa/news-review-queue-report.md`. It is intentionally review-only.

Legacy commands such as `news:daily-publisher`, `news:process-gpt-issues`, and `news:publish-eligible` are manual-only unless Brooke explicitly restores auto-publishing. Publish scripts require explicit Brooke approval fields before a draft can move into the public approved feed.

Scheduled/no-change runs write runtime reports to `.runtime/qa/` and should not rewrite tracked QA Markdown. Manual launch-report refreshes should use `npm run qa:launch:write-reports`. Deploy preflight also uses no-write launch QA; the deploy itself remains gated by build, launch QA, gatekeeper, and live QA.

Disable any old local schedule:

```bash
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.brooke.wpb-news-issue-importer.plist
```

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
