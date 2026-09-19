# Sprint 3 — final candidate design review

Reviewer: **GPT-6 Astra xhigh**. Date: 2026-09-19. Two distinct passes were performed: UI/art direction, then graphic design. Grades below are fresh subjective judgments against an exacting luxury editorial standard; they do not inherit earlier grades or certify runtime/accessibility behavior.

## Decision and grades

**No blocking visual defect remains in the inspected frames after the two final corrections.** The candidate is a meaningful improvement and a coherent result for this bounded polish sprint. It is not yet an elite, 9-plus luxury execution.

| Pass | Grade | Assessment |
|---|---:|---|
| UI / art direction | **7.8 / 10** | The arrival now has a clear visual idea, strong primary action, shared alignment and recognizable place context. Project selection and the closing guidance composition are substantially better. Long mobile pacing, the desktop news panel's large blank area and some inherited component differences keep it below the elite bar. |
| Graphic design | **7.4 / 10** | Serif hierarchy, ink/ivory contrast, large project imagery and the original bridge create a credible identity. The enlarged hero remains visibly soft; small labels and action treatments still vary between sections, and the quieter new treatments sit beside heavier older ones. |

These grades are not an argument for more unbounded changes in this sprint. The remaining material limitations can be stated honestly without introducing new imagery, facts, features or another concept pass.

## Evidence inspected

All paths below are under `.runtime/v2-sprint3/review/`:

- `home-1440-cover.png` and `home-1440-full.png`.
- `home-390-cover.png` and `home-390-full.png`, with readable inspection-only crops of news, corridors, projects, compare, guidance, advisory and footer.
- `home-320-cover.png` and `home-768-cover.png`.
- `news-1440.png`, `projects-1440.png`, `advisory-1440.png`.
- Reopened the corrected `home-768-cover.png` and freshly captured `advisory-390.png` after reporting the two issues below.

The final mobile advisory detail includes a visible focused “Skip to content” link. That is a focus/capture state, not evidence of an always-visible design element or regression. An unfocused capture is preferable for presentation.

## Pass 1 — UI and art direction

### Arrival

**Desktop: strong.** The solid masthead flows into a single full-width waterfront hero. The message, brand and lower content now share a 72 px left alignment. The primary explore action is unmistakable; compare is present without competing equally. The fixed caption is readable. Removing the boxed, heavy utility rail has reduced visual clutter.

**390 px mobile: good.** Header, navigation, image, proposition and actions form one composition. White text is visibly readable against the localized dark treatment. Both primary and compare actions remain clear. The image has meaningful waterfront context, and the mobile caption sits in a deliberate location rather than colliding with the actions.

**320 px opening: acceptable.** The brand descriptor, contact button and eyebrow wrap, but the supplied cover has no visible clipping. Headline, body, primary action, compare link and caption remain readable. This is a successful narrow-screen accommodation rather than a particularly elegant composition; the wrapping and stacked controls are apparent. Only the 320 px opening was supplied, so this is not a full-page 320 px certification.

**768 px opening: good after correction.** The floating Ask WPB button originally covered the right side of the waterfront caption. The refreshed capture visibly places the caption safely to its left. This finding is resolved.

### Information and pacing

The development desk has a real lead story now. All three visible publication dates, source-report dates, implications and onward links remain attached to their stories. The typography conveys editorial seriousness without requiring weakly related thumbnails.

The lead article's bottom-aligned links still leave a large blank field on desktop. That is visible compositional emptiness, not missing content. It is acceptable within this bounded candidate, but it limits the sense of precision. Mobile remains a long, text-heavy sequence before the corridor images; the news section alone occupies well over a screen. The content is readable, but the page is not a quick scan.

The project section now has a clear title/action row, useful image scale and quieter link actions. Shorecrest's building is restored as the subject rather than a sliver at the edge. The source-specific crop works on desktop and mobile. The lighter actions let the images lead.

Compare, the downtown spotlight, map, buyer guidance, floor-plan access and contact destinations remain visibly present in the supplied full-page evidence. Their operation was not tested in this visual review. Compare and spotlight still have different shades and heavier controls than the updated hero and advisory treatments; this is the main remaining visual discontinuity in the middle of the page.

### Guidance and closing

The advisory composition is materially improved. A smaller team logo and wider text panel now balance a large guide image and properly scaled headline. It reads as two purposeful pieces rather than a tall advertisement beside a shallow leftover card.

The mobile Market Intelligence label and “View all guides” initially appeared after the complete article card. The refreshed `advisory-390.png` shows that header correctly placed before the image/card. This finding is resolved.

The original bridge remains the distinctive closing illustration. Its role as a recognizable ending is preserved. The mobile footer is readable, with sufficient separation between identity, review method and contact information.

## Pass 2 — graphic design

### What now works

- The ink masthead and warm paper surfaces establish a clear color hierarchy.
- The large serif hero and editorial headings carry the page without ornamental effects.
- The primary hero action, quieter utility links and lighter project actions have distinct, understandable emphasis.
- Shorecrest's crop and the restored height of the guide image show deliberate subject selection.
- The original bridge illustration gives the site a memorable closing identity.

### Why the graphic grade is not higher

1. **The hero has insufficient native detail for its prominence.** The supplied source inventory identifies a 1280×720 source enlarged to 1920×1080; the desktop rendering visibly retains soft building edges and window detail. Enlargement does not restore detail. The composition is stronger than the source image quality.
2. **The small-text system is still mixed.** Some areas use fine, restrained labels; corridor buttons, compare controls and spotlight actions retain very small bold capitals. A few links place arrows tightly against their text. Those differences are small individually but prevent the page from feeling completely art-directed as one system.
3. **The vertical rhythm is improved locally rather than fully unified.** The clean hero and balanced final advisory area are more assured than the long news void, the substantial gaps around mobile cards and the denser legacy buyer-guidance block.
4. **Image identity is approval-bound, not independently established here.** The screenshot's corridor/hero appearance cannot prove photographic origin, geographic accuracy or current conditions. “Approved source” and “verified photography” are different claims. This review makes no new factual claim about their origins.

These are limitations, not recommendations to invent replacement architecture, alter project facts, add stock imagery or generate a more attractive fictional skyline.

## Findings resolved during this review

| Finding | Final evidence | Result |
|---|---|---|
| Tablet floating Ask WPB overlapped hero caption | Reopened updated `home-768-cover.png` | Resolved; caption is fully clear of the button. |
| Mobile Market Intelligence heading appeared after its article | Fresh `advisory-390.png` | Resolved; heading and directory link now introduce the card. |
| Earlier Shorecrest card lost the building to the crop | `projects-1440.png` and mobile project crop | Resolved; tower is recognizable and well framed. |
| Earlier tall team card / shallow guide imbalance | `advisory-1440.png` and fresh mobile detail | Resolved; the pairing is purposeful at both sizes. |

## Evidence limits

- This review did not operate links, selectors, forms, keyboard navigation, text zoom or reduced-motion behavior. The lead's functional/build checks are separate evidence.
- Screenshots demonstrate visible readability, not measured contrast compliance or target-size compliance.
- No animation was evaluated from static captures.
- The supplied desktop full-page map has gray tiles while the mobile map contains rendered tiles. This review does not infer a new source regression from that capture-state difference and excludes it from the visual grades pending the lead's runtime verification.
- Exact latest-story selection, project facts, approvals and image provenance were not independently re-audited. The review checked visible preservation and composition only.
- The 320 px review covers the opening only. The 390 px review covers the full page.
- No source files, assets, facts or features were edited by this reviewer. Only review notes and inspection crops were written in `.runtime/v2-sprint3/`. No tests, commit, push, merge or deploy were performed by this reviewer.

## Final focused refinement requested after this assessment

The lead requested one further CSS-only consistency pass because the grades remain below the desired bar. The grades above apply to the inspected candidate, not to that pending refinement. These are the three exact highest-impact targets:

1. **Unify action typography and alignment.** Target `.corridor-guide-card > a:last-child`, `.home-spotlight-module a` and `.home-compare-actions > a/button` within the V2 scope. Use 13 px / 1.4, weight 500–600, normal tracking, `text-transform: none`, a consistent 10 px arrow gap and at least 44 px targets. Clear the corridor action's inherited 22 px inline margin so it aligns with the image/title. The NORA directory link should be quiet text; retain only one outlined story action. Keep the compare submit action filled with paper color. This replaces the visible tiny gold/bold uppercase treatment without altering destinations or copy.
2. **Unify the adjacent compare and NORA surfaces.** Give `.home-compare-launcher` `--v2-home-ink`, matching the header/NORA ink family. Use subtle translucent surfaces and restrained light borders for compare selects and `.home-compare-preview`, rather than distinct blue boxes. Select text should be around 14 px and weight 500; secondary labels 10–11 px, weight 500; project names about 20 px in the existing serif. Verify long selected project names still fit at narrow sizes. Preserve the data and selection behavior.
3. **Complete the quiet project metadata treatment.** Ensure `.home-featured-grid .project-card-kicker span` actually loses the visible gold badge boxes: no border/background/padding, 10–11 px and weight 500. Remove the separate rounded boxes from `.project-card-intel` children, retaining the shared top/bottom hairline and readable values. This finishes the earlier intended treatment; inspect the rendered result because inherited styles currently win over some V2 rules.

A source-approved, materially sharper project rendering is a valid alternative hero candidate if explicitly captioned with the project name and “rendering.” Featuring one real development is compatible with a multi-building resource. Selection still requires visual inspection at desktop/mobile and source approval; this is not authorization to generate a new building. The required original closing bridge illustration remains separate and unchanged.

**Handoff:** apply only the selected bounded refinements, then recheck the actual changed frames. Do not present the existing scores as having improved before seeing that result.
