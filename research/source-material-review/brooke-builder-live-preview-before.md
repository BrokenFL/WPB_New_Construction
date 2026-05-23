# Brooke Builder Live Preview Before

Date: 2026-05-22

## Current state checked

- Branch before work: `main`
- Local Builder: already running on `http://127.0.0.1:8787/`
- Remote Builder: `https://builder.wpbnewconstruction.com/`
- Remote protection: Cloudflare Access sign-in was reached in Chrome.
- Public `/brooke-builder/` and `/content-studio/` remain app-redirected/public-blocked by existing route guards and redirects.

## Screenshots

- Local Homepage editor: `research/source-material-review/screenshots/brooke-builder-before-homepage-editor.png`
- Local Images panel: `research/source-material-review/screenshots/brooke-builder-before-images-panel.png`
- Local card editor: `research/source-material-review/screenshots/brooke-builder-before-card-editor.png`
- Local News Desk: `research/source-material-review/screenshots/brooke-builder-before-news-desk.png`

## Findings

- Images were locally resolved as root-relative Builder URLs, for example `/assets/...` and `/projects/...`.
- Remote mode had a partial asset resolver, but cache-busting and a single enforced resolver were missing across the visual editor surface.
- The Image Picker, card preview, draft/current snapshot, and News Desk all rendered images through the same `builderImage()` helper, so the fix could be centralized.
- The editor still felt disconnected because the page tree, form fields, card preview, and live page were separate mental models.
- There was no full page preview showing where the selected card lives on the homepage.
- Selecting a card in the page tree updated the form, but there was no matching page-level highlight.
- Public-site iframe preview was not required for the minimum usable fix. A generated draft preview is safer because it can apply unsaved form edits immediately before deploy.

## Remote constraints

- Initial DNS from terminal did not resolve `builder.wpbnewconstruction.com`.
- Chrome reached Cloudflare Access for the protected hostname.
- Automation through the remote Access login was not used to bypass or complete authentication.
- Repeatable remote QA therefore uses two paths: Chrome verification when signed in, and local remote-mode simulation for deterministic checks.
