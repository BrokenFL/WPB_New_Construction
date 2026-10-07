# Downtown Spotlight presentation

Downtown Spotlight shares the Development Desk's editorial heading, lead image,
two supporting stories, serif headlines, publication dates, and reading links.
The homepage shows three stories; `/downtown-spotlight/` shows those same three
followed by a responsive archive.

`src/data/marketNotes.ts` remains the content source. The selector in
`src/lib/downtownSpotlight.ts` includes only `status: "published"` and
`category: "Downtown Spotlight"`, ordered by `datePublished` descending.
Editing `dateModified` does not promote an older article to the lead position.
Ties retain source order. The source array is not mutated.

`src/main.ts` uses this shared renderer with the existing content image resolver.
The index's article schema uses the same published-only selector.
`research/scripts/prerender-static-routes.mjs` uses it for generated homepage and
index HTML. Direct article routes, canonical URLs, article content, and the
publishing workflow continue to use their existing sources.

Styles live in `public/assets/styles/v2-editorial.css`. The homepage section ID
is `downtown-spotlight`; the homepage visual-flow check uses this hook. Generated
illustrations retain a visible image label.

Local preview: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5177`.
Focused checks: `npm run typecheck`, `npm run build`,
`node --experimental-strip-types --test research/scripts/downtown-spotlight.test.mjs`,
and `npm run qa:homepage-visual`.

## Local review handoff — October 7, 2026

Branch: `main`. Base HEAD and verified remote `main`:
`9ed3eda9efd4ed3bb9c1f4ad506744e7ba26d5c7`.
At this local review handoff, the redesign was uncommitted; no push, CI run,
merge, or deployment had been performed for it.

Changed scope:

- `src/lib/downtownSpotlight.ts`: published story selection and shared rendering.
- `src/main.ts`: homepage, index, and index schema consumers.
- `public/assets/styles/v2-editorial.css`: index and responsive archive styles.
- `research/scripts/prerender-static-routes.mjs`: generated HTML consumers.
- `research/scripts/check-homepage-visual-flow.mjs`: updated section hook.
- `research/scripts/downtown-spotlight.test.mjs`: publication and archive contracts.
- `package.json`: includes those tests in integration checks.
- This document: presentation contract and review handoff.

Validation passed: typecheck, production build, 39 integration tests,
17 homepage visual-flow checks, crawlability for 115 priority routes,
1,287 unique internal route links, image-alt quality, Content Studio safety,
and whitespace checks. Desktop (1440px) and phone (390px and 320px) views were
reviewed; the phone views had zero horizontal overflow. The generated homepage
has three Spotlights, the generated index has 12, their lead stories match,
and all 12 article routes exist. The generated index was also inspected with
JavaScript disabled. A stalled concurrent build was stopped; standalone builds
completed successfully with the existing bundle-size warning.

Local built preview: `http://127.0.0.1:5177/#downtown-spotlight` and
`http://127.0.0.1:5177/downtown-spotlight/`.
Screenshots are in ignored `output/playwright/downtown-spotlight/`;
reports and logs are in ignored `.runtime/`.

## Release authorization — October 7, 2026

Brooke explicitly authorized committing and publishing this eight-file redesign.
Release checks passed before staging: asset audit (zero blockers, broken asset
references, or local path leaks), typecheck, production build, the full `npm test`
suite, launch QA, and gatekeeper QA. The existing push-to-`main` Cloudflare Pages
workflow is the authorized deployment path. Commit, remote push, workflow result,
and live verification are recorded separately in the release handoff.

Live review found that returning browsers could retain the prior unversioned
editorial stylesheet for four hours. The stylesheet link in `index.html` now
uses `?v=20261007-spotlight`; prerendered pages inherit that version so returning
visitors load the new heading and archive rules.
