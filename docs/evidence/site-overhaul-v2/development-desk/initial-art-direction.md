# Development Desk — focused art direction

**Reviewer:** GPT-6 Astra, extra-high reasoning. **Date:** 2026-09-19. **Source HEAD:** `5041bc179ac784300fa01fd32e399f2e8668c4d4`, branch `codex/site-overhaul-v2`.

This is one composition direction for the Development Desk only. The selected masthead, warm hero and its responsive derivatives, and closing graphic are locked. No source or public asset files were edited for this memo. The explicitly assigned V2 worktree was used; its initial tracked status was clean.

## Evidence and diagnosis

Inspected the actual fresh full-section captures in `before/desk-section-1440x1000.png`, `before/desk-section-390x844.png`, and `before/desk-section-320x812.png`, plus all three actual story images listed below. The earlier supplied Sprint 3 section captures were reference context only; the fresh images support this direction.

1. **Desktop: credible typography, unfinished balance.** The current 874.41 px section gives the lead a 556.52 px spanning box. Its text ends long before its bottom-pinned actions, leaving roughly 220 px of empty paper. The right column determines the lead's height. Remove that structural cause; do not add decoration or filler to occupy the gap.
2. **Mobile: correct order, excessive repetition.** The section is 1468.05 px at 390 px and 1754.36 px at 320 px. All three stories repeat the same headline, paragraph, separate source date, and two-action pattern. Make the lead a feature and the other two recognizably shorter briefs.
3. **Capture limit:** the mobile images have a focused “Skip to content” overlay. Clear focus before the next presentation captures; this is not a request to remove or restyle the accessibility control. Static images do not establish link, keyboard, or screen-reader correctness.

## One composition: a feature beside two illustrated briefs

### Desktop, above roughly 1100 px

- Keep the existing paper/ink palette, outer gutter, section heading and restrained rules. Use approximately **55% lead / 45% secondary column**, with a **36–44 px gap**; remove the extra large lead right padding and its full-height vertical rule.
- Give the lead a **2.2:1 image** above its copy, approximately **680–700 × 310–320 px** at a 1440 px viewport. This crop retains the skyline and bridge while reducing surplus sky/water. No text over the image.
- Follow it with the short image label, compact dates, **34–36 px regular serif headline at 1.12**, one buyer sentence, and actions. Use **16–20 px from image/label to copy**, **8–12 px inside the copy**, and **12 px before actions**. Let everything flow naturally. Remove `flex: 1`/`margin-top: auto` behavior that separates copy from actions.
- Each secondary is a compact brief: a **144 × 108 px thumbnail on the left**, a **20 px gap**, and the date/headline on the right. The buyer sentence and action row run across the brief's full width below that header, so they do not become narrow prose columns. Use **24–26 px serif headlines, 1.15 line height**, and **15 px / 1.5** supporting copy.
- Separate the two briefs with one thin rule and **22–26 px breathing room**. Align them naturally from the top; do not distribute them to fill the lead height or impose equal heights. A modest difference between column bottoms is acceptable. The current large blank field under the lead is not.
- Keep the section around **780–880 px total at 1440 px**. This is an inspection target, not a CSS height. Adding relevant imagery while improving balance matters more than shaving arbitrary pixels.

### Tablet and mobile

- Stack before the two-column layout compresses the briefs (approximately **1100 px**). Keep the same order: lead, La Fontana, Alba. At tablet widths, the lead image can be capped around 280 px high with the same skyline-safe crop; do not let it become a second oversized page hero.
- At 390 px retain the existing approximately **22 px side gutters**, a **2.2:1 full-width lead image**, and **28–30 px / 1.12 lead title**. Do not render secondary images full width.
- Each secondary keeps the **thumbnail-left/title-right** header: **96 × 72 px**, **14 px gap**, **21–22 px / 1.15 title**. At 320 px use an **88 × 66 px thumbnail and 12 px gap**, with a **20–21 px headline**. Put the buyer sentence and links across the entire available width below it. This is the main device that makes these read as briefs.
- Use **20–24 px between stories**, including the separator. Dates and image labels stay small and readable; body copy stays at **15 px / 1.5**, not microtype. Never clamp away a contractual qualifier or caveat to meet the height target.
- Target approximately **1100–1250 px total at 390 px**, **1200–1380 px at 320 px**, and no clipping/overflow. Natural wrapping and truthful labels take priority over a hard cap.

## Homepage-only wording

The selector remains the same genuine newest three publications. Keep the canonical article titles, approved records, dates, publication logic and article body unchanged. These are compact display variants for this surface, not a replacement editorial pipeline. For later stories without a reviewed display variant, use the canonical text; avoid automated substring truncation.

| Story | Homepage headline | One buyer sentence |
|---|---|---|
| Terra / Frisbie | **Terra and Frisbie add $20M West Palm parcel** | The expanded site is planned for mixed-use and residential development; detailed plans and delivery timing remain unconfirmed. |
| La Fontana | **Unicorp under contract for $200M La Fontana buyout** | Watch the projected 2027 closing; a future redevelopment program has not yet been established. |
| Alba | **Alba Palm Beach is complete and move-in ready** | A completed option for buyers seeking near-term occupancy; confirm current inventory and pricing separately. |

These sentences derive from the currently approved article copy; do not introduce a plan, delivery promise or live availability assertion. Aim for roughly 15–22 words. A separate “Why it matters” heading on every card would rebuild the density we are removing.

Combine dates into one wrapping metadata group: **Published Sep 15, 2026 · Source report Sep 9, 2026**, with distinct existing `time` values retained. Shorten the bottom explanation to **“Newest publications on this site; source reports may cover earlier events.”**

Use **Read story ↗** plus a related research path in normal flow, with 44 px minimum link targets and a 16–20 px horizontal gap. The existing destinations remain authoritative: **Browse buildings →** for Terra, **Explore North Flagler →** for La Fontana, and **Explore Alba →** for Alba. The title and thumbnail also open the article; keep the project/corridor action a separate link. Do not nest links or make the whole card one link containing another. On 320 px the two short actions should fit as a row; wrapping remains preferable to squeezing type.

## Exact images and honest framing

Use the three existing article-bound assets confirmed by inventory; no new concept imagery is needed.

| Role | Existing public path | Treatment |
|---|---|---|
| Terra lead | `/assets/home/downtown-corridor-bridge-daytime-v01.jpg` — 1920 × 1080 | Wide **2.2:1**, center around **50% 48–52%**. Retain the skyline tops and bridge arches. Visible label **“West Palm Beach context”** plus the inventory-verified medium/credit. It is not an image of the acquisition site. |
| La Fontana brief | `/assets/editorial/wpb-corridors-aerial-hero-v01.jpg` — 1280 × 533 | **4:3 thumbnail**, centered crop; keep waterfront and multiple buildings, with no site marker or project-specific callout. Visible label **“Corridor context”** plus verified medium/credit. This works as an orientation illustration, not as evidence of La Fontana or an announced redevelopment. |
| Alba brief | `/assets/projects/alba-palm-beach/hero/alba-palm-beach-hero-wide-aerial-v01.webp` — 1316 × 740 | **4:3 thumbnail focused on the right-side Alba tower**, retaining roof and base. A plain center crop makes the subject tiny or loses its emphasis. If needed use an approved-source crop/zoom centered around the rightmost tower; approximate source region `x 720, y 290, width 596, height 447` is a starting point for visual checking. Visible label **“Alba · Architectural rendering”**. Do not present it as a completion photograph. |

The first two images have broad contextual relevance only. Keep that explicit next to the image, and add **AI-generated** when the inventory's source evidence establishes that medium; visual appearance alone is insufficient to assign provenance. Their credits must come from the asset inventory, not this memo. No skyline substitution, painted filters, gradients, badges or ornamental filler.

## Review boundary

Inspect the full section and its transition into building discovery at 1440, 390 and 320 px after initial implementation. Confirm the three image subjects/labels, source/publication distinction, natural action placement, compact secondary pattern and unchanged order. Then allow at most two focused correction rounds. A fresh independent reviewer should assess the result after this direction; do not reopen the selected hero or expand into a site-wide redesign.
