# Sprint 3 final buyer and visual accessibility review

Reviewed 2026-09-19 by the assigned Astra reviewer on `http://127.0.0.1:5186/`, in the explicitly requested PR #115 worktree, branch `codex/site-overhaul-v2`. Final source HEAD: `a26faad73518e8663bcc8177e3f1b63dfa90b12d`. This is a focused follow-up to `buyer-review.md`, not a new site audit. No source edits, commits, pushes, or live form submissions were made by this reviewer.

**Buyer experience: 9/10.** This is an expert heuristic, not a user-study result. The sampled experience communicates a multi-building research service, preserves clear routes to buildings and comparison, and now resolves the earlier contrast findings. No release-blocking buyer-flow or visual-accessibility regression was observed in this bounded pass.

## Current visual judgment

- The Shorecrest tower is a strong architectural image while the broad headline, independent-guidance eyebrow, supporting text, Buildings/Compare navigation, and hero actions clearly describe a resource covering multiple buildings. The visible caption explicitly says **“Shorecrest · North Flagler · Architectural rendering.”** It is not presented as a photograph of the entire city or an unlabeled composite.
- At 1440px, the text occupies the quieter left portion of the image and the tower has enough room on the right. At 390px and 320px the tower remains recognizable, body text and both research actions remain legible, and the caption is contained within the image. The inline Ask WPB band follows the hero without covering its content.
- The comparison block offers a clear two-building choice and readable preview cards. At 320px the long Ritz-Carlton option is clipped inside the native selector, but its full name is visible immediately below in the preview card; this is a minor reading limitation, not lost selection context.
- The NORA image, explanatory copy, and story action form a coherent editorial module. The final typography correction produces normal-case, 13px actions and is visibly calmer and easier to read than the earlier tiny bold uppercase style.

## Measured checks

Chromium browser checks used 1440×1000, 390×844, and 320×844 viewports. Colors below come from the rendered elements and their backgrounds; translucent text/control backgrounds were composited over the rendered dark section color before contrast calculation.

| Element | Observed result |
| --- | --- |
| News eyebrow | `#755936` on `#eeefe7`, **5.60:1**, 11px. Previous 4.474:1 finding resolved. |
| Collection eyebrow and Completed status | `#755936` on `#f7f5ef`, **5.95:1**. Eyebrow 10.88px; status now 11px at all sampled widths. Previous 3.65:1 finding resolved. |
| Compare / Downtown Spotlight light eyebrows | `#c9b797` on `#102e34`, **7.32:1**, 11px. |
| Comparison field labels / select text | **8.58:1 / 10.42:1**. Native selects are 44px high. |
| Compare button / secondary contact link | **13.17:1 / 8.95:1**, both 44px high. |
| NORA all-stories link / story action | **7.85:1 / 13.17:1**. Final rendered font 13px, weight 500, `text-transform: none`, minimum and actual height 44px at 1440/390/320. |
| Horizontal overflow | Document and body widths equal viewport widths: **1440 / 390 / 320px**. |
| Latest-developments anchor | Click reaches `#latest-developments`; settled heading y-position **108.5px desktop / 96.5px mobile**. Heading remains exposed. |

These are sampled contrast results, not a claim that every page or every pixel of text over photography has received an accessibility certification.

## Fresh interaction checks

- Hero **Explore buildings** opens `/buildings/`; **Compare your options** opens `/compare/`, H1 “Compare buildings.” Both were clicked at 320px in this final pass.
- At 320px, both homepage comparison selects receive keyboard focus. Tab moves from Building 1 to Building 2 with a visible `rgb(143,185,173)` 2px outline. Selecting Alba Palm Beach and Olara updates the cards; Enter on the focused **Compare These Buildings** button opens Compare with both projects selected.
- **Ask about this shortlist** carries `project=alba-palm-beach`, `projects=alba-palm-beach,olara`, `interest=compare`, and `lead_capture_context=compare_shortlist`. Opening it at 320px displays “Compare my shortlist” and both names in the visible request card. No form was submitted.
- In the final NORA module, Tab moves from **View all Downtown Spotlights** to **Read Downtown Spotlight** with the same visible 2px sage focus outline. Enter opens `/downtown-spotlight/nora-district-downtown-transformation/`, H1 “Why the NORA District Could Reshape Downtown West Palm Beach.”
- Comparison and NORA controls measure at least 44px high. These are pointer/keyboard and touch-target geometry checks in desktop Chromium; a physical touch device was not used.

## Evidence and change boundary

The first measurements inspected the current hero/contrast changes while they were uncommitted over `3905a12f9d6ec616e700652ff736918e8b5b6417`. The coordinator then committed the scope and made one final NORA selector-specificity correction. A bounded fresh read and screenshots on `a26faad73518e8663bcc8177e3f1b63dfa90b12d` confirmed the corrected NORA styling at all three widths and its keyboard navigation. Hero action destinations were also rechecked on that final HEAD. The earlier hero, label, anchor, overflow, and shortlist evidence remains applicable to the unchanged components.

Artifacts are under `.runtime/v2-sprint3/delivery-review/`:

- `buyer-final-hero-1440.png`, `buyer-final-hero-390.png`, `buyer-final-hero-320.png`.
- `buyer-final-latest-1440.png`, `buyer-final-latest-390.png`, `buyer-final-latest-320.png`.
- `buyer-final-compare-1440.png`, `buyer-final-compare-390.png`, `buyer-final-compare-320.png`, `buyer-final-compare-focus-320.png`.
- `buyer-final-nora-1440.png`, `buyer-final-nora-390.png`, `buyer-final-nora-320.png`, `buyer-final-nora-focus-320.png` — replaced with final normal-case 13px version.
- `buyer-final-shortlist-inquiry-320.png`.

Supporting rendered measurements and route snapshots are `.runtime/v2-sprint3/buyer-final-measurements.txt`, `buyer-final-controls.txt`, `buyer-final-compare-snapshot.txt`, `buyer-final-nora-delta.txt`, and `buyer-final-hero-actions.txt`.

## Remaining limits

- The 10px mobile image caption and 10.88px collection eyebrow remain small. The caption is present and visually readable in the captures; increasing it would be a comfort refinement. The comparison and NORA action text are now larger.
- The mobile homepage is long. The four persistent primary navigation choices and latest-development anchor keep research destinations accessible, but actual buyer testing would be needed to assess discovery depth and conversion.
- Network interception blocked every non-GET/HEAD request, lead endpoints, and Google analytics hosts. No real lead or external analytics event was delivered. The Maps `GetViewportInfo` POST was aborted by that guard and produced a browser resource error; it is not evidence of an application defect. Maps functionality and delivery were outside this review.
- An initial CLI interception setup used an unavailable `URL` constructor and was replaced before collecting evidence. One exploratory native-select keyboard sequence navigated to comparison before the following NORA locator, causing a harness timeout; the focused comparison button and NORA keyboard paths above were separately verified. No complete native-select keyboard interaction claim is made.
- This pass does not establish cross-browser behavior, screen-reader behavior, physical-device use, full WCAG conformance, canonical-fact correctness, production deployment, or live lead delivery.

At the final source check, tracked source files were clean. The coordinator subsequently updated `docs/SITE_OVERHAUL_V2_PROGRESS.md`; that file and the existing untracked `docs/evidence/site-overhaul-v2/sprint3/` directory remain outside this reviewer's changes. This report and its browser evidence are local runtime artifacts. Release decisions remain with the coordinator and Brooke.
