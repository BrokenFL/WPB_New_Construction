# PR115 — Shorecrest hero finish

This sprint starts at `ed370452c0cc3728d9723fba75010fc1b069acde` on `codex/site-overhaul-v2`. Scope is the existing hero: imagery, responsive composition, localized text contrast, truthful labeling and their checks. The solid masthead, commercial copy, buyer paths, news and all other homepage sections are retained. Main remains separate; no merge or deployment is authorized.

## Visual problems and decision

The previous 1280 × 955 hero enlarged a relatively soft source, covered much of the tower with a broad teal veil and put the mobile headline across the upper facade. Its rendering caption had weak contrast over a busy background. The hero needed a better source and a resolved image/text relationship, not a new page composition.

The highest-resolution approved Shorecrest file found is a 6000 × 4000 entrance image with Adobe Firefly provenance. A 2252 × 1266 terrace-side image was also inspected. Neither offers the full-tower recognition of the selected approved 1672 × 941 panorama. The [source and edit record](source-and-edits.md) documents actual files, approval records, hashes and AI provenance.

Two actual built-in ImageGen edits were produced from that panorama, retaining its camera and architectural composition. Both were compared in the rendered homepage at 1440, 390 and 320 pixels. Treatment B, warm mineral, was selected: A's stronger blue felt more aggressive against the ink masthead; B retained luminous warm-white facade edges and quieter water/sky. Visual review found no structural drift at the inspected resolution; this is not a claim of surveyed or pixel-identical architectural verification.

The portrait composition is independently cropped around the tower with the crown and right facade intact. It uses its own source in the picture element, rather than squeezing the desktop frame into a phone. No source is upscaled. Contrast is restricted to the desktop copy zone, lower mobile copy zone and small caption backing. No animation, dependency or new functionality is added.

## Review and delivery evidence

| Evidence | Desktop | Mobile |
| --- | --- | --- |
| Starting implementation | [Before](before-desktop.png) | [Before](before-mobile.png) |
| Treatment A in the homepage | [A](comparison-a-desktop.png) | [A](comparison-a-mobile.png) |
| Treatment B in the homepage, before corrections | [B](comparison-b-desktop.png) | [B](comparison-b-mobile.png) |
| Final implementation | [After](after-desktop.png) | [Full opening](after-mobile.png) · [844px viewport](after-mobile-viewport.png) · [320px hero](after-320-hero.png) |

Two focused correction rounds followed selection. The first strengthened only the text zones and caption backing. It solved readability but produced a visible mobile dark band; [the first correction](correction1-mobile.png) is retained. The second broadened that mobile fade and reduced its lower opacity. No further aesthetic iteration or motion was added. The [fresh graphic critique](final-graphic-review.md) accepts the final captures at 1440/1024/768/390/320 and states the source-resolution, portrait-crop and tall-mobile-hero tradeoffs.

The [source/edit record](source-and-edits.md), [exact prompts](prompts.json), [selected generated master](selected-b-master.png), [derivative manifest](derived-manifest.json) and [reproduction script](reproduce-derivatives.mjs) preserve the image work. The source originals remain in the approved warehouse, unchanged. Optimized derivatives are draft PR assets and have not been promoted into the approved warehouse or deployed.

## Validation and exact source

- Tested implementation: `e1b0becf89bb8e0e1c6c60e1c142376746d0ced9`. Source/asset changes are five implementation/check files and five new WebPs; later handoff changes contain documentation/evidence only. The exact pushed PR head and final-head CI are recorded in the PR handoff, separately from this tested source.
- [Final QA summary](qa-summary.md): typecheck/build, **102/102 unit tests**, **37 no-write launch checks**, **1,155-file gatekeeper**, and **72/72 Chromium/WebKit checks** passed. Asset audit: **0 blockers**, **0 broken references**, 426 unchanged baseline advisories. Leads and analytics were intercepted; no actual submission or production measurement is claimed.
- [Responsive loading checks](loading-qa.json): one eager/high-priority hero element, successful desktop/mobile selection at DPR 1 and 2, and correct 390 → 1440 → 390 switching on both editable and built previews. Five captured widths have zero overflow or page errors. Desktop files range from 95,058–226,696 bytes; portrait files are 66,256/80,628 bytes. Browser selection does not invent source detail on high-density displays.
- [Contrast sanity check](contrast-sanity.json): conservative white-underlay calculations at actual non-whitespace character positions passed the sampled text-size thresholds on both previews. Desktop minima: 4.64:1 eyebrow, 5.98:1 headline, 5.07:1 body, 6.34:1 secondary link, 5.17:1 caption. Mobile minima are 6.08:1 at 390 and 5.30:1 at 320. The initial box-edge diagnostic included empty space beyond the headline and is retained in the report; the corrected character-position check resolves that false alarm. This is bounded numeric evidence, not whole-site accessibility certification.
- The optional old `check-hero-performance.mjs` still fails two carousel expectations. The identical failures were reproduced from baseline `ed370452c0cc3728d9723fba75010fc1b069acde`; the required launch/performance gates and current static-hero loading checks pass. No assertion was relaxed to hide this stale check.
- Closing artwork `/assets/home/wpb-end-cap-bridge-v01.png` is unchanged: SHA-256 `2b27c45fac60037286a047f0ca0b27f9178d53a733658da1b7fd6737ebaf9ffd`. Primary checkout is clean main at `e0ff6b43faf9cec1b5450e6e830ca32466181b92`; unrelated work and asset-warehouse originals were preserved.

Built preview: `http://127.0.0.1:5188/` (local only, writes refused). Editable preview: `http://127.0.0.1:5186/`. No merge, deployment, canonical-fact change or parked-automation activation occurred. Physical-device, field-performance and conversion-uplift claims are not made.

Models actually used: `gpt-6-astra` with `xhigh` for art direction and critique; `gpt-5.6-luna` with `max` for inventory, bounded implementation, captures and tests. No substitution. Built-in ImageGen was used twice; its underlying model ID was not exposed. No CLI/API fallback or new paid service was used.
