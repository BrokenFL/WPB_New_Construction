# Brooke Builder visual editor after review

Date: 2026-05-22

Local Builder check:

- Local preview: `http://127.0.0.1:8788`
- Remote-mode state was simulated with `x-forwarded-host: builder.wpbnewconstruction.com`; the Builder reported remote mode and resolved public assets to `https://www.wpbnewconstruction.com`.

Screenshots:

- Homepage editor: `research/source-material-review/brooke-builder-visual-editor-screens/after-homepage-editor.png`
- Selected card editor: `research/source-material-review/brooke-builder-visual-editor-screens/after-selected-card.png`
- Images panel: `research/source-material-review/brooke-builder-visual-editor-screens/after-images.png`
- News Desk: `research/source-material-review/brooke-builder-visual-editor-screens/after-news.png`
- Reports: `research/source-material-review/brooke-builder-visual-editor-screens/after-reports.png`
- Automation Status: `research/source-material-review/brooke-builder-visual-editor-screens/after-automation.png`

What changed:

- Builder navigation is grouped into Edit Site, Content, and Operations.
- The default screen is the Homepage Editor instead of the status dashboard.
- The main editor now shows `Editing: Homepage -> Section -> Card` context.
- Homepage has a page structure tree for Hero, Map, Corridors, Updates, Guidance, Featured Buildings, and CTA.
- Card editing shows Current Published, Draft Override, desktop preview, mobile preview, focal controls, object fit, repetition warning, Save Draft, Approve Override, Preview Page, and Update Site entry points.
- Image thumbnails now use `resolveBuilderAssetUrl(path, mode)` behavior in the client.
- Local Builder serves safe public assets from `/assets`, `/projects`, `/hero`, and `/team-resources`.
- Remote Builder mode resolves public image paths through `https://www.wpbnewconstruction.com`.
- Broken images show a visible "Image not loading" fallback and the file path.
- News Desk cards now show thumbnails, status chips, source/project/corridor metadata, and article preview content.
- Reports are grouped into Visual Audits, News / Automation, QA, Deployment, and Floorplans / Images, with latest-report shortcuts and ready/missing chips.
- Automation and build/deploy details remain available under Operations, not as the primary editing surface.

Verification:

- Playwright selected `Homepage -> Updates -> Update card 2` and confirmed the breadcrumb: `Editing: Homepage -> Updates -> Update card 2`.
- Playwright found no visible broken `figure.is-broken` thumbnails on the checked screens.
- Remote-mode API check returned `isRemote: true`, `assetBaseUrl: https://www.wpbnewconstruction.com`, and the Cloudflare Access publishing warning.
