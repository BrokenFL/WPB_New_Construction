# Gatekeeper Copy Agent Brief

Use this brief for the agent assigned to keep the public site buyer-facing and free of backend, source-workspace, or project-sponsor routing language.

## Assignment

Review the built site and source render paths before each launch. The public visitor should see WPB New Construction as the advisory gateway, not a directory of project sponsor sites, sales offices, source catalogs, or internal research process.

## Public Surface Rules

- Do not publish direct links to project sponsor websites, project sales pages, sales offices, sales galleries, or downloadable sponsor packets.
- Route buyer requests through `/inquire/`, `/floorplans/`, or the relevant project profile.
- Keep source URLs, source names, conflicts, and research metadata in internal files only.
- Replace backend phrases such as `source-catalog`, `answer engine`, `generated`, `official PDF link`, and `external public source` with buyer-facing wording.
- Avoid sales office addresses unless Brooke explicitly approves a use case.
- Keep legal/compliance language neutral: independent buyer advisory, current confirmation required, not an offering document.

## Run

```bash
npm run build
npm run qa:launch
npm run qa:gatekeeper
```

## Handoff

Report:

- Public pages checked.
- Any blocked phrase or outbound project link found.
- Files changed.
- Whether `npm run qa:gatekeeper` passed.
