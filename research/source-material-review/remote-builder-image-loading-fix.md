# Remote Builder Image Loading Fix

Date: 2026-05-22

## Root cause

Builder images were being rendered from site-root paths such as `/assets/...` and `/projects/...`. That works when the Builder serves local public assets on `127.0.0.1`, but the protected remote Builder runs on `builder.wpbnewconstruction.com`, where those root-relative URLs point at the Builder tunnel instead of the public website asset host.

The practical result was that local previews could show images while remote previews and remote image-picker thumbnails could fail or depend on stale cached JavaScript.

## Fix

- Added one canonical client utility: `resolveBuilderAssetUrl(imagePath, context)`.
- Empty image paths now render a visible placeholder.
- `http://` and `https://` URLs pass through unchanged.
- Local filesystem paths such as `/Users/...` and `/Volumes/...` never become `<img src>`.
- Remote Builder mode resolves root-relative public assets to `https://www.wpbnewconstruction.com${path}`.
- Local Builder keeps using local public asset routes.
- Broken images add a visible fallback and log `Builder thumbnail failed` with the original path and attempted URL.
- Builder shell files and API responses now send `cache-control: no-store`.
- `index.html` now cache-busts `style.css` and `app.js` so protected remote Builder refreshes reliably after a restart.
- Corrected the NORA House fallback card image from a missing `nora-house-card.jpg` to `user-provided-nora-house-card.jpg`.

## Surfaces covered

- Image picker thumbnails
- Card previews
- Current published / draft snapshot panels
- Homepage generated draft page preview
- News Desk cards
- Project page preview
- Remote-mode previews

## QA

- Added `research/scripts/check-builder-remote-images.mjs`.
- Added `npm run qa:builder-remote-images`.
- Wired `qa:builder-remote-images` into `qa:launch`.
- Simulated remote mode confirmed public image URLs resolve to `https://www.wpbnewconstruction.com/...`.
- Chrome remote check confirmed no `/assets/` or `/projects/` images were served from `builder.wpbnewconstruction.com`.
