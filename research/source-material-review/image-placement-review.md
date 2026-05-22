# Image Placement Review

| Route | Image | Issue | Recommended Replacement | Fixed? |
| --- | --- | --- | --- | --- |
| `/` | `/assets/editorial/wpb-geography-map-hero.jpg` | Reused as a broad orientation image. Acceptable, but high repetition risk. | Keep for atlas context; use more specific images for future articles. | No change needed |
| `/market-notes/` | `/assets/editorial/wpb-geography-map-hero.jpg` | Generic orientation image on a buyer-note card. | Replace with note-specific chart/interior/context image when available. | Deferred |
| `/compare/` | `/assets/editorial/buyer-intelligence-interior.jpg` | Advisory image works, but must not imply a specific project interior. | Keep caption/source context neutral. | Checked |
| `/projects/rosewood/` | `/projects/rosewood/media/` | Correct Rosewood context; logo/brand assets still incomplete. | Add approved Rosewood logo or brand resource when rights are confirmed. | Deferred |
| `/projects/nora-house/` | `/projects/nora-house/media/` | Correct NORA context. Needs more varied approved imagery. | Add official amenity/interior assets after rights review. | Deferred |
| `/projects/south-flagler-house/` | `/projects/south-flagler-house/media/` | Correct South Flagler context. Gallery depth still limited. | Add more reviewed project gallery images. | Deferred |
| `/corridors/north-flagler/` | `/assets/editorial/flagler-waterfront-corridor.jpg` | Correct corridor context. | Keep. | Checked |
| `/corridors/downtown/` | `/assets/editorial/rosemary-square-corridor.jpg` | Correct downtown context. | Keep; use Kravis only for culture/walkability modules. | Checked |
| `/corridors/south-flagler/` | `/assets/editorial/south-flagler-corridor.jpg` | Correct South Flagler context. | Keep. | Checked |

Static QA also passed through `npm run qa:image-repetition`, which generated `research/source-material-review/image-repetition-audit.md`.
