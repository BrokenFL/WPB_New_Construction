# Sprint 3 — fresh visual art-direction critique

Configured reviewer: GPT-6 Astra, xhigh (inherited configuration). Reviewed 2026-09-19. This is a bounded visual critique, not an implementation or a functional/accessibility audit.

Inspected the supplied desktop/mobile cover and full-page PNGs first, then seven inspection-only crops made from those exact files. Evidence: `docs/evidence/site-overhaul-v2/milestone2/after-home-{desktop,mobile}-{cover,full}.png`. The lead is independently reviewing the rendered preview. No prior score or claim of premium quality was used.

Verified working location, remote, branch and HEAD: authorized PR worktree `/Users/brookesnader/.codex/worktrees/wpb-v2-overhaul/WPB_NewConstruction`, `BrokenFL/WPB_New_Construction`, `codex/site-overhaul-v2`, `431b57dede3a23840f9c893d7c5ae2bedcbb27c8`; clean at inspection. This location is deliberate continuation of the authorized draft-PR worktree, rather than new work in the primary checkout. Read AGENTS.md and project-guide material; no source files changed.

## Verdict

The page has a useful editorial structure and credible information density, but the composition does not yet meet a distinctive luxury-site bar. The opening feels assembled from separate modules. Lower down, strong photographs, assertive black buttons, gold labels, boxed metadata, several dark backgrounds and generous empty space compete with one another. Better discipline will do more than decorative effects.

Choose **Waterfront editorial**: a solid deep-ink masthead leading directly into one uninterrupted full-width waterfront image, with carefully placed headline and actions. Follow it with a typographic development desk that clearly has a lead story. Use richer, verified imagery in the places where the user is choosing a place or building, and keep the information sections quiet.

## Highest-impact findings

| Priority | Evidence and visible weakness | Concrete treatment |
|---|---|---|
| 1 | Desktop cover: cream masthead, cream/photo split, utility strip and sage news band create four separate surfaces. The photograph owns only half the opening. Mobile cover: image is a separate banner above the site's proposition. | Solid deep-ink header, then one edge-to-edge image hero. Shared header/hero/section gutters. Put the message and primary action within that hero composition at both sizes. No transparent navigation and no side-by-side hero panels. |
| 2 | Desktop cover: the visible hero is heavily cropped and looks softer than several later project photographs. Corridor cards use visually generic tower imagery; their actual place/source identity cannot be established from the screenshots. | Use the best existing approved waterfront source at adequate intrinsic resolution. Preserve geographic identity and inspect the crop at 390, 768 and 1440. Select corridor images only after the inventory confirms the actual place and provenance. Do not substitute an attractive but unrelated skyline or generated tower. |
| 3 | News crop: three equally loud headlines, two actions apiece and similar text blocks make a large, uniform pause after the hero. Mobile spends roughly 1,500 px in this section. | One lead story plus two compact secondary story rows on desktop; chronological stack on mobile with reduced section furniture. Preserve all three stories, publication dates, source-report dates, buyer implications and destination links. A typographic layout is sufficient; do not add thumbnails unless a relevant approved source exists. |
| 4 | Project crops: the photographs are strong, but the cards end in heavy near-black bars, with text unusually close to the left edge on desktop. Gold uppercase badges, boxes and rules create a catalog feel. Mobile trims the useful facts while still retaining considerable repeated chrome. | Give the three images a consistent 3:2 proportion and deliberate focal position. Use the same deep ink as the header for buttons, 18–20 px horizontal padding and 44–48 px minimum height. Reduce badge weight and redundant borders. Keep current facts and statuses; solve the visual hierarchy without rewriting them. |
| 5 | Full page and mid crop: repeated large introductions, dividers and alternating background colors flatten the hierarchy; compare and NORA form adjacent but mismatched dark regions. | Limit the background system to warm ivory plus one ink family. Give the two dark sections intentional continuity or separate them with a real light interval, not a near-match in two different blues. Keep the useful compare and section bridges. |
| 6 | Lower desktop crop: a tall dark team panel sits beside a short wide guide card, leaving a large unused field. The logo within the panel is oversized relative to its role. | Balance the pair with a wider, shorter team panel and a taller editorial guide card; reduce logo frame height, increase the guide image's useful crop, align their tops and section baselines. Preserve both buyer actions and all existing destinations. Do not fill the gap with unsupported new content. |
| 7 | Mobile crops: gutter changes, tiny heavy labels, broken two-line utility links and a second navigation band interrupt the reading rhythm. | One 22 px gutter at 390, 20 px at 360, 32 px at tablet. Keep real navigation routes available. Make the hero-to-news utility band visually subordinate and horizontally scrollable if needed, with enough next-item visibility to signal more content. |

The original bridge illustration is an asset worth protecting. It supplies a locally specific, recognizable ending. Keep its actual source and proportions; do not redraw, recolor or replace it during this polish pass.

## Three compact directions

1. **Waterfront editorial — recommended.** Solid ink masthead, full-width source photograph, lower-left cream typography, restrained image gradient, then a warm-ivory development desk. Best answer to the requested cohesive opening and stronger imagery. Main risk is an unsuitable image crop; resolve with source selection and responsive inspection.
2. **Quiet civic journal.** Solid ivory masthead and a generous centered headline above a wide, shallow panorama within one continuous ivory opening. The news deck reads like a local architecture journal. Excellent legibility and sober credibility, but weaker photographic impact and more vertical space on mobile.
3. **Private collection.** Solid ink header and opening field, concise centered headline, one large inset landscape image, compact actions beneath. More formal and controlled, but risks making the site resemble a single-development brochure and delaying the development desk. Less appropriate for a multi-building buyer resource.

## Precise treatment for the recommended direction

### Opening and responsive composition

- **Desktop ≥ 1024:** solid masthead around 84–88 px. Existing brand left; existing Buildings, Corridors, Compare, Floor plans and contact destinations right. Use a single container width and roughly 72 px gutters at 1440. Ink color can reuse the current deep teal family; inverse cream text. Contact is a restrained outlined control with a true 44 px target.
- **Hero:** one full-width image directly beneath the masthead, roughly 590–650 px tall at a 1440×900/1000 viewport. No rounded frame, no floating cream box, no second image, no slideshow. Place text in the lower-left, max width about 670 px; leave a substantial uninterrupted area showing the actual skyline and waterfront. Keep image caption small at the opposite lower corner where legible.
- **Hero typography:** existing serif, regular weight, 68–76 px desktop, line-height 1.02–1.06, slightly tightened tracking. Break the existing headline intentionally into two or three balanced lines. Body 17–18 px, 1.55 line-height, max 470 px. Eyebrow 10–11 px with moderate tracking, not heavy gold caps. Primary action 48–52 px tall; secondary is a clear text action alongside it.
- **Image contrast:** a localized dark gradient beneath/behind text plus a restrained bottom fade. The skyline should retain daylight color and dimensional detail. Do not tint or darken the entire photograph to solve one text area. Verify contrast on the actual crop and at both viewport sizes.
- **Mobile ≤ 639:** keep a solid header surface; if the four existing routes need a second row, make it a coherent compact part of that surface rather than a detached cream band. Aim for 104–112 px total. Hero about 510–560 px, subject to text zoom rather than a rigid clipping height. Heading 42–46 px, line-height 1.04, body 15.5–16 px. Keep the headline and at least the primary action inside the first screen on a typical 390×844 viewport. Use a deliberately inspected mobile focal position; preserve recognizable waterfront context above the text. At 360, actions may stack rather than squeeze.
- **Tablet:** the same full-width composition. Scale headline around 54–60 px and retain 32 px gutters. Do not introduce a transient split layout between desktop and phone.

### Development desk and page pacing

- Use a quiet ivory or barely tinted background. Desktop title 44–48 px; section label restrained. Make the newest story approximately 55% of the content area and stack the other two in the remaining area. Visual prominence must follow the existing chronological ordering, not editorial invention.
- Secondary headlines around 25–28 px, lead around 32–36 px. Body 15.5–16 px. Dates remain visibly attached to their story and are not relegated to a hover state. Preserve the explanation distinguishing publication and source-report dates, at readable size.
- Mobile keeps all three stories in order. Section heading 34–36 px; story headings about 25–28 px; 28–32 px between stories. Tighten repeated framing, oversized introductions and empty vertical gaps before truncating useful copy.
- For regular sections use about 76–92 px vertical rhythm on desktop and 48–64 px on mobile. Individual cards should get 24–32 px internal separation, not a new section-sized gap. One deliberate image-led pause is more effective than every section demanding the same attention.
- Keep browse, compare, plans, map and guidance destinations in their existing flows. Styling must not change preselection, data, routing or buyer claims. Keep the source bridge as the closing full-width illustration.

### Typography, controls and images

- Retain the existing serif/sans pairing. Luxury here should come from scale, alignment, legible text and real imagery. Avoid adding another font or stronger letterspacing.
- Use one standard action treatment and one standard quiet text-link treatment. Reduce heavy uppercase navigation inside cards; reserve tiny uppercase labels for genuinely secondary metadata. Make arrow placement consistent and keep it inside the target.
- Project images: consistent aspect ratio, project-specific focal positions, no stretched assets, no new sky replacement, no fabricated architecture. Corridor images must depict the named corridor or be explicitly appropriate existing contextual sources. No repeated hero photo merely to create more imagery.
- Before a hero swap, inspect intrinsic dimensions, crop and source. A larger slot does not improve a low-resolution file. Use available responsive variants and avoid loading a desktop-sized original on phone if optimized source variants already exist.

### Motion and accessibility verification targets

- No parallax, autoplay, background video, hero slideshow, cursor effects or looping ornament.
- Optional section entrance: 8–12 px translate and opacity over 300–400 ms, once, triggered close to viewport entry. Initial content remains available if animation does not run. Never animate the entire news block with a long stagger.
- Fine-pointer image hover may use scale 1.015–1.02 over 400–500 ms within a fixed crop. No layout movement and no touch-hover dependency. Button/link transitions 150–200 ms. Disable transforms/reveals for reduced motion.
- Verify text contrast in the photographed hero, visible keyboard focus, actual button target sizes, no horizontal overflow, and reading order at 200% text zoom. Screenshots alone cannot certify these behaviors.

## Evidence steps and limits

1. **Desktop arrival — weak cohesion:** strong basic brand and serif, but a split composition and separate bands dilute the opening.
2. **Mobile arrival — weak sequencing:** navigation is present, but an image-only banner precedes the proposition.
3. **Latest developments — credible but monotonous:** all three visible dates and buyer implications are valuable; layout hierarchy needs work.
4. **Corridors and collection — mixed:** strong image-led navigation and project photography; source identity requires inventory and card chrome needs restraint.
5. **Compare, spotlight and map — useful but uneven:** compare is visible; adjacent dark sections need cohesion. The supplied desktop map has gray tiles while mobile has rendered tiles, so the desktop screenshot does not establish a runtime defect. Lead should check the current rendered state.
6. **Buyer guidance and close — good content, unbalanced composition:** preserve guidance, contact actions, original bridge and footer; rebalance the team/article pairing.

No interaction, contrast measurement, responsiveness beyond the supplied viewport sizes, image provenance, or source implementation was verified by this critique. No tests, commit, push, merge or deploy were performed. Only this report and inspection crops were written under `.runtime/v2-sprint3/`.

Implement the recommended opening and news hierarchy first, then compare fresh desktop and mobile captures before extending the same restraint through the project cards and lower guidance section.
