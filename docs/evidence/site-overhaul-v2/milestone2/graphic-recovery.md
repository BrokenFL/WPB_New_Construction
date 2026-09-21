# Original homepage graphic recovery

Investigated September 19, 2026 using the tracked asset, clean-main renderer, Git history, baseline screenshots and the assets repository. This was a bounded Luna Max inventory, followed by lead and independent rendered review.

The original is [`public/assets/home/wpb-end-cap-bridge-v01.png`](../../../../public/assets/home/wpb-end-cap-bridge-v01.png): the pale ivory and blue West Palm Beach skyline, palms, bridge and reflections immediately above the footer in the [original desktop baseline](../before-home-desktop.png). The screenshot, renderer and actual asset agree; identification does not depend solely on the CSS class name.

- Original introduction: Brooke-authored commit `56885b541d1e2bed3634d462c1063748c497e841`, June 13, 2026, “Refine homepage carousel rails.”
- Asset: PNG, 1915×821, 1,032,347 bytes; SHA-256 `2b27c45fac60037286a047f0ca0b27f9178d53a733658da1b7fd6737ebaf9ffd`.
- V2 commit `7e894c2b14f1d0613e4464c0a58aac9cbd0db7af` added `.site-shell .home-end-bridge { display: none; }`. It did not delete the renderer or asset.
- No graphic-specific justification was found in the commit or focused V2 documents. General wording about less decorative repetition does not establish a reason for hiding this specific graphic.
- It is an existing tracked public website asset. No matching asset-warehouse manifest approval entry was found. The existing image-repetition audit accepts it as a shared source; that is QA evidence, not a separate warehouse approval record. Brooke's current request expressly authorizes restoration.

The milestone restores the same bytes, retains the complete aspect ratio, supplies intrinsic width/height and lazy loading, and integrates the artwork immediately before the footer. It is not cropped, regenerated or retouched. Desktop, 390px and 320px rendered reviews verify it. Fine skyline details naturally become smaller on narrow screens; its distinctive silhouette remains visible. See [mobile restoration](after-bridge-mobile.png).
