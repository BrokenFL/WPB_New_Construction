# Phase 2 Batch 5 — Real-person authorship + trust progress

Updated September 9, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`. Draft PR: #83.

## Status

**IMPLEMENTED / TESTED; NOT APPROVED / NOT DEPLOYED / NOT MEASURED.**

Batch 5 adds a truthful, reusable authorship/review model for actual contributors while preserving the existing production architecture, buyer journeys, Maps, inquiry attribution, privacy boundaries and unpublished Alba state. PR #75 / GA4 remains parked and untouched.

## Responsibility assignments

Visible responsibility is intentionally narrow:

- Brooke Snader — author of `/about/`.
- Brooke Snader — author of `/methodology/`.
- Brooke Snader — reviewer of `/projects/rosewood-residences-west-palm-beach/`.
- Brooke Snader — reviewer of `/projects/maison-dor/`.
- Scott Gordon — verified contributor profile only; no author/reviewer assignment until page-specific responsibility is actually confirmed.
- Other project, corridor, answer, comparison, update and market-note routes do not inherit mechanical attribution.

Stable Person schema IDs:

- Brooke Snader: `https://www.wpbnewconstruction.com/about/#brooke-snader`
- Scott Gordon: `https://www.wpbnewconstruction.com/about/#scott-gordon`

Approved public professional facts used by the registry:

- Brooke Snader — Broker Associate, Florida BK3291335.
- Scott Gordon — Broker Associate, Florida BK383426.
- The Scott Gordon Team / Douglas Elliman.

No unsupported transaction totals, board credentials, fabricated editorial roles, private contact PII or blanket review claims are published.

## Implementation contract

- Contributor data lives in the allowlisted public contributor registry.
- Visible bylines/review labels remain compact and connect to `/about/` and `/methodology/`.
- About exposes useful real-person profiles rather than thin standalone biography pages.
- Agent Skill and generated llms discovery explicitly prohibit inferring authorship/review on unassigned pages.
- Attributed pages use the existing canonical `wpb-static-structured-data` script. Person nodes and `author` / `reviewedBy` relationships are merged into that one `@graph`; no separate authorship JSON-LD graph is emitted.
- Existing WebPage, project, Breadcrumb and Organization entities are preserved.
- Stable Person `@id` values are reused rather than generating page-specific aliases.

## Heading semantics

Batch 5 exposed a genuine pre-existing project-heading problem: the compact project identity and the active hero were simultaneously exposed as H1s. The compact duplicate was semantically demoted while preserving the visual identity treatment; the canonical active project/hero identity remains the single semantic H1.

The heading contract now verifies:

- exactly one active/visible H1;
- exactly one accessibility-tree H1;
- one meaningful H1 in JavaScript-disabled canonical HTML;
- desktop and mobile;
- attributed About/Methodology/project pages;
- existing project, corridor, comparison and floor-plan heading regressions;
- authorship UI itself introduces no H1.

The Batch 4 browser regression was updated only after this semantic change made its old exact selector stale. The replacement continues to protect Rosewood and Maison d’Or project identity, JS-on/off rendering, desktop/mobile presentation, CTA behavior, inquiry payloads, source qualifications and layout.

## Historical failure record

Historical failures are retained rather than rewritten as successes:

- `34304036063` — implementation checks passed until the workflow called nonexistent `npm run qa:agent-skill`; repository script is `npm run qa:agent-skills`.
- `34308247126` — workflow typo corrected; Existing buyer journeys exposed the stale Batch 4 exact-H1 regression contract after the intentional semantic heading correction.
- Earlier Batch 5 diagnostics also exposed and corrected the duplicate JSON-LD path: authorship and the Batch 4 hydrated project enhancer now maintain the existing canonical graph instead of accumulating a second script.

Corrective Batch 4 QA commit:

`f8e6b8f3a7bdf7b8a0f0fc880d056af5351909d4`

This correction changed the stale QA contract only. It did not alter Rosewood/Maison copy, Batch 5 authorship assignments, schema content, inquiry behavior or project facts.

## Final tested implementation

Exact final tested corrective/application SHA:

`f8e6b8f3a7bdf7b8a0f0fc880d056af5351909d4`

Complete implementation workflow:

`34309439506` — **SUCCESS**

Results:

- keyed candidate: SUCCESS;
- no-key candidate: SUCCESS;
- aggregate Batch 5 review verification: SUCCESS;
- production ancestry / protected surfaces: PASS;
- typecheck and production build: PASS;
- seven Batch 5 authorship source contracts: PASS;
- 48 desktop/mobile, JavaScript-on/off, accessibility-tree authorship/schema checks: PASS;
- one canonical JSON-LD script / one graph plus SPA schema navigation sequence: PASS;
- complete `npm test`: PASS;
- existing buyer journeys, including Batch 4 Rosewood/Maison regression: PASS;
- standard and strict asset audits: PASS;
- SEO / GEO / internal-link checks: PASS;
- Agent Skills: PASS;
- accessibility / form checks: PASS;
- gatekeeper and privacy / PII protections: PASS;
- keyed deployment preflight and actual Google Maps: PASS;
- intentional no-key production-deployment rejection: PASS.

## Documentation-head verification

The documentation successor at `5e2383d487e915b0e6b18b2c077dd48566f3dbeb` was independently run through the complete no-deploy workflow `34310103373` and passed keyed, no-key and aggregate review verification.

Review artifacts retained by that workflow:

- keyed artifact digest: `sha256:d79fcc5d0d467ab830d14d7908de94e0b4e4ebb96b8703678c98d646b06ff7fb`
- no-key artifact digest: `sha256:7524bf8c86b03cc118b3a63b25a8e37777d091c3258ee6dc52ebdbc0fd9c4e5e`

The artifacts include desktop/mobile and JavaScript-on/off screenshots plus Batch 5 and existing-journey QA evidence. They are review artifacts only; no production deployment occurred.

## Remaining limitations

- Brooke has not approved the Batch 5 presentation for release yet.
- Scott remains unassigned to page-level authorship/review until responsibility is genuinely confirmed.
- This batch is not measured.
- Real production lead fulfillment and actual GA4 transport are outside Batch 5.
- PR #75 / GA4 configuration remains parked.
- Alba’s unpublished HTML page remains unpublished.
- 3D map and Three.js floor-plan implementation remain separate tracks.

## Next action

Keep PR #83 draft. Present the final desktop/mobile authorship treatment and verification evidence to Brooke. Do not merge or deploy until explicit release approval.