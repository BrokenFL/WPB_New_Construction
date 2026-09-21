# Sprint 3 — homepage art direction and visual polish

Date: September 19, 2026. Draft PR [#115](https://github.com/BrokenFL/WPB_New_Construction/pull/115), branch `codex/site-overhaul-v2`. This focused sprint builds on the implemented V2 without replacing its architecture, canonical data, publishing systems or buyer journeys.

## Review the result

- Built preview: `http://127.0.0.1:5188/` on Brooke's computer; GET/HEAD only, writes refused.
- Editable preview: `http://127.0.0.1:5186/`.
- Before: [desktop](../milestone2/after-home-desktop-cover.png), [mobile](../milestone2/after-home-mobile-cover.png), [full desktop](../milestone2/after-home-desktop-full.png), [full mobile](../milestone2/after-home-mobile-full.png).
- After: [desktop](after-home-1440-cover.png), [mobile](after-home-390-cover.png), [320px](after-home-320-cover.png), [tablet](after-home-768-cover.png), [full desktop](after-home-1440-full.png), [full mobile](after-home-390-full.png).
- Details: [news](after-news-1440.png), [buildings](after-projects-1440.png), [advisory and guides](after-advisory-1440.png), [mobile guides](after-advisory-390.png).

## Visual problems and changes

The [initial art critique](before-critique.md) found a fragmented split opening, insufficient photographic detail, generic component repetition and weak lower-page framing. The first full-width bridge treatment improved hierarchy but remained too soft. A strict [intermediate review](design-review-cycle2.md) scored it 7.8 for art direction and 7.4 for graphic design; those scores triggered another focused refinement rather than being presented as completion.

1. **Arrival:** solid deep-ink masthead and one image-led composition, shared gutters, white serif type, one primary discovery action and quieter compare/latest links. The hero grows with its contents. Initial copy matches existing commercial copy so hydration does not change the headline's geometry.
2. **Image strategy:** existing Shorecrest project rendering provides a distinct architectural subject and calm sky for typography. Explicit project/rendering labels prevent a generic skyline or completed-building implication. Top/right focal positioning preserves the tower. Project cards are taller and Shorecrest's card crop now keeps the tower in frame. The original closing bridge is unchanged.
3. **Editorial rhythm:** news has one clear lead with two secondary stories, all three real publication/source dates and onward buyer paths. Utility navigation is quiet. Project metadata loses badge boxes. Compare and NORA share the ink family, readable action typography and restrained controls.
4. **Closing composition:** advisor identity and guide feature receive balanced space, a smaller logo, a larger guide image and a heading that precedes its card on mobile. An internal image-production caption no longer appears on the homepage; the source article retains its provenance.
5. **Precision:** tablet caption avoids Ask WPB; small light-surface labels now have measured readable contrast; NORA action specificity is verified in the actual browser rather than inferred from CSS declarations. Final WebKit QA caught a 2px overflow at 320px: the long native select label painted beyond its control. Select-local overflow and ellipsis contain that text while the full building name remains in the adjacent preview. An initial container-minimum-width adjustment was insufficient and was removed; strict overflow assertions remain unchanged. [Final 320px WebKit control](home-320-webkit-compare-section-default.png) and [measured selection checks](native-select-320-final.json) document the fix.

Only five implementation files changed in this sprint: `public/assets/styles/v2-editorial.css`, `src/main.ts`, the two existing homepage image selections and the image-selection QA gate. The gate now checks the exact reused source and explicit rendering labels while retaining eager-loading, asset existence, accessibility/motion and integration checks. No guard was skipped to obtain a pass.

## Sources and motion

[Image decision and provenance](asset-inventory.md) records both alternatives, the unused 2200px candidate's approval limitation and the unchanged selected source. No ImageGen asset or invented building/view/amenity was introduced. No paid service was added. The selected hero is 245,394 bytes versus the preceding 630,114-byte file; this is not a claim of measured LCP or conversion uplift.

The hero is static. Fine-pointer project-image hover uses a restrained 1.02 scale, with short existing-style transitions. Reduced-motion contexts disable transforms/transitions. No 3D, parallax, animated reveal dependency or autoplay was added; the composition and imagery do the work.

## Exact identities and validation

- Before / remote branch at sprint start: `431b57dede3a23840f9c893d7c5ae2bedcbb27c8`.
- Final tested implementation: `63608542c1d9be95138c2c7606d3fe9aec82d80a`.
- Final evidence/push commit follows that source with documentation/screenshots only; its exact identity and CI runs are recorded in the PR handoff (a commit cannot contain its own final hash).
- Main remained `e0ff6b43faf9cec1b5450e6e830ca32466181b92`; primary SSD checkout stayed clean and unrelated worktrees were preserved. Planning brief v1.1 was read at `11bf0ce748c453dd247e2996da335049e1f25f0e`, without merging the planning branch.

### Separate review passes

| Perspective | Final assessment | Evidence |
|---|---|---|
| UI / art direction | **8.3/10**, from 7.8 in the strict intermediate pass | [Final design review](design-review-final.md) |
| Graphic design | **8.0/10**, from 7.4 in the strict intermediate pass | Same reviewer, distinct graphic-design pass; source detail and pacing still limit the result |
| Buyer experience | **9/10**, no blocking findings in the sampled journeys | [Fresh buyer review](buyer-review-final.md), [mobile compare](buyer-final-compare-390.png), [320px inquiry context](buyer-final-shortlist-inquiry-320.png) |
| Technical QA | **72/72**, plus targeted and preserved integration checks | [Technical review](technical-review-final.md), [regression results](browser-regression.json) |

These are internal heuristic judgments, not measured buyer outcomes or a claim of 9-plus luxury execution. The final art reviewer was deliberately stricter than earlier milestones; scores should not be compared as a continuous benchmark across different reviewers.

Astra extra-high was configured for creative direction, orchestration and the art/graphic and independent buyer reviews. Luna Max was configured for asset inventory, bounded CSS implementation and technical QA. One lead integrated the result. Codebase Memory and direct source reads supplied the architecture map; Product Design critique and Playwright workflows supported review. No model substitution was reported for this sprint.

Local runtime artifacts remain ignored in `.runtime/v2-sprint3/` and `output/playwright/sprint3-delivery/`. Selected screenshots and reviewer reports are committed here; full browser logs remain local. Some full-page map captures have gray offscreen tiles; dedicated visible-map runtime verification is reported separately rather than treating those captures as map-loading proof.

### Validation results

- **Final source `63608542c1d9be95138c2c7606d3fe9aec82d80a`:** TypeScript/build passed (117 prerendered HTML files); `npm test` passed all **102 unit tests**, full no-write launch gates and the **1,150-file gatekeeper**. No threshold was relaxed.
- **72/72** Chromium/WebKit checks at 1440/390/320px passed on the final source, after reproducing and fixing the native-select overflow. Covers dates/facts, related routes, compare/inquiry context, gallery and plan keyboard/focus, consent and intercepted inquiry retry/receipt behavior.
- Final tablet/focus/reflow probes passed at 768/1024 and half-width 384/512. Reduced motion and the actual 2px sage focus ring were verified. Half-width probes are reflow equivalents, not real 200% text-zoom or physical-device tests.
- Integrated journeys passed at `a26faad73518e8663bcc8177e3f1b63dfa90b12d`, with **12 locally intercepted submissions**; the later source change is confined to native select text containment. Lead/analytics transport was blocked or intercepted throughout.
- **8/8 real Maps scenarios** passed at the same checkpoint, with actual loaded/changed tiles, mobile controls and first-visit consent geometry. See [desktop map](verified-map-desktop.png) and [mobile map](verified-map-mobile.png). The later select-only change does not affect Maps.
- **24 route captures** at `8b6d70a3c3e07b7794abd07b5b837a806386faef` had no broken visible images, page errors or document overflow in Chromium. Updated full-home/NORA captures at `a26faad` and final cross-browser/delta verification follow the later two scoped CSS corrections. [Capture manifest and final source hashes](capture-validation.json) distinguish these identities.

Build/QA used synthetic GA ID `G-QATEST1234` for consent verification. No test lead or analytics event was delivered externally. The local preview itself refuses writes. Final GitHub CI is recorded separately in the PR handoff on the pushed documentation/evidence head.

## Limits and release boundary

The source hero is still 1280px wide and cannot provide native high-density detail at every display size. Mobile news remains a substantial reading section; compare/forms and some guidance components retain their earlier density. The main JS chunk is 535.31KB (118.35KB gzip) and retains Vite's >500KB advisory. Main bundled CSS is 189,430 bytes against its unchanged 189,440-byte budget; the separate V2 stylesheet is about 49.9KB raw. No architecture expansion or budget increase was used.

Screenshots, browser emulation and local tests do not establish physical iPhone/Safari behavior, field performance, conversion uplift, external lead delivery, production analytics or live health. Existing source-library rights caveats do not become new licensing clearance through this sprint. Parked automation remains parked. PR remains draft; no merge or deployment is authorized or performed.
