# Sprint 3 — integrated candidate review

Reviewer: **GPT-6 Astra xhigh**. Reviewed 2026-09-19. This report separates UI/art direction from graphic design and supersedes the earlier 7.8 / 7.4 assessment for the actual integrated candidate. The final NORA typography correction has been visually verified in the rebuilt desktop/mobile captures.

## Outcome and scores

| Independent pass | Earlier candidate | Integrated candidate | Basis for improvement |
|---|---:|---:|---|
| UI / art direction | 7.8 / 10 | **8.3 / 10** | The Shorecrest composition gives the opening a clearer architectural subject and calmer space behind the message. Compare now belongs to the same ink-colored system as the surrounding page. Corridor actions are more legible and aligned; project facts no longer resemble boxed form controls. |
| Graphic design | 7.4 / 10 | **8.0 / 10** | More consistent action typography, darker readable bronze labels, quieter metadata, a strong image/text relationship, and the balanced final advisory area now read as one deliberate system. Native hero detail and uneven page rhythm remain the main ceiling. |

These are candid subjective visual grades. The result is a strong, coherent polish pass. It is not a 9-plus, fully elite luxury editorial execution, and the remaining limitations should not be disguised by an inflated score.

## Actual evidence

Inspected all five opening captures at 1440, 1024, 768, 390 and 320 px in `.runtime/v2-sprint3/delivery-review/`, plus full-page desktop/mobile and the news, corridor, project and advisory detail captures at desktop/mobile. Made exact inspection-only crops from the supplied full-page screenshots for compare and NORA: `inspection-compare-nora-1440.png` and `inspection-compare-nora-390.png`.

Then inspected `delivery-review/nora-final-1440.png`, `nora-final-390.png`, the supplied computed-style output `nora-final.json`, and the final full-page `delivery-final/home-1440-full.png` and `home-390-full.png` after source revision `a26faad73518e8663bcc8177e3f1b63dfa90b12d`.

Several mobile detail captures show the focused “Skip to content” link. That is a focus/capture state, not a newly permanent interface element. The unfocused covers and full-page frames support the overall composition review. Use unfocused detail captures for presentation.

## Pass 1 — UI and art direction

1. **Desktop arrival — strong.** Solid masthead, common left gutter, headline and primary action hold together. Shorecrest occupies the right side while open sky supports the text. This is a better designed relationship than placing the same message over a dense generic waterfront skyline. The caption explicitly names the project and identifies an architectural rendering.
2. **1024 and 768 px arrival — good.** Navigation remains available, the tower is recognizable, and the headline has its own space. The caption clears the floating Ask WPB control. No visible overlap or clipping was found in these frames.
3. **390 and 320 px arrival — good within narrow-screen constraints.** Tower roof and identity are retained. Text crosses part of the facade but remains visibly readable. The primary action, compare link and caption are present. At 320 px the contact label and brand descriptor wrap; this is functional and composed enough, rather than effortless. Only the opening was supplied at 320 px, so this is not a full-page 320 px certification.
4. **News — credible, with an unresolved rhythm limitation.** All three stories retain publication dates, source-report dates, implications and onward links. The lead/secondary hierarchy is clear. Desktop still leaves a substantial empty field below the lead article; mobile has a long uninterrupted reading section before the first corridor image. Those are pacing limitations, not missing content.
5. **Corridors and projects — materially improved.** Corridor links are readable mixed case and align with their images instead of sitting inside the old inset, heavy-capital treatment. Project image subjects remain clear, including Shorecrest. Quiet metadata strips are better suited to an editorial selection than the previous boxed badges/fields.
6. **Compare and spotlight — substantially more coherent.** The compare section now shares the deep-ink surface, restrained preview panels and calmer typography of the surrounding design. The complete selected building names remain visible at 390 px in the inspected frame. The final NORA action correction is visible: quiet mixed-case directory link and one restrained outlined story action. The middle now belongs to the same system as the opening and advisory area.
7. **Advisory and close — strong.** The team panel and large guide image balance on desktop. Mobile introduces the article with its Market Intelligence header in the correct order. The original closing bridge remains visible as the site's distinct ending.

No new material clipping, overlap or lost subject was found in the five opening sizes or the reviewed full-page/detail frames. This is a visual finding, not a claim about all interactive states.

## Pass 2 — graphic design

The page now has a consistent core identity: deep ink, warm paper, large regular-weight serif headings, clear daylight architecture, thin rules and restrained actions. The three requested component refinements have a visible effect. Compare no longer introduces an unrelated blue palette; corridor actions no longer read like compressed advertising labels; project metadata is substantially quieter. The darker bronze labels are visibly more readable on paper.

The grade remains below an elite benchmark for three specific reasons:

- **The hero composition is better than its native detail.** The final image remains soft when given a full desktop hero. The tower silhouette and open-sky layout make that limitation less distracting, but do not remove it.
- **Rhythm is not uniformly precise.** The desktop lead-story void and the long mobile progression through news and individual project cards still slow the page. The polished opening and closing advisory area are stronger than the intervening pacing.
- **Fine typography still has a few legacy differences.** Some small project actions remain uppercase while nearby actions are mixed case, and arrow spacing is not completely uniform. These are minor remaining details, not justification for another concept pass.

The original closing bridge continues to add more brand character than another generic stock photograph would. Preserving it was the correct decision.

## Image honesty and final source

The earlier 2200 px Shorecrest candidate is **not** the reviewed final asset; its final approval was not established. The final hero uses the existing route-bound source:

`public/projects/shorecrest/media/user-provided-shorecrest-hero.jpg`

This reviewer directly checked the local image: **1280 × 955 pixels; 245,394 bytes**. The reviewed frame uses that source unchanged, with an explicit “Shorecrest · North Flagler · Architectural rendering” caption. It is not represented as a photograph or as the current built condition.

The lead and asset reviewer own the source-approval assessment. A public path or a “user-provided” filename alone would not establish approval; this review does not expand that claim. The final image choice is compositionally preferable to the old soft waterfront hero, but should not be described as a newly obtained high-resolution source.

The original closing bridge illustration is a separate asset and remains unchanged.

## Final correction verification

The actual integrated screenshots still showed heavy uppercase NORA directory/story links after the first consistency pass. The lead identified a later inherited rule and strengthened the scoped selector in source revision `a26faad73518e8663bcc8177e3f1b63dfa90b12d`.

**Verified resolved.** Independently opened and inspected both `nora-final` screenshots. The two actions now visibly use the intended mixed-case, medium-weight treatment, with clear separation and no clipping. The lead's supplied computed-style output reports **13 px, weight 500, `text-transform: none`, height 44 px** for both links at 1440 and 390 px. I read that output; I did not independently run the browser computation. This agent's direct in-app-browser attempt returned “Browser is not available: iab,” so the lead's existing permitted capture pipeline supplied the recaptures. No source edits were made by this reviewer.

## Verification limits

- Static screenshots do not verify animation, reduced-motion behavior, target-size compliance, contrast ratios, keyboard operation, links, forms or compare behavior. The lead's build/functional checks are separate evidence.
- Map tile capture states varied: the earlier delivery review was partial on desktop and gray on mobile; the final full-page frames show gray desktop tiles and rendered mobile tiles. This report treats desktop tile loading as unresolved capture/runtime evidence and does not diagnose a CSS regression or silently count it as a polished final desktop map.
- Project facts, latest-story selection, route correctness and the full provenance trail were not re-audited in this bounded visual review.
- No source files, assets, facts or features were edited by this reviewer. Only review notes and inspection crops were written under `.runtime/v2-sprint3/`. No tests, commit, push, merge or deploy were performed by this reviewer.

**Handoff:** present the actual gains and the source/pacing limits together. The result is substantially more cohesive and appropriate to the intended audience; the review does not claim perfection or substitute for the lead's independent validation.
