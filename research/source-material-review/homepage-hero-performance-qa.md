# Homepage Hero Performance QA

Updated 2026-05-22.

Contact sheet: `research/source-material-review/hero-image-contact-sheet.jpg`.

## Result

- The rotating homepage hero keeps five curated editorial images.
- The first hero image is the only eager/high-priority image.
- The second rotating layer is lazy-loaded with async decoding.
- Old rotation interval: `8500ms`.
- New rotation interval: `16000ms`.
- Fade duration: `1800ms`.
- Rotation now uses a slow two-layer crossfade with no arrows or dots.
- Hover/focus pause and `prefers-reduced-motion` handling remain present.
- Captions are concise and non-distracting.
- Contrast remains readable across the current image set.

## Notes

- No hero image was removed from rotation.
- Likely glitch cause: the prior transition copied the incoming image back onto the active layer after the fade timeout, which could create a visible flash or layer reset during decode/paint.
- Fix: the current image remains visible, the standby layer preloads and decodes the next image, the standby layer fades above the current image, and layer roles swap after the fade.
- Reduced-motion behavior: auto-rotation exits early when `prefers-reduced-motion: reduce` matches, and CSS removes transition timing.
- Performance notes: the first hero image remains the only eager/high-priority image; the standby image is lazy/async and only preloads the next rotation image.
- `npm run qa:hero-performance` now guards the timing constants, fade duration, eager/high-priority count, lazy next layer, hover/focus pause, reduced-motion contract, and stacked crossfade structure.
