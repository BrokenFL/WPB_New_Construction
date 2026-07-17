# Article Publisher Workflow

Safe, preview-first article publishing for WPBNewConstruction.com. Replaces the
old Brooke Builder preview, which did not match the live article renderer.

## Purpose

Let Brooke create, preview, stage, edit, publish, and ship articles (News
Updates, Buyer Intelligence / Market Notes, Downtown Spotlight) using the same
data contract and renderer logic the live site uses. No raw, unformatted
publishes.

## Safety model

- **Preview** writes only to `.runtime/article-previews/` (never touches tracked files).
- **Stage** runs the real normalize + build + QA and writes local article/data/
  asset/generated outputs for review, but does **not** commit, push, or deploy.
- **Publish** commits and pushes the article output files.
- **Ship** deploys live (only after publish).
- The Content Studio server refuses to stage/publish when the repo already has
  unrelated changes, to keep article commits clean.

## Commands

```bash
npm run article:preview -- --input=/path/to/article.json
npm run article:stage   -- --input=/path/to/article.json
npm run article:publish -- --input=/path/to/article.json
npm run article:ship    -- --input=/path/to/article.json
```

Edit an existing article (loads current values, then applies overrides):

```bash
npm run article:stage -- --input=/path/to/article.json --edit=<slug-or-id>
```

`--edit` can also be supplied in the JSON as `"edit"`, `"slug"`, or `"id"`.

Each command prints a final JSON result on stdout. The CLI wrapper
(`research/scripts/article-publish-cli.mjs`) sets the process exit code from
`ok` in that JSON.

## Input JSON schema

Template: `research/article-uploads/templates/article-template.json`.

```json
{
  "destination": "news",            // news | buyer | downtown
  "title": "Headline",
  "deck": "Two or three sentence summary.",
  "slug": "optional-custom-slug",   // news slugs auto-append -YYYY-MM-DD
  "sections": [                      // preferred: explicit structured sections
    { "heading": "What happened", "body": "...", "imageKey": "image1" },
    { "heading": "Why it matters", "body": "..." }
  ],
  "body": "",                        // fallback: markdown-ish text if no sections
  "sourceName": "Palm Beach Post",
  "sourceUrl": "https://...",
  "sourceLinks": [
    { "label": "Source", "url": "https://...", "type": "news" }
  ],
  "relatedProjectIds": ["nora-house"],
  "relatedCorridorIds": ["downtown"],
  "heroImage": { "file": "hero.jpg", "path": "/assets/editorial/hero.jpg", "alt": "", "caption": "", "credit": "" },
  "bodyImages": [
    { "key": "image1", "file": "body.jpg", "alt": "", "caption": "", "credit": "" }
  ],
  "commitMessage": "Publish article: ..."
}
```

Images accept `file` (path), `dataUrl` (base64), or an existing public `path`
(e.g. `/assets/editorial/...`). File/dataUrl images are optimized to JPEG (hero
max 2400px, body max 1600px, q82) under the 750 KB editorial budget. The
publisher does not call an image-generation API; if you want a new editorial
image, generate it with the chat-native image tool first, then attach the
result as `heroImage.file`, `heroImage.path`, or `heroImage.dataUrl`.

## Image placement rules

- The **hero** image is separate from body images and renders at the top.
- Body images are placed **manually**. Reference one inside a section with the
  token `[[image:<key>]]`, or set `"imageKey": "<key>"` on the section.
- The live client renderer (`src/main.ts` -> `renderNewsParagraph`) replaces
  `[[image:<key>]]` with the resolved body image at exactly that spot.
- Unresolved keys produce a warning and a visible "Missing image" mark in the
  preview HTML.

## Structured sections rules

- Provide `sections` (array of `{heading, body, imageKey?}`) for stable output.
- If `sections` is omitted, `body` text is parsed: `##`/`###` lines become
  headings; a warning is emitted recommending explicit sections.
- When editing, existing `bodySections` are reused if no new ones are given.

## What each mode modifies

Preview (no tracked files):
- `.runtime/article-previews/<destination>/<slug>/preview.html` + `preview.json`

Stage / Publish (news destination) write/regenerate:
- `public/assets/editorial/<slug>-hero.jpg`, `<slug>-body-N.jpg`
- `research/news-review/approved-development-news.json`
- `src/data/approvedExternalNews.ts`
- `public/data/news-feed.json`, `public/feed.json`, `public/rss.xml`
- `public/llms.txt`, `public/sitemap.xml`
- `src/generated/siteData.ts`

Buyer / Downtown destinations write: `src/data/marketNotes.ts`,
`src/generated/siteData.ts`, `public/sitemap.xml`, editorial assets.

## QA / build steps

- Stage and Publish run `npm run build` and `npm run qa:launch:no-write`.
- News destinations also run `npm run news:promote` and `npm run news:refresh`.
- Ship additionally runs `npm run ship:live` and `npm run qa:live`.
- After build/QA, the workflow restores any unexpected tracked files it did not
  intend to change, keeping the article output set clean.

## Result JSON

```json
{
  "ok": true,
  "mode": "stage",
  "route": "/updates/<slug>/",
  "liveUrl": "https://www.wpbnewconstruction.com/updates/<slug>/",
  "previewHtml": ".runtime/article-previews/news/<slug>/preview.html",
  "previewJson": ".runtime/article-previews/news/<slug>/preview.json",
  "errors": [],
  "warnings": [],
  "changedFiles": ["..."],
  "committed": false,
  "pushed": false,
  "shipped": false
}
```

`changedFiles` (stage) reports the actual article output files touched by the
run, including files that were already dirty before the run. It is computed from
`git status --short` against the known article output set plus any newly
appearing status lines (see `stageChangedFiles`).

## Content Studio UI

Open Content Studio and use the **Article Publisher** tab. Fields:

- Destination, Workflow mode (Preview/Stage/Publish/Ship), Category
- Slug, Headline, Short summary (deck)
- Sections JSON, Article body (fallback)
- Placeholder insert buttons (`[[image:image1]]`, `image2`, `map`) -> body textarea
- Related projects / corridors
- Source name / URL / published date, Why it matters, Buyer context, Commit message
- Hero photo (file/alt/caption/credit)
- Up to 3 body photos (file/key/alt/caption/credit)
- Confirm checkboxes for Publish, Ship, and Remote mode
- Buttons: Preview, Stage, Publish, Ship
- Results render in the `#result` panel (route, preview links, warnings, errors,
  and the server's changed-files list).

The UI posts to `/api/manual-article`, which runs `article-publish-cli.mjs` with
the chosen mode.

## Known limitations

- Static prerender HTML (`dist/.../index.html`) is **text-only by design**. Body
  images are rendered by the live client renderer, not in the prerender. The
  prerender now strips `[[image:key]]` tokens, uses the article hero for
  `og:image`, and no longer echoes the deck into `Why it matters` / `Buyer
  context`. Full `<img>` rendering in the prerender is a deferred later pass.
- Content Studio UI has no explicit **create vs edit** toggle yet (the CLI
  supports `--edit`).
- Content Studio source input is single source name/URL; multi `sourceLinks` is
  CLI/JSON only.
- Placeholder insert buttons target the body textarea, not the Sections JSON box.

## Recover / revert smoke or article outputs

Stage keeps local outputs for review. To revert only the article outputs from a
run (without touching workflow code edits):

```bash
# Inspect first
git status --short

# Revert tracked article data/generated files
git restore -- \
  public/data/news-feed.json public/llms.txt public/sitemap.xml \
  research/news-review/approved-development-news.json \
  src/data/approvedExternalNews.ts src/generated/siteData.ts

# Remove untracked staged editorial assets for the slug
git clean -f -- "public/assets/editorial/<slug>-*.jpg"

# Remove the preview artifacts
rm -rf .runtime/article-previews/<destination>/<slug>
```

Do not blanket-revert: code changes live in `research/scripts/` and
`tools/content-studio/` and should be kept.
