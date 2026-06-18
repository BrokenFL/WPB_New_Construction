# Brooke Builder

Brooke Builder is the local-only site editor for WPB New Construction.

Local URL:

```text
http://127.0.0.1:8787
```

The server binds only to `127.0.0.1`. It is not a public route, is not copied into `dist/`, and should never be deployed as a production page.

## Open It

Double-click:

```text
tools/launchers/Open Brooke Builder.command
```

Terminal fallback:

```bash
cd /Volumes/ExternalSSD/WPB_NewConstruction
npm run brooke:builder
```

Stop the server with `Control-C` in the Terminal window.

## Main Tabs

- **Site Editor:** images, captions, alt text, copy, project updates, team resources, automation status, and build/deploy checks.
- **Project Intelligence:** review queue for compare/source/public-layer conflicts. Click any queue item to see side-by-side source values and approve the correct value as a manual override.
- **Project Facts:** direct field update — pick any building and any field, see what every source says, and save a Brooke-confirmed override when new information arrives.
- **News Desk:** GPT-created article drafts, source links, buyer-facing rewrite fields, publishing queue, review lanes, and newsletter drafts.

## Where Edits Are Saved

Brooke Builder writes structured repo files only:

- `content/overrides/image-caption-overrides.json`
- `content/overrides/project-image-overrides.json`
- `content/overrides/editorial-image-overrides.json`
- `content/overrides/project-copy-overrides.json`
- `content/overrides/page-copy-overrides.json`
- `content/overrides/project-update-overrides.json`
- `content/overrides/team-resource-overrides.json`
- `content/overrides/content-studio-change-log.json`
- `content/overrides/project-fact-overrides.json` (written by Project Intelligence and Project Facts panels)
- `content/news-drafts.json`
- `content/newsletter-digest-drafts.json`

Uploaded images default to `needs_review` unless explicitly marked approved.

## Update Site

The first version has three safe workflow buttons:

- Preview Changes: shows the working tree.
- Run QA: runs typecheck, build, and `qa:launch`.
- Update Site Checks: runs the same blocking checks before any deployment workflow.

The server has a guarded deploy workflow, but final deploy requires explicit confirmation in the request and refuses to proceed when unrelated files are present.

## News Desk Intake

GPT daily GitHub issues should use this title:

```text
Daily WPB News Drafts — YYYY-MM-DD
```

Run:

```bash
npm run news:import-gpt
```

The importer reads open GitHub issues, parses the machine-readable JSON block, deduplicates by source URL, writes `content/news-drafts.json`, comments on imported issues, and adds `codex-imported` when GitHub access is available.

Low-risk drafts can queue automatically after the configured delay. High-risk drafts stay in manual review.
