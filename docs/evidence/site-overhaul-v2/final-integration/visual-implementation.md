# Final integration visual implementation

This is the round-1 implementation record. The final evidence index and fresh review supersede its pending-review wording, initial narrow text-stress result and capture limitations. Subsequent source changes fixed the CTA cascade, broadened text-stress coverage, and repaired masthead wrapping and semantic findings before the source freeze.

## Scope

Bounded homepage composition pass on `codex/site-overhaul-v2` at the existing PR #115 head. The selected warm Shorecrest hero, responsive derivatives, Development Desk data and image treatments, buyer flows, and closing bridge artwork were preserved.

## Implemented direction

- Moved the existing Latest path into the hero action grid with the concise labels `Explore buildings`, `Compare buildings`, and `Latest stories`.
- Kept the desktop/tablet two-column action rhythm with Latest on its own ruled row. Mobile uses the intentional 760px hero, 72px lower padding, a full-width primary action row, and two readable secondary links with 44px targets. At 320px the action grid changes to flexible columns so text can wrap instead of forcing horizontal overflow.
- Increased the homepage section rail labels to 13px, changed the destination label to `Buildings`, and normalized `Buyer guides` sentence case while retaining horizontal scrolling and the visual overflow cue.
- Changed the featured heading link to `View all buildings`, added an 8px arrow gap, and changed shared featured-card actions to `View building` with a hidden arrow glyph.
- Normalized the homepage compare action to `Compare these buildings`; aligned the lower commercial guide, advisory, resource and arrow links with the existing 13px/44px CTA treatment.
- Removed the inherited 12px featured-section gutter override, set the corridor heading grid gap to 0, and normalized corridor/collection eyebrow weight and line-height.
- Replaced the NORA heading's forced span breaks with one text node and content-driven balanced wrapping.

## Rendered evidence

Captured against the editable preview at `http://127.0.0.1:5186/` after the changes:

- `output/playwright/final-integration/round1/home-1440-full.png`
- `output/playwright/final-integration/round1/home-1024-full.png`
- `output/playwright/final-integration/round1/home-768-full.png`
- `output/playwright/final-integration/round1/home-390-full.png`
- `output/playwright/final-integration/round1/home-375-full.png`
- `output/playwright/final-integration/round1/home-320-full.png`
- `output/playwright/final-integration/round1/home-{390,375,320}-sequence-*.png` (consecutive viewport-height frames from the top of the page through the bridge/footer)
- `output/playwright/final-integration/round1/home-320-text-200-stress.png` (bounded 320px enlarged-type reflow stress capture)
- `output/playwright/final-integration/round1/metrics.json`

The first 390px frame begins at scroll position 0 and shows the complete masthead before the hero. The mobile sequence shows masthead → hero → Development Desk → building discovery and the remaining homepage sections in order.

## Targeted evidence

Chromium at 1440, 1024, 768, 390×844, 375×812 and 320×812 reported no document horizontal overflow. The hero measured 690px at 1440, 680px at 1024/768, and 760px at all three phone widths. Latest begins at document y=755px at 390/375 and y=759px at 320; the Development Desk begins at y=1006px at 390/375 and y=1010px at 320. All three news previews remained present.

The capture harness scrolled every visible active-home flow image into view and awaited completion. The sanitized metrics list contains only local visible flow images; all listed images had `complete=true` and `naturalWidth>0`. Google Maps tile images were omitted from the artifact inventory because their external URLs can contain runtime credentials; map availability is tracked separately by the integration checks.

The 320px enlarged-type stress (hero title/body/actions and section rail at 2× visual type) grew the hero to 1,506px to preserve readable content, kept the action grid inside the 276px content column, and reported no document horizontal overflow. This is a browser stress emulation, not a physical-device text-zoom claim.

The loaded Chromium stacks were Iowan Old Style / Palatino / Georgia for editorial headings and Avenir Next / Inter / Segoe UI for body and navigation. These are installed platform fonts, not bundled webfont proof.

## Validation

- `npx tsc --noEmit --pretty false` passed.
- `git diff --check` passed.
- Shared-card smoke check at `/buildings/` passed at 1440px and 390px: 58 cards rendered, all sampled actions read `View building →`, no horizontal overflow, no browser errors. A direct fresh article entry at `/updates/terra-frisbie-20m-west-palm-beach-assemblage-2026-2026-09-15/` also initialized at 390px with no overflow or browser errors.
- No image, canonical fact, news source, or deployment files were changed by this bounded visual pass.

## Remaining review

Fresh Astra art-direction and buyer-journey review should judge the full rendered sequence and shared card treatment. The selected AI-assisted hero remains subject to the independent developer/architect source verification and owner decision recorded in `.runtime/final-integration/source-verification.md`.
