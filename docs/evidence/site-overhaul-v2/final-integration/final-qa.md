# Final V2 integration QA

- Date: 2026-09-20
- App source/test HEAD: `13d8f79cedfd062c5cc6c90c53456bde097a5d30`
- Preview origin: `http://127.0.0.1:5188`
- Scope: final integration evidence only; no application source, tracked docs, commit, push, merge, or deploy changes.

## Results

| Check | Command | Result |
| --- | --- | --- |
| Synthetic consent build | `VITE_GA4_MEASUREMENT_ID=G-QATEST1234 npm run build` | PASS; prerendered 109 routes; commercial, floorplan, SEO, authorship, and social-preview postbuild steps passed. Vite emitted the existing large-chunk warning. |
| Integrated journeys | `PREVIEW_ORIGIN=http://127.0.0.1:5188 npm run qa:integration` | PASS; 12/12 intercepted lead submissions, both 1440px and 390px journeys passed, PII excluded, consent passed, duplicate tags/events false, native/no-JavaScript journeys passed. |
| Keyed Maps | `MAPS_QA_ORIGIN=http://127.0.0.1:5188 npm run qa:maps-keyed` | PASS; desktop and mobile home/map routes passed with real loader response, decoded tiles, zoom tile changes, responsive dimensions, and mobile control geometry. Keys and external query URLs were omitted. |
| Plain build restore | `npm run build` | PASS; restored build completed with the same existing large-chunk warning and postbuild steps passed. |
| Plain preview smoke | `curl` against `/`, `/market-notes/`, `/projects/alba-palm-beach/` | PASS; all returned HTTP 200 and rendered a title. |
| Lead endpoint refusal | `POST /api/leads` with empty JSON | PASS; plain static preview returned HTTP 405. |

The final preview on port 5188 is serving the plain build. Lead submissions and analytics were intercepted during browser QA; no external lead or analytics payload was sent.

## Existing nonblocking limits

The strict asset audit recorded 426 warnings and zero blockers. Warnings are retained as known nonblocking asset audit findings. The existing Vite warning reports chunks over 500 kB after minification. These checks do not establish CI, merge, deployment, live health, or installed-device use.
