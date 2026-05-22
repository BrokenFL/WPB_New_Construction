# Homepage Hero Strategy

Updated 2026-05-22.

## Selected Images

| Order | Image | Use |
| --- | --- | --- |
| 1 | `wpb-geography-map-hero` | Primary geography/identity image showing Downtown WPB west of the Intracoastal and Palm Beach east across the water. |
| 2 | `flagler-waterfront-corridor` | North Flagler waterfront context without implying Atlantic surf against Downtown. |
| 3 | `south-flagler-corridor` | South Flagler waterfront context and Palm Beach orientation. |
| 4 | `rosemary-square-corridor` | CityPlace / The Square downtown lifestyle signal. |
| 5 | `nora-growth-corridor` | NORA and North Downtown growth corridor signal. |

## Behavior

- The headline, subhead, and CTAs stay fixed while only the background image crossfades.
- Rotation uses an 8.5 second interval with a slow CSS opacity transition.
- Hover and keyboard focus pause rotation.
- `prefers-reduced-motion: reduce` disables rotation and removes transition motion.
- The first image is eager/high-priority; the next layer is lazy and only preloads one upcoming image.

## Accessibility

- The active image has descriptive alt text.
- The hidden image layer is `aria-hidden` until it becomes active.
- A screen-reader-only list summarizes the curated image set without announcing every slide change.
- Captions are concise and not used as busy carousel controls.

## Fallback

- If JavaScript is unavailable, the first geography image remains visible.
- If reduced motion is requested, the first image remains stable.
- No arrows, dots, or slide-specific text changes are required for comprehension.
