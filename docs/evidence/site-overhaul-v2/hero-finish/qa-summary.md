# PR115 Shorecrest hero finish — final QA summary

QA ran at exact HEAD `e1b0becf89bb8e0e1c6c60e1c142376746d0ced9` against selected B master [`selected-b-master.png`](./selected-b-master.png), SHA-256 `ee339fa8a9587e7e394cce1518be6c2b12dd25e82c5a964d957af46c0bf520bf` (1672 × 941). Raw command logs remain under the ignored `.runtime/hero-finish/qa/` directory.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `VITE_GA4_MEASUREMENT_ID=G-QATEST1234 npm run build` | Passed; production Vite build and postbuild prerender completed. Existing large-chunk/plugin-timing warnings were emitted. |
| `npm test` | Passed: 102/102 unit tests across seven suites. This included `qa:launch:no-write` with 37 checks and 0 findings, plus `qa:gatekeeper` across 1,155 files. |
| `npm run assets:audit` | Passed with findings: 0 blockers, 0 strict blockers, 426 warnings, 0 broken asset references, and 0 local path leaks. The 426 warnings match the tracked baseline; audit reports were captured and restored byte-identically to HEAD. |
| `node research/scripts/check-v2-milestone2.mjs` | Passed 72/72 across Chromium and WebKit at 1440, 390, and 320 widths against `http://127.0.0.1:5188`; configured model `gpt-5.6-luna/max`. See [`browser-regression.json`](./browser-regression.json). |

The browser check intercepts lead POSTs and analytics/tag-manager requests locally. No external lead write occurred; the aggregate QA log reports `interceptedSubmissions: 0` and the launch suite ran with `QA_NO_WRITE=1`.

The focused legacy `node research/scripts/check-hero-performance.mjs` check is recorded as an advisory failure in [qa-summary.json](./qa-summary.json): eager/high-priority counts remain exactly one each, while the current static hero does not expose the older rotating-layer `data-home-hero-layer="next"` contract or the `wpb-geography-map-hero` rotation source. Running the same script against a temporary fixture reconstructed from baseline commit `ed370452c0cc3728d9723fba75010fc1b069acde` produced the identical two failures, so this is a pre-existing stale-carousel advisory rather than a new QA finding.

Final visual acceptance remains with root/Astra. These checks establish local source/build/browser evidence and do not certify production deployment, release, or installed-user behavior.
