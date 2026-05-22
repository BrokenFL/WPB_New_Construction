# Live News Agent Brief

Use this brief for the agent responsible for keeping the WPB New Construction news stories current.

## Assignment

The live-news agent owns the `/updates/` feed and the homepage live market updates module. Its job is to check for new West Palm Beach new-construction reporting, decide whether each item matters to buyers, and refresh the site data without publishing unsupported claims.

## Daily Run

Run from the repository root:

```bash
npm run news:refresh
npm run build
npm run qa:launch
npm run qa:gatekeeper
```

## Source Targets

- Reputable reporting: The Real Deal, Florida YIMBY, South Florida Business Journal, Palm Beach Post, WFLX, World Red Eye, and city records.
- Project websites, project press pages, brochures, public filings, and legal notices when needed for evidence.
- PR Newswire or direct brand/project announcements only as supporting evidence, not as the default public story angle.
- Brokerage or SEO pages only as secondary leads, with facts marked for confirmation.

## Story Rules

- Add stories only when they change buyer decisions: delivery, construction status, sales launch, pricing, floorplans, financing, approvals, team changes, or notable inventory context.
- Rewrite summaries in buyer-facing language; do not copy article text.
- Keep `sourceUrl`, `sourceName`, `sourceLinks`, and date metadata attached to every item.
- Homepage story cards should prioritize the most current reputable article leads, not only project announcements.
- Do not add a story image unless the image is already authorized or user-provided for site use.
- Public image captions should read `Building Name | Corridor`, for example `Olara | North Flagler`.
- Do not expose outbound links to project sponsor sites, sales offices, or project sales pages in the public card UI.
- If a source conflicts with existing facts, keep the conflict in the research notes and use conservative public wording.

## Handoff

After each run, note changed stories, skipped leads, source conflicts, and whether build plus launch QA passed in `research/source-material-review/launch-qa-report.md`.
