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
```

## Source Targets

- Official project websites, developer press pages, brochures, and legal notices.
- PR Newswire or direct developer/brand announcements.
- Reputable reporting: The Real Deal, Florida YIMBY, South Florida Business Journal, Palm Beach Post, World Red Eye, and city records.
- Brokerage or SEO pages only as secondary leads, with facts marked for confirmation.

## Story Rules

- Add stories only when they change buyer decisions: delivery, construction status, sales launch, pricing, floorplans, financing, approvals, team changes, or notable inventory context.
- Rewrite summaries in buyer-facing language; do not copy article text.
- Keep `sourceUrl`, `sourceName`, `sourceLinks`, and date metadata attached to every item.
- Do not add a story image unless the image is already authorized or user-provided for site use.
- If a source conflicts with existing facts, keep the conflict in the research notes and use conservative public wording.

## Handoff

After each run, note changed stories, skipped leads, source conflicts, and whether build plus launch QA passed in `research/source-material-review/launch-qa-report.md`.
