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
6. Continue with Preview in Site, then click **Publish Live** to publish, commit, push, and trigger deploy in one step.

**Safety:**
- Import creates drafts only. Never publishes, commits, pushes, or deploys.
- Draft/import actions must not dirty `content/overrides/change-log.json` or `content/overrides/content-studio-change-log.json`.
- Commit Staged Article Changes must only commit allowlisted article output files.

**Inline image mapping:** uploaded file key (`images[].uploadKey`) → article placement (`images[].placementId`) → section reference (`body.sections[].imagePlacement`). The server maps `placementId` to `bodyImages[].key` and `imagePlacement` to `bodySections[].imageKey` for the existing renderer pipeline.

**Package fields:** Downloadable templates now mirror the manual Article Manager form. Supported top-level fields include `destination`, `category`, `title`, `slug`, `deck`, `description`, `summary`, `eventDate`, `freshnessLane`, `sourceName`, `sourceUrl`, `sourcePublishedDate`, `whyItMatters`, `buyerContext`, `commitMessage`, `relatedProjects`, `relatedCorridors`, `relatedNeighborhoods`, `relatedBuildings`, `heroImage`, `images`, `body`, `sources`, `newsletterHeadline`, `query`, and all flat buyer intelligence fields (`buyerTakeaway`, `marketSignal`, `bestFor`, `watchPoints`, `buyerQuestions`, `relatedCorridor`).

**Nested buyerIntelligence:** The `buyerIntelligence` grouped object is accepted as a convenience. Import normalizes nested values into the same flat fields used by the pipeline (`buyerTakeaway`, `marketSignal`, etc.). Flat fields take precedence over nested values.

**Source fields:** `sourceName`, `sourceUrl`, and `sourcePublishedDate` are supported directly at the top level. If missing, the importer falls back to `sources[0]`. The `sources[]` array remains supported for multiple sources.

**Destination values:** Internal values are `news` (News Updates), `buyer` (Buyer Intelligence), `downtown` (Downtown Spotlight). `devwatch` / `development-watch` and `buyer-intelligence` are accepted aliases for preview but normalize to `news` or `buyer` for publishing.

See `docs/AI_PROJECT_GUIDE.md` section 13 for full JSON shape, example, and troubleshooting.

### Buyer Intelligence v1

Buyer Intelligence uses the same Article Manager workflow and publishing pipeline as news updates. Optional buyer-oriented fields (`buyerTakeaway`, `marketSignal`, `bestFor`, `watchPoints`, `relatedBuildings`, `relatedNeighborhoods`, `relatedCorridor`, `buyerQuestions`) are preserved in drafts and published articles. The Buyer Intelligence box renders on the article page only when at least one of these fields exists. Normal news articles remain unchanged.

**Preview in Site** supports all Article Manager template destinations (`news`, `updates`, `downtown-spotlight`, `development-watch`, `buyer-intelligence`). All destinations currently render through the same Updates/article renderer; true route previews are aliased for now.

**Live route rendering** uses `renderUpdateArticle` for `/updates/` and `renderMarketNoteArticle` for `/market-notes/` and `/downtown-spotlight/`. Both renderers now share `renderBuyerIntelligenceBox`, which shows the same meaningful buyer fields (`buyerTakeaway`, `marketSignal`, `bestFor`, `watchPoints`, `buyerQuestions`, `relatedBuildings`, `relatedNeighborhoods`, `relatedCorridor`) when present. In Market Note articles, `buyerTakeaway` continues to render in its existing location to avoid duplication.

**Templates** include a `siteContext.relationshipGuidance` object that explains corridor definitions, project tagging rules, and buyer-context writing guidance.

### Publish Live (One-Click Deploy)

**Publish Live** is the preferred one-click flow for ready articles:

1. Review the article in **Preview in Site**.
2. Check the confirmation boxes (Publish, Deploy).
3. Click **Publish Live**.

The system will:
- Run the article publish workflow (`article-publish-workflow.mjs`).
- Commit only allowlisted article output files.
- Push to `origin main`.
- Trigger the GitHub Actions Cloudflare Pages deploy workflow (`deploy-cloudflare-pages.yml`).
- Return the commit hash, GitHub Actions run URL, deploy status, and live article URL.

This should remove the need for manual terminal deploy commands after publishing.

**Safer/debug workflow still exists:**
- **Stage Files Locally** — writes generated files for review without committing.
- **Commit Staged Article Changes** — commits and pushes allowlisted files only.
- **Publish From Clean State** — commits and pushes without triggering deploy.

**Safety rules:**
- Publish Live requires both the Publish and Deploy confirmation boxes to be checked.
- Publish Live must not run if unrelated files are dirty.
- Publish Live must not commit unrelated files (allowlist enforced).
- Publish Live must not deploy if publish or push fails.
- Draft/import/preview actions must never publish, commit, push, deploy, or dirty tracked changelogs.
- Draft-only actions should write only to `.runtime/`.

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
