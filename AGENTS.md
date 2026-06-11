# AGENTS.md — WPB New Construction Agent Start Here

> READ THE MAP BEFORE YOU TOUCH THE BULLDOZER.

This file is the first-stop handoff for coding agents. It does **not** replace the full project guide. Before making changes, read:

- `docs/AI_PROJECT_GUIDE.md`
- the root-level `WPB New Construction - Required AI Project Guide` (`AI_PROJECT_GUIDE.md`), which mirrors the `docs/` copy

---

## Required checkout

Website work must happen in:

```
/Volumes/ExternalSSD/WPB_NewConstruction
```

Before editing, run:

```bash
pwd
git remote -v
git branch --show-current
git status --short --branch
```

If the checkout is **not** `/Volumes/ExternalSSD/WPB_NewConstruction`, stop and explain before changing files.

---

## Active repos

| Role | Repo |
|------|------|
| Active website repo | `BrokenFL/WPB_New_Construction` |
| Asset repo | `BrokenFL/WPB_New_Construction_Assets` |

Do **not** use historical repo `BrokenFL/WestPalmNewConstruction` unless Brooke explicitly confirms a repo migration.

---

## Do not edit generated files directly

Do not directly edit:

- `src/data/approvedExternalNews.ts`
- `src/generated/siteData.ts`
- generated asset manifests unless the relevant generator/publisher produced them

**News/update source of truth:** `research/news-review/approved-development-news.json`

**Buyer/downtown notes** currently live in `src/data/marketNotes.ts`. Do not migrate `marketNotes.ts` to a JSON source without Brooke's explicit approval.

---

## Content Studio / Article Manager

Content Studio files:

- `tools/content-studio/server.mjs`
- `tools/content-studio/index.html`
- `tools/content-studio/app.js`
- `tools/content-studio/style.css`

Article publishing engine:

- `research/scripts/article-publish-cli.mjs`
- `research/scripts/article-publish-workflow.mjs`

Rules:

- Do **not** create a second article publishing pipeline.
- Article Manager must reuse the existing article workflow (`article-publish-workflow.mjs`).
- Existing `/api/manual-article` behavior must remain backward-compatible.
- `.runtime/article-drafts/` is local runtime draft storage and must **never** be committed.
- Save Draft must not dirty git.
- Published articles should be archived, not hard-deleted.
- Real-template article preview is separate from diagnostic `preview.html`.

### Article Package Import

Article Manager now supports an Import Package workflow for creating drafts from structured JSON + uploaded images.

**Workflow:**
1. Open Article Manager → Import Package.
2. Paste/upload article JSON.
3. Upload hero/header image and optional inline images.
4. Validate Package → checks JSON shape, image key consistency, placement references, duplicate slug/id detection.
5. Create Draft → saves to `.runtime/article-drafts/` only, then opens in the editor.
6. Continue with Preview in Site, Stage, Commit, and Deploy as normal.

**Safety:**
- Import creates drafts only. Never publishes, commits, pushes, or deploys.
- Draft/import actions must not dirty `content/overrides/change-log.json` or `content/overrides/content-studio-change-log.json`.
- Commit Staged Article Changes must only commit allowlisted article output files.

**Inline image mapping:** uploaded file key (`images[].uploadKey`) → article placement (`images[].placementId`) → section reference (`body.sections[].imagePlacement`). The server maps `placementId` to `bodyImages[].key` and `imagePlacement` to `bodySections[].imageKey` for the existing renderer pipeline.

See `docs/AI_PROJECT_GUIDE.md` section 13 for full JSON shape, example, and troubleshooting.

---

## GitHub auth / local commit warning

The Builder process may show:

```
GitHub auth status: FAILED — unauthenticated / gh CLI not installed
```

A local commit is **not** proof that GitHub `main` was updated.

Before claiming work is on GitHub, verify:

```bash
git rev-parse HEAD
git ls-remote origin main
git log --oneline -5
git status --short
```

If `git push origin main` fails, report the exact auth error. Do not pretend the push succeeded.

---

## Dirty Content Studio log files

Content Studio may modify:

- `content/overrides/change-log.json`
- `content/overrides/content-studio-change-log.json`

These files can make the repo dirty and block article preview/publish.

Before restoring or committing them, inspect:

```bash
git diff -- content/overrides/change-log.json content/overrides/content-studio-change-log.json
```

If they only contain routine operational log entries from Content Studio, **ask Brooke** before restoring or committing.

---

## Before committing

Run:

```bash
git status --short
git diff --stat
```

Classify every changed file as one of:

- intended code change
- intended content change
- generated output
- runtime/report/log file
- unrelated dirty user work

Do **not** stage unrelated dirty files.

---

## Common checks

Use the right subset for the task:

```bash
npm run typecheck
npm run build
npm run qa:content-studio
npm run qa:approved-news
npm run qa:news
npm run qa:image-alt
npm run qa:launch:no-write
```

For asset work, also follow the full asset rules in `docs/AI_PROJECT_GUIDE.md`.

---

## Work style

- Prefer phased implementation.
- Stop and report unexpected dirty files.
- Do not force-push.
- Do not change remotes without Brooke confirmation.
- Do not migrate source-of-truth files without explicit approval.
- At the end of work, report: branch, HEAD, status, files changed, tests run, and push result.
