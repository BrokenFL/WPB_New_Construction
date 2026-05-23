# Copy Intelligence Implementation Plan

## Objective

Create a structured research layer that Codex can use to upgrade the public project pages, SEO summaries, buyer Q&A, and comparison language for each West Palm Beach new-construction building.

## Phase 1 — Build Research Briefs

Create one brief per project or marketing identity:

1. `olara.md`
2. `shorecrest.md`
3. `ritz-carlton-wpb.md`
4. `south-flagler-house.md`
5. `mr-c.md`
6. `berkeley.md`
7. `mandarin-oriental.md`
8. `edgeworth.md`
9. `alba-palm-beach.md`
10. `banyan-tree.md`
11. `nora-house.md`
12. `apogee-wpb.md`
13. `10-cityplace.md`
14. `15-cityplace.md`

Twin-tower projects with one buyer-facing identity should usually get one combined copy brief unless the public site needs separate tower pages.

## Phase 2 — Build Reusable People/Firm Notes

Create or expand reusable files for repeated teams:

- Related Group
- Related Ross
- BH Group
- Terra
- Ronto Group
- Great Gulf
- Arquitectonica
- Robert A.M. Stern Architects
- MAWD
- Rockwell Group
- Meyer Davis
- Mandarin Oriental
- Mr. C / Cipriani family brand context

Each file should include:

- Who they are
- Relevant prior work
- Why they matter for buyer confidence
- Copy-safe phrasing
- Which WPB projects they touch
- Source URLs

## Phase 3 — Convert Briefs Into Site Updates

Codex should locate the current data source for project pages before editing. Likely targets include:

- Generated data inputs used by `npm run research:site-intelligence`
- `research/content-editor/site-overrides.json`
- Project data files feeding `src/generated/siteData.ts`
- SEO metadata sources
- Buyer Q&A / FAQ source files

Do not directly edit generated files unless the repo intentionally treats them as committed build artifacts. Prefer updating source inputs, then regenerate.

## Phase 4 — Page Copy Structure

Recommended project-page structure:

1. Hero intro: 2-4 sentence building overview
2. Quick facts: address, status, residences, floors, delivery/status confidence
3. Why it matters: market positioning and corridor context
4. Design story: architecture/interiors/landscape/hospitality
5. Amenity logic: lifestyle buckets, not raw list dumping
6. Buyer lens: who it fits, comparison notes, tradeoffs
7. Sources: official and reputable third-party references

## Phase 5 — QA

After implementation:

```bash
npm run research:site-intelligence
npm run build
npm run qa:customer-copy
npm run qa:project-pages
npm run qa:seo
```

If publishing is approved:

```bash
npm run ship:live
```

## Priority Order

Start with the highest-value condo pages:

1. Olara
2. Shorecrest
3. Ritz-Carlton Residences West Palm Beach
4. South Flagler House
5. Mr. C Hotel & Residences
6. The Berkeley Palm Beach
7. Edgeworth
8. Mandarin Oriental Residences
9. Alba Palm Beach
10. Banyan Tree Residences
11. Nora House
12. Apogee
13. 10 CityPlace
14. 15 CityPlace

## Notes for Codex

- Keep sourced facts separate from editorial inference.
- Preserve source URLs inside brief files even if not all are surfaced publicly.
- Avoid exaggerating availability, pricing, or delivery timing.
- Use Brooke's site voice: polished, concise, informed, buyer-useful, and not generic brochure fluff.
