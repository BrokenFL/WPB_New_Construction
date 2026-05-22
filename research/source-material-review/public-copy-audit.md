# Public Copy Audit

## Routes Reviewed

- `/`
- `/buildings/`
- `/map/`
- `/compare/`
- `/updates/`
- `/market-notes/`
- `/answers/`
- `/floorplans/`
- `/inquire/`
- `/projects/olara/`
- `/projects/rosewood/`
- `/projects/nora-house/`
- `/projects/south-flagler-house/`
- `/corridors/north-flagler/`
- `/corridors/downtown/`
- `/corridors/south-flagler/`

## Backend-Sounding Copy Found

- Project pages used a rich related-news card grid at the bottom, which made buyer updates feel like a feed module rather than a simple project note.
- Public copy and data used phrases such as "watch item," "not publicly confirmed," and "source-linked updates" more heavily than a buyer needs.
- Source and review workflow wording existed in public-adjacent JSON and generated text, so QA now has a stronger copy gate.

## Rewrites Applied

- Project-page update sections now use "Recent project notes" with text rows, simple source lines, and direct source/inquiry links.
- The project-update intro now explains what buyers should verify: pricing, availability, fees, and timing.
- Public copy QA now flags operational phrases before launch.

## Remaining Copy Risks

- Some methodology and research files intentionally discuss source review, approval, and internal workflow. Those files are not public UI, but they should stay out of rendered pages and public data.
- Official third-party floorplan HTML can contain generic form words such as search placeholders. Those are source artifacts and should not drive visible site copy.

## Recommended Future Voice Rules

- Say "buyer note" instead of "record."
- Say "early-stage project to monitor" instead of "pipeline watch item."
- Say "details to verify" instead of "unknown fields."
- Keep methodology language on methodology pages and research docs, not project pages.
- New news, images, and project details should enter review first and become public only after explicit approval.
