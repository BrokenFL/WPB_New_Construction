# Development Desk — technical evidence

[Machine-readable final gate summary](final-gates-summary.json).

Final tested source SHA: `b23a4db9e7adb9d5ed8b74e702bc0d08c56a5f36`. Visual captures were made at `2ab98d65ec41eff5ba948e6bba15a5e35668b0be`; Desk rendering, styles and derivatives are identical. Typecheck/build were run on the final source immediately before its commit; final npm and browser suites below bind the committed SHA.

## Rendered checks

- `npm run typecheck`: passed.
- `npm run build`: passed, including postbuild/prerender. This final build used no synthetic GA4 environment override; the browser report records analytics as disabled/local-only. Existing bundle advisories remain. An earlier build used a synthetic ID, but that is not the final build configuration.
- Expanded Milestone 2 regression check: **84/84 passed**, Chromium and WebKit at 1440, 390 and 320 px. [Exact results](milestone2-qa.json) cover news dates/order, shortlist, comparison, selected-plan inquiry context, consent, keyboard and responsive behavior, plus direct loads and reloads of all three newest stories with title/body and initialization-error assertions.
- Focused Desk check: **445/445 passed** at 1440, 1024, 768, 390, 375 and 320 px, plus desktop/phone DPR 2. [Result](final-qa-result.json) checks approved-record order, homepage wording, image files and selection, source preservation, readable article journeys and research destinations. [Executed harness snapshot](executed-qa-harness.mjs.txt) preserves the exact script; it was run from `.runtime/development-desk/qa-final.mjs` with the stated SHA gate.
- `npm test`: **passed**, exit 0; **107/107 unit tests** across seven suites, **37 no-write launch checks** with zero findings, and **1,159-file gatekeeper**. Image-repetition QA passed with 124 image references checked and 3 separately reported source-provenance entries. The five added fixtures run in the existing integration suite. Full local stdout is retained at `.runtime/development-desk/npm-test-final.log`.
- All Desk images loaded; document/body and Desk had no horizontal overflow or JavaScript page errors. Every viewport recorded one console error from deliberately intercepting the existing Maps request. No external lead or analytics delivery was performed, and no mutation request escaped the harness.

Date accuracy here means agreement with the approved news records. It is not independent verification of external publisher dates. The La Fontana source-date discrepancy remains explicitly unresolved.

## QA harness corrections

The initial purpose-built harness timed out on a directly loaded article. Its first failed report remains locally at `.runtime/development-desk/final-qa-initial-assumption-failure.json`. The 445-check run exercises actual Desk clicks through full articles and related research; it does not establish healthy direct article loading. A separate investigation confirmed a real initialization defect and is recorded below.

The next draft incorrectly expected date-only publication values instead of full approved ISO timestamps, long visible captions instead of concise labels plus provenance metadata, physical raster width from browser density-corrected `naturalWidth`, and a 1400 px desktop DPR 1 download despite the 780 px candidate covering its slot. It also conflated blocked Maps with analytics, intentional clipped mobile navigation with document overflow, and article metadata with visible reporting. Those assumptions were corrected against source records, real encoded-file dimensions, DOM semantics and the existing consent contract. The failed draft is preserved locally at `.runtime/development-desk/final-qa-harness-adjustment-failure.json`.

No existing buyer-flow, consent, loading or launch assertion was disabled to obtain these results. The source news JSON, article body data and homepage visual sections outside the Desk remain unchanged from the starting head.

## Integration findings resolved within this task

The broader `npm test` initially stopped at image-repetition QA. Its string scanner counted the Desk's literal `sourcePath` identity guard as a fourth image placement, although the rendered thumbnail has its own separately counted URL. The corrected classifier uses TypeScript syntax to recognize only direct `sourcePath` properties in the returned `homepageDeskDisplayVariants` array, retaining them in a separate provenance inventory. Ordinary references, derivative paths, repetition thresholds, context rules and rendered adjacency checks are retained. Focused fixtures prove a fourth real use still blocks, unrelated `sourcePath` fields remain counted, and a changed article image drops the reviewed derivative. No approval was invented or filename exempted.

[Direct article diagnosis](direct-load-diagnosis.json) found that prerendered title/body remained readable with JavaScript disabled, but hydration caught `TypeError: ia is not a function` and left an empty article view. The built `ia` symbol was independently traced to the late `const inlineImg` arrow function used by `renderNewsArticleBody`, not the already hoisted `renderResolvedContentImage`. The baseline has the same vulnerable source ordering; a separate baseline browser failure was not reproduced. The bounded repair changes only `inlineImg` into an equivalent function declaration. Startup order, article HTML, data and routing architecture are unchanged. Final exact-SHA verification passes fresh direct loads and reloads of all three stories in Chromium and WebKit at 1440, 390 and 320 px, including title/body, JavaScript/console initialization errors and local asset failures. The check waits for module loading to settle before navigating or reloading; WebKit had correctly reported aborted prior-page module loads when the first draft navigated prematurely. No error class is filtered away and settling timeouts fail the check.

## Evidence limits

Successful navigation does not resolve the pre-existing Alba SSR/client status contradiction. Screenshot review is not physical-device or assistive-technology certification. No conversion or field-performance uplift, live health, deployment, production analytics or delivered-lead claim is made. The optional legacy carousel test remains a separate final-integration item; its obsolete expectations were not changed in this sprint.
