# Homepage Hero Performance QA

Updated 2026-05-22.

Contact sheet: `research/source-material-review/hero-image-contact-sheet.jpg`.

## Result

- The rotating homepage hero keeps five curated editorial images.
- The first hero image is the only eager/high-priority image.
- The second rotating layer is lazy-loaded with async decoding.
- Rotation remains a slow crossfade with no arrows or dots.
- Hover/focus pause and `prefers-reduced-motion` handling remain present.
- Captions are concise and non-distracting.
- Contrast remains readable across the current image set.

## Notes

- No hero image was removed from rotation.
- `npm run qa:hero-performance` now guards the eager/high-priority count, lazy next layer, hover/focus pause, and reduced-motion contract.
