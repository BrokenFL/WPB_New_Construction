# Phase 2 Batch 5 — Real-person authorship + trust progress

Updated September 9, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`. Merged PR: #83.

## Status

**IMPLEMENTED / TESTED / APPROVED / MERGED / DEPLOYED / LIVE-VERIFIED. NOT MEASURED.**

Brooke explicitly authorized completing the previously tested release in the September 9 continuation handoff. PR #83 was marked ready and merged with an exact-head guard; no application changes were added during release. Production/main is `0713e029cc251fc9a49c5e429fdda6ac85e46202`.

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

No unsupported transaction totals, board credentials, fabricated editorial roles, private contact PII or blanket review claims are added by this layer.

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

The earlier documentation successor `5e2383d487e915b0e6b18b2c077dd48566f3dbeb` independently passed complete workflow `34310103373`. Its historical artifact digests remain:

- keyed: `sha256:d79fcc5d0d467ab830d14d7908de94e0b4e4ebb96b8703678c98d646b06ff7fb`
- no-key: `sha256:7524bf8c86b03cc118b3a63b25a8e37777d091c3258ee6dc52ebdbc0fd9c4e5e`

The exact documentation-only head subsequently approved and merged was **`918f3e7ccda5904f624c44e4a6869d33f1a50ef2`**. Full workflow **`34408524796`** passed keyed, no-key and aggregate review verification before merge.

Final candidate artifact digests:

- keyed: `sha256:80c690070fcd71a58539975738f4f8e7b253f9d950c4459c129fae0c5cb973b5`
- no-key: `sha256:0b33e8d0167fdaaaeb4aca1a1c02ec0cbb5cc7b464741801f79c837aee8afb94`

These candidate workflows were no-deploy review evidence; production publication occurred only after the explicit continuation-handoff approval below.

## Approved release and live closeout

| Record | Identity / result |
|---|---|
| Approval | Brooke's September 9 continuation handoff explicitly authorized this previously tested Batch 5 release |
| PR #83 | Merged September 9 at 22:02:59 UTC; expected head `918f3e7...` enforced |
| Production/main merge | `0713e029cc251fc9a49c5e429fdda6ac85e46202` |
| Normal main-push deployment | `34410192415`, job `102662568075`: build, launch QA, gatekeeper and actual Cloudflare deployment SUCCESS |
| Cloudflare deployment | `73e4c622.wpbnewconstruction.pages.dev`; first attempt; no duplicate manual deployment |
| Live acceptance | `34410472433`: authorship, buyer journeys, Olara and aggregate gate SUCCESS |
| Harness-only branch / SHA | `p2-batch5-release-live-verification` / `adee38875736e56ae40754b34e28a97b3156afd2`, branched from released main; application byte-identical |

The deployment's immediate homepage check still saw old bundle names. That was not treated as proof of publication and did not prompt a second deployment. Later production-browser verification established the new live authorship and preserved journeys on the canonical domain.

### Production verification counts

- Authorship job `102663452270`: **48** desktop/mobile × JS-on/off cases; current visible/accessibility H1 contract; one canonical graph; exact stable IDs and assigned relationships; Rosewood → Maison → Rosewood SPA schema sequence.
- Buyer-journeys job `102663452512`: **4** project document views; **12** same-session sequences / **24 intercepted POSTs**; exact project/current intent/first-touch/PII checks; **2** actual Maps loader/tile/zoom cases; **8** commercial/corridor/comparison/Olara journey views.
- Olara job `102663452604`: **6** plans, **12** desktop/mobile views and **12 intercepted exact-plan requests**; image/PDF/canonical/schema/discovery and Alba exclusion.
- Aggregate gate `102665150736`: SUCCESS.

Downloaded evidence was SHA-256 verified. Representative desktop/mobile authorship screenshots and the mobile Olara plan were visually inspected; JSON results confirmed all counts. Artifacts:

| Suite | Artifact | SHA-256 |
|---|---|---|
| Authorship | `10127149615` | `778f4689d9e57ffaf3d5b1bf4e286d0041e5fe941f403fa488f8438190bede68` |
| Buyer journeys | `10127208087` | `fa37fab72a7be7b6706e1f19acdae407c40a175092dd70e5c784b07703892e1b` |
| Olara | `10127100297` | `fd97cce4d62d2bcda44c91ba8e3620425af16e5ba2a69939cd7fdf0c46ea7018` |

The temporary live adapters changed only audit origin/file reads and the older live harness's stale heading expectation to the current stronger semantic contract. No production application, lead behavior, project fact, deployed test contract or Maps deployment guard was changed.

## Remaining limitations

- Scott remains unassigned to page-level authorship/review until responsibility is genuinely confirmed.
- This batch is not measured.
- Every automated live lead POST was intercepted. The in-browser Turnstile stub does not validate real server CAPTCHA or actual database/email/CRM delivery and duplicate-record behavior.
- `docs/BATCH4_MANUAL_PRODUCTION_LEAD_ACCEPTANCE.md` remains unexecuted and reserved for Brooke's one intentional manual test.
- Real production lead fulfillment and actual GA4 transport are outside Batch 5.
- PR #75 / GA4 configuration remains parked.
- Alba’s unpublished HTML page remains unpublished.
- 3D map and Three.js floor-plan implementation remain separate tracks.

## Next action

Batch 5 is closed through live verification. Continue the separately reviewed Batch 6 conversion/concierge audit from current production main on `p2-batch6-conversion-concierge`. See `docs/P2_BATCH6_CONVERSION_CONCIERGE.md`. No Batch 6 production release is authorized by the Batch 5 approval.

This documentation-only closeout is carried in the Batch 6 draft review rather than triggering another production deployment solely to refresh a ledger. PR #83's live release closeout is already recorded on the merged PR.