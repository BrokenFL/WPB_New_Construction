# PR115 final integration check plan

Historical pre-freeze plan. Completed execution, the actual viewport/browser matrix and any limitations are recorded in `final-qa.md` and the evidence index; planned coverage here is not a test result.

Baseline identity: `codex/site-overhaul-v2` at `ca7893df1315fd484382a515b99c7ffb0fecd199`. The built preview at `http://127.0.0.1:5188/` was used for the before captures. Lead POSTs, analytics, tag-manager, and non-local mutations were intercepted; no lead or analytics payload was sent.

## Existing evidence to reuse

- `research/scripts/check-v2-milestone2.mjs` covers the prior 84-assertion Chromium/WebKit M2 route, image, keyboard, compare/inquiry, consent, analytics, and intercepted 503-to-200 checks. Rerun after the source freeze; it is not evidence for the Alba mismatch or browser back navigation.
- `research/scripts/image-repetition.test.mjs` covers repeated-image thresholds, derivative counting, source-path provenance, and stale derivative invalidation. `check-image-repetition.mjs --no-write` remains the static/rendered audit.
- `research/scripts/check-integrated-journeys.mjs` covers native and SPA home/buildings/projects/floorplan/inquire paths, browser back, consent denial/grant/tag dedupe, and 12 intercepted submissions. It must run against the synthetic consent build so the prompt is available.
- `research/scripts/check-maps-keyed.mjs` covers the authorized Maps loader, tiles, zoom, mobile controls, first-visit consent geometry, and eight cases. It must run against the same synthetic build; never print the key or request a replacement service.
- `check-analytics-safety.mjs`, `check-performance-budget.mjs`, `check-hero-images.mjs`, and `check-image-mapping.mjs` retain the source, budget, asset, and consent gates. The previous `check-hero-performance.mjs` carousel assertions describe obsolete markup and are replaced by the static responsive hero check.
- Development Desk before captures live in `output/playwright/final-integration/before/` with the same intercepted Playwright workflow. Full-page captures must wait for lazy images to become natural-width, scroll back to the top, then capture; consecutive phone captures remain a separate masthead-to-footer sequence.

## Missing coverage to implement

### Future-news isolated fixtures

Exercise the production selector/presenter seams with in-memory records only; do not write approved-news or generated data. The matrix must prove:

- a new `publishedAt` becomes the lead and the former oldest card drops from the three-card set;
- fewer than three records render one or two cards and an empty set renders no Desk module;
- a changed source title, buyer takeaway, or source image independently invalidates the matching display override;
- a long headline remains the supplied title and remains addressable; a missing image omits media without inventing a default image;
- project, corridor, and directory destinations resolve independently;
- publication date, source publication date, and event date retain distinct labels/values rather than being collapsed.

The fixture test must also cover direct article load, reload, and browser back after navigation. Fixture data must never reach the network or public source files.

### Static responsive hero

Replace the obsolete rotating-layer checks with a runnable local-browser contract: one eager/high-priority hero image, responsive `<picture>`/`srcset` selection at desktop and phone widths, non-zero reserved geometry, successful natural dimensions, no rendered secondary carousel layer, and reduced-motion-safe computed transitions. Keep the prior carousel script only as historical implementation context; do not require its dead layer/timer assertions for the static hero.

### Final browser matrix

Run Chromium and WebKit at 1440, 1024, 768, 390x844, 375x812, and 320 wide. Record full-page home/Desk output, consecutive phone masthead-to-footer output, direct/reload/SPA/back Alba continuity, keyboard focus traversal and return, 200% text zoom/reflow at representative desktop/tablet/mobile widths, no horizontal overflow or clipped CTA, and reduced-motion behavior. Physical iPhone/Safari and field performance remain independent evidence states.

## Bounded execution order after source freeze

1. Plain build; run focused source/unit checks and the static hero fixture against the real public bundle.
2. Build an isolated consent fixture with `VITE_GA4_MEASUREMENT_ID=G-QATEST1234`; run integrated journeys and keyed Maps. Sanitize all logs and never print credentials.
3. Restore the plain build and run the relevant smoke/M2 route checks so the preview ends on the real configuration.

Do not activate automation, add a paid service, merge, push, deploy, or claim CI/live/device proof from these local artifacts. Remaining source verification items are independent hero/developer confirmation and La Fontana date confirmation; raw JSON-LD status omission is an existing safety boundary and is not a required structured-status emission.
