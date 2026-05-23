# Brooke Builder Live Preview After

Date: 2026-05-22

## Screenshots

- Local visual editor with live preview: `research/source-material-review/screenshots/brooke-builder-after-homepage-live-preview.png`
- Selected Updates card with preview highlight: `research/source-material-review/screenshots/brooke-builder-after-updates-card-preview.png`
- Mobile draft preview: `research/source-material-review/screenshots/brooke-builder-after-mobile-preview.png`
- Image picker with loaded thumbnails: `research/source-material-review/screenshots/brooke-builder-after-images-panel.png`
- Simulated remote Builder: `research/source-material-review/screenshots/brooke-builder-after-simulated-remote.png`
- Actual remote Builder through Chrome: `research/source-material-review/screenshots/brooke-builder-after-remote-chrome.png`

## What changed

- Default Builder surface is now the Homepage editing view, not a status dashboard.
- Primary navigation is simplified to `Edit Pages`, `Content`, and `Operations`.
- Page editing starts with a visible header:
  - You are editing
  - This changes
  - Preview
- Homepage editing now has a three-column desktop layout:
  - Page tree
  - Selected card editor
  - Live Page Preview
- The live preview renders a draft homepage inside Builder and applies the selected card's unsaved form values immediately.
- Selecting a page-tree card highlights the matching card in the preview.
- Clicking a card in the preview selects the matching editor node.
- Device toggles switch the generated draft preview between desktop, tablet, and mobile widths.
- The project selector is contextual and hidden outside the Projects editing view.
- Project editing shows a project-page structure and a draft project-page preview instead of implying the selected project controls the whole Builder.

## Remote QA result

- Remote Builder loaded in Chrome at `https://builder.wpbnewconstruction.com/?v=live-preview-remote-images`.
- Cloudflare Access remained active.
- Remote mode banner was visible.
- Builder warning changed to the remote-mode warning.
- Homepage project selector was hidden in remote Builder.
- Draft preview existed in remote Builder.
- Remote public asset paths resolved to `https://www.wpbnewconstruction.com/...`.
- No filesystem image paths were found in remote image `src` values.

## Remaining note

The live preview is generated inside Builder rather than using a public-site iframe. That is intentional for this branch because it shows unsaved draft changes before deploy. A future branch can add a side-by-side iframe once the public site headers and preview-overlay contract are deliberately designed.
