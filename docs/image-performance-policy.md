# Image Performance Policy

## Loading Rules

- True first-viewport hero media may use `loading="eager"` and `fetchpriority="high"`.
- Hero media should still use `decoding="async"`.
- Project cards, news cards, Market Notes cards, corridor panels, and editorial image panels should use `loading="lazy"` and `decoding="async"`.
- Do not use `decoding="sync"` for site imagery.

## Asset Budgets

- Editorial images should stay under 750 KB.
- New public non-project images should stay under 1.5 MB.
- Existing project media under `public/projects/` is tracked separately because it includes large inherited project assets.
- Built JS chunks should stay under 450 KB.
- Built CSS chunks should stay under 140 KB.

## Current Editorial Assets

- `wpb-geography-map-hero.jpg`: optimized user-provided Downtown WPB waterline image.
- `downtown-core-corridor.jpg`: optimized user-provided Downtown WPB night skyline image.
- `rosemary-square-corridor.jpg`: optimized representative Downtown/Rosemary image.
- `flagler-waterfront-corridor.jpg`: optimized user-provided North Flagler waterfront image.
- `nora-growth-corridor.jpg`: needs sourcing.
- `buyer-intelligence-interior.jpg`: needs sourcing.
