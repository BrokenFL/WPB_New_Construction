# Brooke Content Studio

Brooke Content Studio is a local-only editorial tool for reviewable site edits.

Run it with:

```bash
npm run content:studio
```

Local URL:

```text
http://localhost:8787
```

The server binds only to `127.0.0.1`. Do not deploy it publicly.

## What It Manages

- Project copy overrides: summary, editorial intro, buyer fit, missing info, project update text, CTA support copy, and fact notes.
- Image uploads: project hero, project card, project gallery, editorial/corridor, Market Notes, update/news, team resource, and buyer intelligence interior.
- Project update rows with date, title, buyer-facing summary, source, and review status.
- Team resources for developer, builder, architect, interior designer, landscape architect, brand partner, sales, and other roles.
- Read-only automation status for known repo scripts and local LaunchAgent presence.

## Files Written

- `content/overrides/project-copy-overrides.json`
- `content/overrides/project-image-overrides.json`
- `content/overrides/market-note-overrides.json`
- `content/overrides/update-overrides.json`
- `content/overrides/team-resource-overrides.json`
- `content/overrides/change-log.json`
- `research/content-editor/site-overrides.json`
- `src/generated/editorOverrides.ts`

Project copy edits are also synced through the existing generated override path so builds can consume safe copy fields without rewriting source TypeScript by hand.

## Image Paths

The studio writes images into repo-controlled public paths:

- `public/projects/{projectId}/media/user-provided-{slug}.jpg`
- `public/projects/{projectId}/media/imported/{slug}.jpg`
- `public/assets/editorial/{slug}.jpg`
- `public/team-resources/{projectId}/{role-slug}-{name-slug}.jpg`

Uploads default to `needs_review`. Use `approved` only when source and rights are confirmed.

## Safety

Run:

```bash
npm run qa:content-studio
```

The safety gate checks localhost binding, validates override JSON, checks uploaded paths, confirms the tool is not copied into `public/` or `dist/`, and scans public source for editor labels.

Always review `git diff`, run the normal build and QA stack, and deploy manually after approving changes.
