# Brooke Builder Visual Overlay Before Report

Created: 2026-05-22
Branch: `codex/brooke-builder-visual-overlay-editor`

## User Feedback Driving This Pass

- Brooke Builder works locally and remotely, but the editing experience still feels too abstract.
- The primary surface feels like an admin panel instead of a website builder.
- The side preview does not resemble the actual public homepage enough to make visual decisions confidently.
- Preview cards are still too much like data cards, not the page being edited.
- Images are selectable, but they are not visible and replaceable in the exact page context where they appear.
- Drag/drop replacement directly onto a homepage image/card is missing.
- Navigation still exposes technical editing buckets before the user knows what page they are changing.
- The user cannot instantly answer: "I am editing this exact thing on this exact page."

## Current Builder State

- Existing Builder includes a homepage card editor, image picker, draft previews, focal controls, status controls, reports, News Desk, and guarded Update Site actions.
- Remote Builder is protected by Cloudflare Access at `https://builder.wpbnewconstruction.com`.
- Public Builder routes remain expected to redirect away from the public website.
- The current local preview renderer is useful for comparing card states, but it is still a miniature card simulator, not a site-like homepage canvas.

## Required Pivot

The next implementation should make `Visual Editor` the default path, render the Homepage in a site-like layout, expose editable overlay hotspots only in edit mode, support direct image drop replacement, and keep the current card-level editor as `Advanced Editor` for fallback and detailed settings.
