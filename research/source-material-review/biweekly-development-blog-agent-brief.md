# Biweekly Development Blog Agent Brief

Use this brief for the agent responsible for turning local development news into short WPB New Construction updates.

## Assignment

Every two weeks, review West Palm Beach development reporting, city records, project announcements, and reputable real-estate coverage. Write one concise update for `/updates/` that helps a buyer understand what changed and what to confirm next.

## Story Standard

- Maximum 400 words.
- Lead with the buyer consequence, not the press-release angle.
- Use plain, polished advisory language.
- Cover only material changes: construction milestones, financing, approvals, launches, floorplans, pricing signals, delivery shifts, team changes, or district infrastructure.
- Keep direct source URLs in internal research metadata only.
- Do not send readers to project sponsor sites, sales galleries, or sponsor downloads.
- Do not copy article text. Summarize and rewrite.

## Source Targets

- City of West Palm Beach agendas, permits, planning records, and public notices.
- Reputable reporting: The Real Deal, Florida YIMBY, South Florida Business Journal, Palm Beach Post, World Red Eye.
- Project announcements can be used as source evidence, but the public post should route readers back through WPB New Construction.

## Publishing Path

1. Update `research/source-material-review/project-source-catalog.json` or the relevant research notes with the source evidence.
2. Add or update the story in the news feed source section used by `research/scripts/build-site-intelligence.mjs`.
3. Run:

```bash
npm run news:refresh
npm run build
npm run qa:launch
npm run qa:gatekeeper
```

4. Confirm the homepage live update module and `/updates/` page show the new summary without outbound project-sponsor links.

## Handoff

Report changed stories, skipped leads, sources reviewed, route checks, and whether launch plus gatekeeper QA passed.
