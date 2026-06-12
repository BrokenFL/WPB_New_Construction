# WPB New Construction - Required AI Project Guide

REQUIRED READING FOR CODEX / ANTIGRAVITY / GEMINI / CLAUDE / FUTURE AI AGENTS: Read this file before making changes. Do not rely on older assumptions, stale repo names, or historical OpenClaw paths unless current files prove they are still active.

This guide documents the current operational architecture for WPB New Construction. It exists to prevent future agents from guessing paths, reviving stale repo names, mixing unrelated work, or publishing assets from the wrong layer.

For editorial showcase project-page conversions, also read:

```text
docs/editorial-showcase-production-playbook.md
```

That guide is required before duplicating or refining the Berkeley-style project-page template. It documents the shared schema, image-sequencing rules, gallery curation standards, floor-plan thumbnail treatment, two-pass visual review, mobile QA, clean staging, and live verification workflow.

## 1. Current Source Of Truth

- Active website repo: `BrokenFL/WPB_New_Construction`
- Primary local website path: `/Volumes/ExternalSSD/WPB_NewConstruction`
- Secondary/historical CloudDocs checkout: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB-New-Construction-Current`
- Asset repo: `BrokenFL/WPB_New_Construction_Assets`
- Local asset repo: `/Volumes/ExternalSSD/WPB_NewConstruction_Assets`
- iCloud asset intake library: `/Users/brookesnader/Library/Mobile Documents/com~apple~CloudDocs/WPB New Construction Asset Library`
- Historical/stale repo name: `BrokenFL/WestPalmNewConstruction`

As of 2026-06-03, use `/Volumes/ExternalSSD/WPB_NewConstruction` as the primary local website working checkout. Treat the CloudDocs checkout as secondary/historical unless Brooke explicitly asks you to inspect or recover from it. On 2026-06-03 the CloudDocs checkout was behind `origin/main` and dirty, so do not use it for normal implementation, QA, push, or deploy work without first proving it is intended and clean.

Treat `BrokenFL/WPB_New_Construction` as the active operational website repo unless Brooke explicitly says a repo migration happened. Treat `BrokenFL/WestPalmNewConstruction` as historical, stale, or research metadata only unless current repo files and Brooke both confirm otherwise.

The website repo is the live site code and deployment repo. The asset repo is the approved source warehouse. The iCloud asset library is a local intake/drop zone and is not a Git repo.

Before editing, confirm the local checkout with `pwd`, `git remote -v`, `git branch --show-current`, and `git status --short --branch`. If the path is not `/Volumes/ExternalSSD/WPB_NewConstruction`, stop and explain why you are in another checkout before changing files.

## 2. Three-Layer Asset Architecture

The asset system has three distinct layers:

```text
iCloud Asset Library
-> Asset Repo approved warehouse
-> Website public/assets/projects
-> data/project_assets.json
-> deployed site
```

- iCloud Asset Library: messy intake/drop zone for new materials and review folders.
- Asset repo: approved warehouse/source asset repository for files that have passed the website approval gate.
- Website repo: optimized deployed public assets, generated asset registry, website code, QA, and deployment workflow.

The website repo must never directly reference iCloud paths or asset repo absolute paths. Website-facing asset references must use `/assets/...` public paths only.

## 3. Never Do These Things

- Never publish directly from iCloud to the website repo.
- Never reference `/Users/...` paths in website data.
- Never reference `/Volumes/...` paths in website data.
- Never reference asset repo absolute paths in website data.
- Never reference source asset library paths in website data.
- Never assume `data/buildings_master.json` exists.
- Never assume `data/master_asset_index.csv` exists.
- Never assume old OpenClaw sync scripts exist.
- Never recreate old OpenClaw assumptions unless current files prove they are active.
- Never use `BrokenFL/WestPalmNewConstruction` as the active repo without Brooke confirmation.
- Never mix asset automation commits with curated content edits.
- Never mix visual/content changes with asset pipeline changes unless the user explicitly asks.
- Never force-push.
- Never change remotes without Brooke confirmation.
- Never push website changes before asset repo changes if the website depends on new asset repo state.
- Never delete or overwrite existing public website assets blindly.
- Never modify curated project copy when the task is asset automation or registry refresh only.

## 4. Asset Intake Rules

Approved iCloud folders may use flexible names. Recognize these case-insensitively:

- `approved-for-website`
- `approved_for_website`
- `Approved For Website`
- `approved website`
- `website-approved`
- `approved-web`
- `Website Approved`
- `For Website`

Only files inside approved folders are eligible for intake. Originals stay in the iCloud library and approved source-quality copies go to the asset repo warehouse.

Current asset intake script:

```bash
cd "/Volumes/ExternalSSD/WPB_NewConstruction_Assets"
node scripts/sync-icloud-approved-assets.mjs --dry-run
node scripts/sync-icloud-approved-assets.mjs --write
```

Current asset repo manifest:

```text
/Volumes/ExternalSSD/WPB_NewConstruction_Assets/asset-manifest.json
```

Asset repo warehouse destination convention:

```text
public-projects/{project-slug}/approved-for-website/images
public-projects/{project-slug}/approved-for-website/logos
public-projects/{project-slug}/approved-for-website/floorplans
public-projects/{project-slug}/approved-for-website/site-plans
public-projects/{project-slug}/approved-for-website/docs
public-projects/{project-slug}/approved-for-website/misc
```

Use lowercase dash/kebab-case stored filenames. Do not use underscores in final warehouse or public website filenames.

## 5. Website Publishing Rules

Current website publisher script:

```bash
cd "/Volumes/ExternalSSD/WPB_NewConstruction"
npm run assets:publish:dry
npm run assets:publish
```

Publisher implementation:

```text
scripts/publish-assets-from-asset-repo.mjs
```

Publisher source:

```text
/Volumes/ExternalSSD/WPB_NewConstruction_Assets/public-projects/{project-slug}/approved-for-website
```

Publisher destination:

```text
public/assets/projects/{project-slug}/{category}/...
```

Website repo gets optimized website-ready copies only. It should not receive raw source files or unapproved originals.

Publishing expectations:

- WebP is preferred for renderings and photographic gallery images.
- PNG is preserved when transparency, logos, or cutouts make PNG safer.
- SVG is acceptable for clean logos/icons.
- PDFs are preserved for floorplans when the site supports floorplan links/documents.
- Raw/source/design formats do not belong in `public/assets/projects`.
- Existing website assets should not be deleted or overwritten blindly.

## 6. Website Registry Rules

Current registry refresh script:

```bash
npm run assets:refresh:dry
npm run assets:refresh
```

Registry implementation:

```text
scripts/refresh-website-asset-references.mjs
```

Website asset registry:

```text
data/project_assets.json
```

Generated publish manifest:

```text
data/generated_asset_publish_manifest.json
```

Website asset references must begin with `/assets/`, for example:

```text
/assets/projects/{project-slug}/{category}/{filename}
```

Do not place `/Users/...`, `/Volumes/...`, iCloud paths, or asset repo paths in website data.

Alba Palm Beach and Berkeley are currently wired through the approved registry. The gallery consumer can use approved registry assets for non-Alba projects. If approved registry assets exist for a project, old imported/draft gallery fallbacks should not create broken visible gallery images.

## 7. Audit And QA Rules

Current audit script:

```bash
npm run assets:audit
```

Audit implementation:

```text
scripts/audit-asset-pipeline.mjs
```

Before asset work and before website pushes, run:

```bash
npm run assets:audit
npm run typecheck
npm run build
npm test
```

Rules:

- Broken `/assets` references must be `0`.
- Local path leaks in live/rendered output are blockers.
- Website data must not expose iCloud or asset repo absolute paths.
- Audit findings may include legacy research-script warnings. Those are not automatically live blockers unless they affect website output or generated public data.
- If the working tree has unrelated dirty files, stop and classify them before proceeding.

## 8. Deployment Rules

Deploy workflow:

```text
Deploy Cloudflare Pages
```

Workflow file:

```text
.github/workflows/deploy-cloudflare-pages.yml
```

Deploy script:

```text
research/scripts/deploy-cloudflare-pages-with-retry.mjs
```

Cloudflare Pages project:

```text
wpbnewconstruction
```

Production domains:

```text
wpbnewconstruction.com
www.wpbnewconstruction.com
```

The current deploy path is working. A misleading fallback label can appear in the GitHub Actions step view. Check the full logs before deciding that Cloudflare is not configured. The real deploy step should show the Pages project, masked credentials, upload count, deployment URL, and before/after live bundle evidence.

Latest confirmed Pages deployment:

```text
https://e901a7a0.wpbnewconstruction.pages.dev
```

Latest confirmed production bundle:

```text
/assets/index-CMPjqao9.js
```

Required GitHub secrets by name:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_GOOGLE_MAPS_API_KEY`

Optional repository variable:

- `VITE_GOOGLE_MAPS_MAP_ID`

Do not print secret values. Secret names and masked values are safe to report.

## 9. Current Scripts Cheat Sheet

Website repo commands:

```bash
npm run monitor:worktree
npm run research:canonical-projects
npm run assets:audit
npm run assets:publish:dry
npm run assets:publish
npm run assets:refresh:dry
npm run assets:refresh
npm run research:site-intelligence:dry-run
npm run typecheck
npm run build
npm test
```

## 9A. Canonical Project Schema Guardrail

The tracked canonical planning snapshot is:

```text
research/source-material-review/wpb-projects-canonical-v3-planning-update.json
```

It preserves public project records, pipeline/watchlist records, completed comps, and internal hold/exclusion records so routine source refreshes do not silently drop projects.

Validate it with:

```bash
npm run research:canonical-projects
```

Importing a new reviewed snapshot is deliberate, never scheduled:

```bash
npm run research:canonical-projects:import -- --source "/path/to/reviewed-canonical.json"
```

Do not point normal automation at the CloudDocs website checkout. External/iCloud files are recovery or reviewed intake material only.

Asset repo direct commands:

```bash
cd "/Volumes/ExternalSSD/WPB_NewConstruction_Assets"
node scripts/sync-icloud-approved-assets.mjs --dry-run
node scripts/sync-icloud-approved-assets.mjs --write
```

Safe manual deploy trigger after pushing `main`:

```bash
gh workflow run deploy-cloudflare-pages.yml --ref main
```

## 10. Commit And Push Order

- Commit and push asset repo changes before dependent website changes.
- Push the website repo only after the asset repo state it depends on is available.
- Always verify the SSD website repo and the asset repo working trees before starting and before pushing.
- If the website repo is dirty, classify each path as user work, generated output, report-only output, or your intended edit before running scripts that rewrite files.
- Do not stage, revert, overwrite, or clean dirty paths you did not create unless Brooke explicitly asks.
- If a deploy is needed while the primary checkout is dirty with unrelated work, deploy from committed `main` or a fresh clean worktree, not from the dirty local state.
- Never force-push.
- Never rewrite history unless Brooke explicitly instructs it and understands the impact.
- Run full website verification before website push:

```bash
npm run assets:audit
npm run typecheck
npm run build
npm test
```

Suggested separation:

- Asset repo intake commit: intake script, asset manifest, intake reports, approved warehouse files.
- Website audit commit: audit script and audit reports.
- Website publisher commit: publisher script, optimized public assets, publish manifest, publish reports.
- Website registry commit: registry refresh script, `data/project_assets.json`, site registry consumption changes, refresh reports.
- Deployment/report-only commits should stay separate from behavior or asset changes.

## 11. Recent Known Good State

Asset repo pushed clean with:

```text
d4adf95 Sync approved website assets into asset repository
```

Website pushed clean through:

```text
4ace950 Merge remote-tracking branch 'origin/main'
```

Recent website asset pipeline commits:

```text
546ecfc Add asset pipeline audit
c900a4c Publish approved assets from asset repository
fd18092 Refresh project asset registry from published assets
4ace950 Merge remote-tracking branch 'origin/main'
```

Recent asset repo intake commit:

```text
d4adf95 Sync approved website assets into asset repository
```

Known good checks:

- CI passed.
- Cloudflare Pages deploy succeeded.
- Production smoke checks passed for homepage, Alba Palm Beach, and Berkeley.
- Broken `/assets` references: `0`.
- No local `/Users` or `/Volumes` paths appeared in rendered route HTML for the smoke-checked pages.
- Production `www.wpbnewconstruction.com` served bundle `/assets/index-CMPjqao9.js`.

## 12. Handoff Instruction For Future AI

Before making changes:

1. Read this guide.
2. Confirm you are in `/Volumes/ExternalSSD/WPB_NewConstruction` for website work.
3. Confirm active website repo is BrokenFL/WPB_New_Construction.
4. Confirm asset repo is BrokenFL/WPB_New_Construction_Assets.
5. Run git status in the SSD website repo and the asset repo.
6. Classify any dirty paths before running generators, QA that writes reports, staging, pushing, or deploying.
7. Run npm run assets:audit before asset work.
8. Ask Brooke before changing repo remotes or deployment workflow.

If current files contradict this guide, inspect carefully and report the contradiction before changing behavior.

---

## 13. Content Studio / Article Manager Addendum

Article Manager lives inside `tools/content-studio/`. The UI is served by `tools/content-studio/server.mjs`; app files are `tools/content-studio/app.js`, `tools/content-studio/index.html`, and `tools/content-studio/style.css`.

**Publishing must reuse `research/scripts/article-publish-workflow.mjs`.** Do not create a second publishing pipeline. The existing `/api/manual-article` behavior must remain backward-compatible.

**`.runtime/article-drafts/` must never be committed.** Save Draft must not dirty git. Published articles should be archived, not hard-deleted.

**`diagnostic preview.html` is not real-template preview.** Real-template article preview is a separate feature from the static diagnostic file.

**Content Studio changelog files may dirty the repo.** Content Studio may write to:

- `content/overrides/change-log.json`
- `content/overrides/content-studio-change-log.json`

Inspect them with:

```bash
git diff -- content/overrides/change-log.json content/overrides/content-studio-change-log.json
```

If they contain only routine operational log entries, ask Brooke before restoring or committing.

**Builder GitHub auth may fail.** The Builder process may show `GitHub auth status: FAILED`. A local commit is not proof that `origin/main` was updated. Before claiming work is on GitHub, verify:

```bash
git rev-parse HEAD
git ls-remote origin main
git log --oneline -5
git status --short
```

If `git push origin main` fails, report the exact auth error. Do not pretend the push succeeded.

---

### Article Manager Workflows

#### Standard manual article workflow

1. Open Article Manager → New Article (or Edit an existing draft).
2. Fill article fields (title, slug, deck, sections, hero image).
3. Save Draft — writes only to `.runtime/article-drafts/`.
4. Preview in Site — renders the real article page locally.
5. **Publish Live** — publishes, commits allowlisted files, pushes, and triggers Cloudflare deploy in one step.

#### Safer / debug workflow (still available)

- **Stage Files Locally** — writes generated files for review without committing.
- **Commit Staged Article Changes** — commits and pushes allowlisted article output files.
- **Publish From Clean State** — commits and pushes without triggering deploy.
- Use these when you need to inspect diffs or debug before deploying.

#### Article Package Import workflow

1. Open Article Manager → Import Package.
2. Paste article JSON into the textarea, or choose a JSON file.
3. Upload the hero/header image.
4. Upload optional inline body images.
5. Click Validate Package — checks JSON shape, image key matches, placement references, and duplicate slug/id detection.
6. Click Create Draft — saves an Article Manager draft only.
7. The draft opens automatically in the Edit Article view.
8. Continue with Preview in Site, then click **Publish Live** as above.

#### Publish Live details

**Publish Live** runs the full article publish workflow and then triggers the GitHub Actions deploy:

- Runs `research/scripts/article-publish-workflow.mjs` with `--publish`
- Commits only allowlisted article output files:
  - `research/news-review/approved-development-news.json`
  - `src/data/approvedExternalNews.ts`
  - `public/data/news-feed.json`
  - `public/feed.json`
  - `public/rss.xml`
  - `public/llms.txt`
  - `public/sitemap.xml`
  - `src/generated/siteData.ts`
  - `public/assets/editorial/` (hero/body images)
- Pushes to `origin main`
- Triggers `.github/workflows/deploy-cloudflare-pages.yml` via `gh workflow run`
- Captures the GitHub Actions run ID and URL
- Returns commit hash, deploy run URL, deploy status, and live article URL

**Sitemap / robots continuity:** The workflow regenerates `public/sitemap.xml` during build. `public/robots.txt` is static and already references the sitemap. No manual edits to robots.txt are required for normal article publishing.

**Safety rules:**

- Publish Live requires both the Publish and Deploy confirmation boxes to be checked.
- Import Package creates drafts only.
- Import never publishes, commits, pushes, or deploys.
- Draft-only actions should only write to `.runtime/`.
- Draft/import actions must not dirty:
  - `content/overrides/change-log.json`
  - `content/overrides/content-studio-change-log.json`
- Publish Live must not run if unrelated files are dirty.
- Publish Live must not commit unrelated files (allowlist enforced).
- Publish Live must not deploy if publish or push fails.
- Do not manually commit unrelated dirty files.

#### Supported Article Package JSON shape

```json
{
  "destination": "news",
  "id": "optional-stable-id",
  "slug": "example-article-slug",
  "title": "Article Title",
  "deck": "Short buyer-facing deck / subheadline.",
  "description": "SEO/meta description.",
  "summary": "Short summary.",
  "eventDate": "2026-06-11",
  "freshnessLane": "breaking_14d",
  "neighborhoods": ["Downtown West Palm Beach", "Palm Beach"],
  "projects": ["Project Name"],
  "tags": ["development", "new construction"],
  "heroImage": {
    "uploadKey": "hero",
    "alt": "Alt text for hero image",
    "caption": "Optional hero caption"
  },
  "images": [
    {
      "uploadKey": "image_1",
      "placementId": "inline-rendering-1",
      "alt": "Alt text for inline image",
      "caption": "Optional inline image caption"
    }
  ],
  "body": {
    "intro": "Opening article intro.",
    "sections": [
      {
        "heading": "Section Heading",
        "paragraphs": ["Paragraph one.", "Paragraph two."]
      },
      {
        "heading": "Section With Image",
        "paragraphs": ["Paragraph before image."],
        "imagePlacement": "inline-rendering-1"
      }
    ]
  },
  "sources": [
    {
      "title": "Source title",
      "publisher": "Publisher Name",
      "url": "https://example.com/source"
    }
  ],
  "newsletterHeadline": "Optional newsletter headline",
  "query": "Optional research/query string"
}
```

**Inline image mapping:**

- Uploaded file key → `images[].uploadKey`
- Article placement → `images[].placementId`
- Section reference → `body.sections[].imagePlacement`

The server maps `placementId` to the `key` field in `bodyImages`, and `imagePlacement` to the `imageKey` field in `bodySections`, so the existing renderer pipeline shows inline images correctly.

**Troubleshooting:**

- If Preview in Site does not show an image, first check that the upload key and placement ID match the JSON.
- If git gets dirty after draft-only actions, that is a bug and should be fixed before committing.
- If Stage Files Locally makes changes, use Commit Staged Article Changes rather than manual terminal commits unless debugging.

---

### Buyer Intelligence v1 (2026-06-12)

Buyer Intelligence uses the same Article Manager workflow and publishing pipeline as news updates. Optional buyer-oriented fields (`buyerTakeaway`, `marketSignal`, `bestFor`, `watchPoints`, `relatedBuildings`, `relatedNeighborhoods`, `relatedCorridor`, `buyerQuestions`) are preserved in drafts and published articles. The Buyer Intelligence box renders on the article page only when at least one of these fields exists. Normal news articles remain unchanged. Buyer Intelligence fields are optional and do not block normal article publishing.

---

### 2026-06-10 Article Manager Phase 1 Verification

Phase 1 Article Manager is installed inside `tools/content-studio/`.

**Pushed commits:**

- `1fd5457` Add Phase 1 Article Manager to Content Studio
- `2d19924` Fix Article Manager diagnostic preview logging
- `e124b22` Keep Article Manager draft deletion from dirtying changelogs

**Manual smoke test confirmed:**

- Article Manager loads locally
- All Articles list loads
- Existing draft opens in editor
- New News/Updates draft can be created
- Save Draft writes only to `.runtime/article-drafts/` and keeps git clean
- Diagnostic Preview succeeds and keeps git clean after restarting Content Studio
- Delete Draft removes only `.runtime/` draft files and keeps git clean after restarting Content Studio

**Important operational note:**

After server-side Content Studio changes, restart `npm run content:studio`. The running server process does not automatically reload `server.mjs`.

**Still deferred:**

- Buyer/Downtown existing article listing and editing
- `marketNotes.ts` source migration
- Real-template preview through `src/main.ts`
- Full Media Manager

**Do not click Update Site just for draft smoke tests.** Draft-only tests do not require a site update or deploy.
