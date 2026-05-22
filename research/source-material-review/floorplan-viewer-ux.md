# Floorplan Viewer UX

Generated: 2026-05-22

## Required Behavior

- Primary floorplan interaction keeps users on-site.
- Local PDF references open inside an internal modal viewer.
- External plan/index URLs open an internal request state instead of sending the user to the sales-office site.
- Download/source access is secondary to requesting the current packet.

## Implemented

- `/floorplans/` floorplan cards render as buttons with `data-floorplan-open`.
- Project page floorplan previews reuse the same viewer behavior.
- Viewer supports title, project/building name, caption, inline PDF iframe, previous/next, packet request, and Brooke CTA.
- Mobile viewer opens full-screen and was checked at `390x844`.

## QA Evidence

Playwright mobile result:

- Floorplan buttons found: 243
- Viewer opened: yes
- First opened title: `Alba Floorplans 19lpha Unbranded`
- Inline iframe rendered: yes
- Screenshot: `output/playwright/local-floorplans-mobile-viewer.png`

## Remaining Recommendations

- Add project-level plan grouping and filters so 243 records are easier to scan.
- Add generated preview thumbnails for PDFs if publication rights and build budget allow.
