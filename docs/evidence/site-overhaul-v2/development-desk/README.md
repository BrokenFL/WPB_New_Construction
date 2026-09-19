# Development Desk — image-led editorial presentation

This sprint continues draft PR [#115](https://github.com/BrokenFL/WPB_New_Construction/pull/115) from `5041bc179ac784300fa01fd32e399f2e8668c4d4`. It changes the homepage Development Desk presentation only. The warm Shorecrest hero, its responsive derivatives, masthead, closing artwork, approved reporting and publication pipeline remain established.

## What the rendered review found

The baseline desktop lead spanned two rows and pinned its links at the bottom, leaving a conspicuous empty field beneath the copy. On phones, all three stories read as similarly weighted mini-articles: the section measured 1,468 px at 390 px wide and 1,754 px at 320 px. It offered sound dates and links but little visual invitation.

The implementation uses one wide image-led feature beside two thumbnail briefs. Headlines and buyer takeaways are shortened only for this homepage surface, with explicit guards against the original title, takeaway and image path. A source correction falls back to current approved wording. Complete article reporting is untouched. Dates remain separately labeled Published and Source report, and the same `publishedExternalNews.slice(0, 3)` controls genuine publication order.

The lead's actions now follow the text naturally. Secondary stories retain short summaries and distinct full-story/research links. On phones their images stay small, rather than becoming three large image cards. Research routes remain the building directory, North Flagler corridor and Alba project page.

## Images and source boundaries

[Source inventory](source-inventory.md), [ordered story snapshot](bounded-story-snapshot.json) and [asset records](asset-record.json) document the actual pixels, dimensions, hashes, approval evidence and limits.

- Terra/Frisbie: approved existing downtown bridge/waterfront image, labeled **West Palm Beach · editorial context**. It is not the acquisition site.
- La Fontana: existing approved-story corridor aerial, labeled **Corridor context**. It does not identify La Fontana or a proposed replacement building.
- Alba: approved project marketing image, cropped toward its tower and explicitly labeled **Alba · Architectural rendering**. The completion claim comes from the approved article, not this rendering.

The first two assets' visual origins are not certified by their records. Approval for placement does not prove photographic or architectural accuracy. The asset-organizer MCP was unavailable; the existing SSD warehouse README/manifests and website registries were used read-only. No asset approval was silently promoted.

Four WebP derivatives were produced with deterministic crop, resize and encoding operations. No image-generation model was used in this Desk sprint, no scene content was invented and originals were preserved. The previously generated warm hero is unchanged. The lead's existing 1920 px website JPEG had an earlier 1672 px source; the new 1400/780 px exports do not recover detail lost or invented upstream.

## Visual review and correction

[Initial art direction](initial-art-direction.md) records the baseline diagnosis and composition. Its candidate wording was refined to the exact source-faithful wording implemented above. A separate Astra extra-high reviewer inspected complete sections and consecutive phone views, then executed the reader journeys. No aesthetic score or conversion uplift is claimed.

The first focused correction round widens the desktop lead heading to remove an orphaned final word and caps the stacked tablet image while preserving the phone's natural wide ratio. The first tablet-cap implementation briefly affected phones; review caught that regression before acceptance. A second, final correction holds the tablet image to the full column width while capping its height; an automatic-width cap had left a gap beside it. Capture cleanup preserves the functioning Skip to content control rather than hiding it for screenshots.

## Evidence and handoff status

Visual implementation/capture source: `2ab98d65ec41eff5ba948e6bba15a5e35668b0be`. Final source including the nonvisual article-entry and QA repairs: `b23a4db9e7adb9d5ed8b74e702bc0d08c56a5f36`. The Desk renderer, styles and derivatives are identical between those two commits. The built-preview captures below include the entire section and its final date note. No cropped fragment is used to hide spacing.

| Width | Before | After | Section height, before → after |
|---|---|---|---|
| 1440 | [Desktop](before/desk-section-1440x1000.png) | [Desktop](after/desk-section-1440x1000.png) | 874 → 855 px |
| 390 | [Phone](before/desk-section-390x844.png) | [Phone](after/desk-section-390x844.png) | 1468 → 1314 px |
| 320 | [Narrow phone](before/desk-section-320x812.png) | [Narrow phone](after/desk-section-320x812.png) | 1754 → 1370 px |

Tablet sections: [1024 px](after/desk-section-1024x900.png), [768 px](after/desk-section-768x900.png). [Before measurements](before-metrics.json) and [built after measurements](after-metrics.json) preserve exact values. Shorter page height is an observed layout change, not evidence of faster task completion or conversion uplift.

The [fresh independent review](fresh-review.md) accepts the final composition after two focused correction rounds. It includes four consecutive exact 390 × 844 phone screens from the masthead through discovery, plus actual returning-visitor and first-time-buyer route evidence. It separates successful navigation from the existing Alba factual-continuity defect.

Responsive loading is recorded in [the built DPR checks](srcset-check-built.json) and [tablet crop measurements](tablet-1024-check-built.json). All three Desk images are lazy and have reserved aspect ratios; known derivatives also carry intrinsic dimensions. The lead selects 780w/68,406 bytes at desktop DPR 1 and on phones, and 1400w/168,496 bytes at desktop DPR 2. Thumbnails are 23,202 and 15,784 bytes. See [derivative hashes and crop recipe](derivatives.json) and [reproduction script](create-derivatives.mjs). These are encoded-file measurements and browser-selection checks, not field-performance measurements.

Built preview: `http://127.0.0.1:5188/#latest-developments`, local only with writes refused. Editable preview: `http://127.0.0.1:5186/`.

Models actually used: `gpt-6-astra` / `xhigh` for direction, consequential decisions and fresh critique; `gpt-5.6-luna` / `max` for inventory, implementation, captures and technical verification. No substitution or new paid service.

[Technical evidence](qa-summary.md) distinguishes the rendered Desk checks from broader integration gates. Those gates exposed a source-provenance counting error in repetition QA and a direct-article initialization defect. The bounded follow-up preserves the exact approved-image guard, adds meaningful repetition coverage, and changes the article's `inlineImg` helper to an equivalent hoisted declaration. It changes neither article content nor homepage composition. Final typecheck/build, 107 unit tests, 37 launch checks, 1,159-file gatekeeper, 445 Desk checks and 84 Chromium/WebKit checks passed. Exact gate SHAs and results are recorded in that evidence; the exact pushed head and current CI state are recorded in the PR handoff.

The full mobile opening is reviewed as masthead → hero → Desk → discovery. The inherited hero remains 820 px tall on the measured phones; the Desk begins at about document y=1064 at 390/375 px. Any non-blocking hero-height adjustment belongs to the final typography/mobile-composition pass, not this task.

## Explicit limitations carried into integration

1. Independent developer/architect verification of the AI-provenance hero remains required before release. AI-to-AI agreement is not architectural proof.
2. The legacy carousel performance test must be reconciled with the static-hero contract while preserving meaningful loading/performance assertions. It is not disabled here.
3. La Fontana's approved source date is July 18, while its source URL contains July 9. A direct publisher read was blocked by robot verification. This sprint verifies display against approved records; it does not resolve that editorial discrepancy or silently change the date.
4. The reviewer encountered an Alba project-page status inconsistent with the completed-project news. A pre-sprint built-preview probe independently reproduced the issue at `5041bc179ac784300fa01fd32e399f2e8668c4d4`: [static output says Completed](prebuild-alba-project-5188-facts.png), while the [loaded client hero says Under Construction](prebuild-alba-project-5188-client.png). Navigation works, but the hydration conflict needs separate integration review. No project fact is changed in this presentation sprint.

See [final integration requirements](../../../SITE_OVERHAUL_V2_FINAL_INTEGRATION.md). This remains a draft review, with no merge, deployment, new paid service, parked automation activation or canonical-fact change.
