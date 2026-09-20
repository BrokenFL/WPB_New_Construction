# V2 final composition and integration

This milestone continues draft [PR #115](https://github.com/BrokenFL/WPB_New_Construction/pull/115) from `ca7893df1315fd484382a515b99c7ffb0fecd199`. It preserves the solid masthead, selected warm Shorecrest pixels and responsive image files, image-led Development Desk, three-newest-story pipeline and original closing bridge artwork.

## What changed and why

The starting phone composition gave Compare and Latest separate rows, pushed Latest below the first screen and crowded it against the rendering caption. Tiny secondary navigation, inconsistent mobile gutters, crowded arrows and forced NORA headline breaks interrupted the page. The final composition retains the imagery and copy sizes while reducing the phone hero minimum from 820px to 760px, arranging the secondary hero actions together, improving readable secondary links and allowing natural headline wrapping. Two focused visual rounds closed the CTA cascade conflict. Enlarged-text findings were treated as functional defects and repaired separately from aesthetic scoring.

The Alba repair concerns rendering precedence. The existing canonical projection supplies `Completed`; stale showcase copy supplied `Under Construction`. The established resolver now governs the rendered status with copy as fallback. This does not approve a new project fact: the status originates from the existing qualified automated projection, not a newly claimed manual review. Its structured-data omission remains intentional. Project forms now truthfully describe a manual inquiry rather than implying that submission opens an already public floorplan library.

The static hero no longer exposes five unused carousel descriptions to screen readers. Its replacement QA measures actual responsive source selection, delayed-image reserved geometry, response bytes, one eager/high-priority request, stability and reduced motion. Future-news fixtures exercise the existing production presenter with isolated records, including stale display-override invalidation and missing-image/long-headline layouts. The one-story fixture exposed and repaired a count-specific footer claim; the source-report qualification remains.

## Visual review and captures

[Fresh independent review](fresh-review.md): **8.2/10 overall**, desktop 8.4, phone 8.2, tablet 7.9. These are subjective design judgments, not measured buyer or conversion outcomes. The inherited tablet 2+1 featured grid is less resolved and remains a candid limitation. The review included actual keyboard Latest → story → building, back navigation and compare → inquiry context. It requested one final CTA correction and identified the static-hero/form semantic defects; all were addressed.

[Before evidence](before/README.md) records the loaded opening and hero-to-Desk transition at the starting head. The [final rendered inspection](visual-inspection.md) links complete desktop/tablet/phone pages, the consecutive 390 × 844 sequence, WebKit viewport evidence, shared headers and enlarged-text repairs. Earlier round-1 screenshots are historical: one 1024px capture had an unpainted lead image and does not serve as final loading evidence.

[Direction](art-direction.md) and [implementation record](visual-implementation.md) explain the bounded composition decisions. This Mac's rendered fonts were Iowan Old Style and Avenir Next; browser-only Georgia/Arial fallback stress was inspected. Identical Windows/Android typography, physical iPhone use and assistive-technology certification are not established.

[Final GPT-5.6 Sol extra-high review](sol-final-review.md): **GO** to commit and push the scoped draft update, with no draft-level blocker. It independently retained the tablet limitation, WebKit evidence boundary and two owner decisions.

## Independent source findings and owner decisions

[Source verification](source-verification.md) and its comparison sheets use official architect/developer collateral, not the prior AI source as architectural proof. Broad massing and terrace language are corroborated. Facade, podium and foreground details differ materially in the selected AI treatment. The full official developer original supports the waterfront dock/pergola's presence; an initial crop omitted it and cannot support an invented-dock claim. A rendering label does not resolve the remaining detail uncertainty.

**AWAITING OWNER DECISION — hero:** approve website rights/use for the developer EXT02 original, then make a source-faithful non-generative warm grade within the current composition. The warehouse marks that original `rights review required`; no byte-identical approved original was found. It also carries Topaz upscale metadata, which is not recovered factual detail. No asset was promoted or replaced in this milestone. The current selected hero remains an explicit release issue.

**AWAITING OWNER DECISION — La Fontana:** July 18 is supported by Discover South Florida's publisher metadata, while The Real Deal's permitted publisher record supports July 9. The approved record pairs July 18 with the TRD URL. Choose July 18 + DSF as the cited record, retaining TRD as underlying reporting, or July 9 + TRD with DSF retained as secondary. Use the existing editorial approval process. Website publication on September 15 and the stored event/discovery date remain distinct; the latter is not transaction-date proof. Direct TRD access was WAF-blocked and no bypass was attempted. No approved data changed.

## Verification and delivery identity

Implementation source freeze: **`1d0dc31e15d0ae1916ad187f2575317436f9ea68`**. Test-only correction: **`13d8f79cedfd062c5cc6c90c53456bde097a5d30`**, updating the milestone check to the intentional count-neutral Desk note. Only intended source/tests were committed; the later evidence commit contains documentation and captures.

[Final QA](final-qa.md) records the completed plain and synthetic builds, consent-gated journeys, keyed Maps run and restored plain preview. Results at `13d8f79`:

- typecheck, plain build and the full repository test command passed; the plain build prerendered 109 routes;
- final integration gaps passed **54/54** in Chromium and WebKit;
- static-hero performance passed **12/12** rendered checks with its responsive-source, request-priority, transfer-size, intrinsic-geometry and reduced-motion contract;
- the milestone browser suite passed **84/84** after correcting the stale count-specific expectation;
- integrated consent journeys passed with **12/12 intercepted lead submissions** and no real lead or analytics delivery;
- keyed Maps passed on desktop/mobile home and map routes with real decoded tiles and zoom changes;
- strict asset audit found **0 blockers**, **0 broken references**, **0 local-path leaks** and 426 retained warnings;
- final capture covered six Chromium sizes and three WebKit sizes with zero overflow or page errors. WebKit's offscreen `fullPage` paint limitation is documented; viewport sequences and element captures are the accepted visual proof.

Current-head GitHub CI and exact pushed head are recorded only after the evidence commit is pushed. The previous head's 12 green checks remain baseline evidence until then.

Runnable new coverage:

```sh
npm run test:homepage-news-fixtures
V2_ORIGIN=http://127.0.0.1:5188 npm run qa:final-integration-gaps
HERO_PERFORMANCE_BROWSER=1 V2_ORIGIN=http://127.0.0.1:5188 npm run qa:hero-performance
```

The gap tests default to both Chromium and WebKit. Browser hero QA is explicitly opt-in; a static-only invocation reports the browser phase as skipped. No skipped browser check may be represented as passed. Browser fixtures and submissions are isolated; no real leads or test analytics are sent.

Models used: Astra extra-high for the milestone's direction and independent art critique; Luna Max for bounded implementation and capture work; Luna low for the final bounded integration run. GPT-5.6 Sol extra-high performed the final consequential release-readiness review requested for this closing pass. No new paid service. The lead retained integration ownership.

The [integration checklist](../../../SITE_OVERHAUL_V2_FINAL_INTEGRATION.md) separates FIXED items, AWAITING OWNER DECISION items and NON-BLOCKING LIMITATION items. The local built preview is `http://127.0.0.1:5188/`; it refuses write requests. PR #115 remains draft. No merge, deployment, parked automation activation, field-performance uplift or release approval is claimed.
