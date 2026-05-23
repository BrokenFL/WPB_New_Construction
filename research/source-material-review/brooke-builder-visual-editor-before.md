# Brooke Builder visual editor before review

Date: 2026-05-22

Local Builder check:

- Local branch: `codex/brooke-builder-visual-editor-ux`
- Local preview: `http://127.0.0.1:8788`
- Default Builder port `8787` was already occupied, so this review used `WPB_CONTENT_STUDIO_PORT=8788`.

Screenshots:

- Dashboard: `research/source-material-review/brooke-builder-visual-editor-screens/before-dashboard.png`
- Homepage editor: `research/source-material-review/brooke-builder-visual-editor-screens/before-homepage.png`
- Images panel: `research/source-material-review/brooke-builder-visual-editor-screens/before-images.png`
- News Desk: `research/source-material-review/brooke-builder-visual-editor-screens/before-news.png`
- Reports: `research/source-material-review/brooke-builder-visual-editor-screens/before-reports.png`
- Automation Status: `research/source-material-review/brooke-builder-visual-editor-screens/before-automation.png`

Confusing points:

- The first screen was dominated by status cards, so it was not immediately clear what page or card to edit first.
- The left rail mixed page editing, news, reports, and automation in one flat list.
- The Homepage editor had a section selector and card list, but no page structure tree showing where the selected card lives.
- The selected-card context did not consistently answer "Editing: Homepage -> Section -> Card."
- Current published content, draft override content, and preview cards appeared together, but not as a clear side-by-side editing workflow.

Image loading issues:

- Public image paths such as `/assets/editorial/flagler-waterfront-corridor.jpg` were rendered directly against the Builder host.
- The local Builder server did not serve `/assets`, `/projects`, `/hero`, or `/team-resources`, so visible thumbnails failed in the Builder even when the assets existed in `public/`.
- Remote Builder mode would also risk resolving public-site image paths against `builder.wpbnewconstruction.com` instead of `www.wpbnewconstruction.com`.
- The image picker did not show a visible "Image not loading" warning with the file path when an image failed.

Backend/status content to move:

- Full status cards, LaunchAgent details, automation JSON, workflow details, and deploy checks belong in Operations -> Automation Status / Build / Deploy.
- The main Builder surface should prioritize Homepage editing, image review, News Desk, reports, and Update Site entry points.
