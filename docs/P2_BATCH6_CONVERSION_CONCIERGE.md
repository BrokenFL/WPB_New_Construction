# Phase 2 Batch 6 — conversion and buyer concierge

Updated September 9, 2026 UTC. Repository: `BrokenFL/WPB_New_Construction`.

## 1. Status and production boundary

**AUDITED / ARCHITECTURE PROPOSED / AUDIT HARNESS TESTED. BUYER-FACING BATCH 6 IMPLEMENTATION NOT STARTED; NOT APPROVED OR DEPLOYED.** This is the continuation of completed Phase 2 work, not a fresh site audit.

| Record | Exact identity / status |
|---|---|
| Current production/main | `0713e029cc251fc9a49c5e429fdda6ac85e46202` |
| Batch 5 / PR #83 | Approved by Brooke's continuation handoff, merged, deployed once and live-verified |
| Approved Batch 5 application | `f8e6b8f3a7bdf7b8a0f0fc880d056af5351909d4` |
| Approved documentation head merged | `918f3e7ccda5904f624c44e4a6869d33f1a50ef2`; exact-head complete review `34408524796` SUCCESS |
| Production deployment | `34410192415` SUCCESS, Cloudflare `73e4c622.wpbnewconstruction.pages.dev` |
| Post-deployment Batch 5 acceptance | `34410472433`: authorship, buyer journeys, six Olara plans and aggregate SUCCESS |
| Batch 6 review branch | `p2-batch6-conversion-concierge`, created from the above production SHA after the live gate passed |
| Exact tested audit/workflow SHA | `e88d68857345a0e2a485654cad2e36c5e411c357` |
| Complete audit/regression workflow | `34411817616`: desktop, mobile, keyed, no-key and aggregate SUCCESS |
| Review disposition | Separate **DRAFT** PR; no merge/deploy authority for Batch 6. PR metadata identifies the current documentation-only successor head. |

The production application, public assets, functions, dependencies, root HTML, Vite configuration and normal deployment workflow are unchanged by this draft. The workflow explicitly compares these protected surfaces against production. The only implementation here is the read-only audit collector and no-deploy review workflow; the remaining changes are documentation. Do not describe the proposed concierge, normalized intents or social fix as already shipped.

PR #83's merged-PR description now contains its release closeout. The tracker and `P2_AUTHORSHIP_TRUST_PROGRESS.md` carry the same closeout in this draft rather than triggering an unnecessary second production deployment for documentation alone. Full earlier release history remains in the existing progress documents.

## 2. Production audit and evidence

Ten required routes were collected at **1440 × 1000 desktop** and **390 × 844 mobile**:

`/`, `/buildings/`, `/map/`, `/floorplans/`, `/projects/olara/`, `/projects/rosewood-residences-west-palm-beach/`, `/projects/maison-dor/`, `/answers/olara-vs-ritz-carlton-vs-shorecrest/`, `/corridors/south-flagler/`, `/inquire/`.

**All 20 HTTP loads succeeded, with no captured JavaScript page errors or document-width overflow.** All 20 baseline viewport screenshots were visually inspected, with close review of the desktop Ask panel and mobile Rosewood controls. The detailed label/location/intent/destination/context/mobile/conflict inventory is [BATCH6_CTA_INVENTORY.md](BATCH6_CTA_INVENTORY.md).

Each route used a fresh browser context, blocked service workers, arrival and cookie-dismissed screenshots, raw-document metadata, hydrated snapshots, visible controls/forms, and first-party JS response sizes. Ask and generic Contact were opened where present; the collector never submitted a question or a lead. Site API/non-read requests, analytics and Turnstile were intercepted. Existing separate candidate/live regression suites use intercepted lead POSTs to verify request behavior.

| Evidence | Artifact ID | SHA-256 |
|---|---|---|
| Desktop inventory/screenshots | `10127607112` | `e5a6de760e386f71d13124c76c0be376c28ece11568404d86da8f631a58e0848` |
| Mobile inventory/screenshots | `10127621967` | `d043b0ede9000dc8d74c7472b800b7d7b4a4a0e0d302cee933ce88fa4359d8d2` |

Both archives were downloaded, hash-verified and inspected. Each contains `routes.json`, `duplicate-assets.json`, `source-evidence.json`, and route screenshots. They were collected around **22:24 UTC** and are retained by GitHub Actions for 14 days; the committed inventory and this document preserve the durable conclusions and reproduction instructions.

Evidence collectors and reproduction:

- `research/scripts/audit-batch6-conversion.mjs`
- `.github/workflows/p2-batch6-review.yml`
- After the repository's normal install/build and Playwright setup: `node research/scripts/audit-batch6-conversion.mjs 1440` and `node research/scripts/audit-batch6-conversion.mjs 390`.
- Re-running collects a new production observation, not a historical snapshot. Refresh the pinned production identity when main changes; do not relabel a newer deployment as this SHA.

The initial audit run `34411315722` successfully collected views but correctly withheld artifacts when its safety scan detected credential-shaped content. External Maps script query parameters and source examples were not suitable for review artifacts. The corrective harness strips external script queries and redacts credential-shaped JSON strings; the independent fail-closed scan remains enforced. The corrected full run passed. This was an evidence-handling correction, not a production Maps defect or a reason to alter the Maps deployment guard.

## 3. Verified conversion findings

### B6-01 — three shell families, no consistent concierge entry

Ask WPB appeared on **4/10 desktop routes**: map, floorplans, Rosewood and South Flagler. It appeared on **0/10 mobile routes** in the audited views. Home, Buildings, Olara, Maison, the comparison and inquiry did not expose that launcher at either audited width. The bespoke Olara/Maison shell, lightweight comparison shell and legacy shell offer different help/navigation patterns.

On the four desktop Ask routes, a separate floating Contact button and header Contact coexist. Mobile substitutes generic Contact or project-specific controls rather than the same research-to-human-help journey. On Rosewood, the captured mobile project update/text bar overlaps a generic Contact layer that remains CSS-visible in the DOM. One coherent interaction system is warranted; moving a single button is not enough.

### B6-02 — Ask offers text advice but no actionable handoff

`src/main.ts` around lines 3552–3620 implements local keyword matching, not a generative service or live inventory integration. Its answers contain route strings, but `appendChatMessage` inserts them using paragraph `textContent`. That yields plain text rather than clickable research links or an exact-subject human-request action. The wording promises to connect a buyer with an advisor without providing a structured contextual handoff inside the panel.

The four desktop Escape probes did not restore focus to the launcher. The current initializer has click-open/close and input focus on open, without its own Escape/focus-return handler. Require proper keyboard behavior in the replacement. This is not a claim that every site dialog is inaccessible or that all possible keyboard states were audited.

### B6-03 — browse and lead submission are conflated

The live inline project forms on **Olara and Maison d'Or** display **View Floorplans** as heading/submit label, while their hidden interest is **Request current availability**. They retain exact project context but submit a human inquiry, not a public-plan navigation action. The same phrase elsewhere on the page is an ordinary link to the library.

The cause is visible in `renderProjectInquiryForm` around `src/main.ts:8788`: display/submit reuse `rules.primaryCtaLabel` independently of `rules.inquiryInterest`. Correct this narrow semantic mismatch. Do not undo the six published Olara entity pages, their plan identity or the working Batch 4 summary CTAs.

### B6-04 — the five lead products exist under incompatible labels

Current labels include Request private floor-plan packet, Pricing + floor-plan packet, Request current packet, Request Floorplans, Compare buildings, Schedule private tour, Ask the team about this building, and generic Contact. The fresh inquiry page defaults to availability and ends with Contact the Team regardless of the inbound product label. Ten visible identity/qualification/message fields plus consent are presented together on mobile.

The released contextual resolver and first-touch/manual-selection protections are working and must remain. The opportunity is a common intent registry, visible current-request summary and consistent fulfillment wording, not another lead endpoint or a rewrite of attribution.

### B6-05 — the backend already provides the persistence/deduplication foundation

`functions/api/leads.js` looks up `submission_id`, handles an insert race by checking the existing record, returns an existing lead without another delivery on duplicates, and retains origin/rate/Turnstile checks. Preserve that path.

`functions/_shared/lead-utils.js:normalizeLead` currently bounds and copies `interest` as a string; it does not centrally resolve the proposed five canonical request intents. Existing project/plan/corridor/shortlist parsers and aliases must be adapted deliberately, not replaced by arbitrary query strings or inferred viewed-building history. No real production duplicate-record/notification outcome was tested here.

## 4. Proposed concierge architecture

**DISCOVERY → RESEARCH → DECISION → QUALIFIED INQUIRY**

Use **Ask WPB** as the consistent optional help entry across all shell families. Open a compact, accessible buyer-concierge panel that distinguishes published research from a human request. It is guided navigation and a team handoff, not a fake AI chat.

| Section | Buyer actions | Honest behavior |
|---|---|---|
| **Research** | Compare buildings; Find a floor plan; Which area fits me?; Ask a project question | Link to the existing comparison, plan and corridor guides. A project question that requires an answer becomes an explicit human request with its exact subject. |
| **Current information** | Request current availability; Get pricing + floor-plan packet; What changed recently? | Availability/packet requests go to the team through the existing inquiry system. Recent changes link to existing dated/source-qualified updates; unsupported questions can be sent to the team. No claim of live stock, instant pricing or automatic alerts. |
| **Talk to the team** | Ask Brooke / the team; Schedule a conversation or tour | Collect a request and preferred timing, then say the team will confirm. Do not imply a booked slot, immediate response SLA or guaranteed tour availability. |

Suggested explanatory text: **“Explore our published guides, or send a question to Brooke and the team. Current availability, pricing and tour requests are confirmed by a person.”** Final copy should match existing verified contributor responsibilities; this does not assign Scott page reviews.

### Placement and behavior

Keep prominent contextual availability/packet/shortlist CTAs on high-intent pages. They should proceed directly to the prefilled inquiry, **not force a detour through the concierge menu**. Ask WPB supplies the optional research/help route. Contact the Team becomes the human-action section/shortcut within that shared system, not an unrelated second floating widget.

Use one owned mobile help/action surface, with clear safe-area spacing and no overlap with cookie notices, project controls, Maps gestures or form submit. A page may retain a contextual primary CTA, but not multiple competing fixed bars. On `/inquire/`, favor the current-request summary and its submit action rather than another large competing Contact CTA.

The shared concierge must load independently and lazily. `src/bootstrap.ts` intentionally returns early for comparisons and individual-plan pages; do not import `main.ts` into those lightweight routes merely to obtain the launcher. Preserve crawlable research anchors and an inquiry fallback when optional enhancement fails.

## 5. Five-intent and context contract

Proposed internal IDs below are a design specification, not fields already persisted in production.

| Canonical request intent | Display label | Subject / fulfillment contract |
|---|---|---|
| `availability` | Request current availability | Exact project, plan, corridor or explicitly chosen multi-project context; manual current confirmation. |
| `pricing_packet` | Get pricing + floor-plan packet | Same exact subject, with a human-prepared/current packet; never a public-plan browsing gate. |
| `compare_shortlist` | Compare my shortlist | Explicit validated selected project IDs plus comparison identity; primary project does not replace the list. |
| `project_question` | Ask about this project / plan | Exact project and optional verified plan; question text stays in the lead request, never analytics. Generic team questions may omit a project but require useful message context. |
| `conversation_tour` | Schedule a conversation or tour | Conversation/tour preference and optional subject/time preference; team confirmation, not a booking transaction. |

One pure shared allowlist should map legacy labels/query aliases to these intents and consistent current display/fulfillment values. Both browser and server normalization must use it. Prefer a backward-compatible mapping into the existing stored `interest` and structured CTA context rather than introducing a database migration without a demonstrated need. Unknown/conflicting inputs must not silently assert a different intent. Review the existing delivery templates and test that the server-normalized outcome, not an unused client-only field, reaches storage and notifications.

Maintain a clear distinction between:

- **First touch:** initial landing/referrer/campaign, immutable for the existing attribution lifetime.
- **Current request:** intent, explicit project/plan/shortlist/corridor, click source and current submission route.
- **Manual edits:** later user choices on the form, which take precedence for that request.

A new explicit request replaces the previous request-scoped metadata as a unit, but never rewrites first touch. Clear incompatible plan/display metadata when a user deliberately changes the subject; preserve an explicitly chosen shortlist as a separate set even when its primary focus changes. Do not promote incidental map defaults, library browsing or recently viewed buildings into an explicit request.

Keep existing canonical project aliases, verified plan lookup, corridor/comparison parsers and server privacy boundaries. Analytics may receive only allowlisted intent/entity/location codes and sanitized paths; never question text, contact fields, preferred-time free text or submission tokens. Preserve the existing submission-ID lifecycle for retries and its backend race protection. Test any intentional-new-request ID change against the existing success/reset semantics; do not rotate IDs on retries or double-clicks.

The inquiry UI should display **what was requested, which subject(s), and that a person will respond**, with edit controls. Keep name/email and required consent; phone and qualification fields remain appropriately optional. Progressive disclosure can reduce visual burden, but must not remove the existing information needed for qualification or silently enroll a buyer in updates.

## 6. Controlled technical backlog

### Social previews — verified central defect, fix planned

**All 10 raw production documents use relative `og:image` and `twitter:image`.** Nine legacy routes become absolute HTTPS after hydration; the independent comparison remains relative. Therefore a browser-only correction will not satisfy the contract. Maison's raw and hydrated image paths also differ; preserve/select the approved route image consistently rather than prefixing a stale asset blindly.

The central raw writer is `research/scripts/prerender-static-routes.mjs`, which interpolates `route.ogImage` directly into both metas. The root `index.html` fallback also contains a relative image. Introduce/reuse one public absolute HTTPS image resolver across prerender, runtime, comparison/entity writers and fallback. Reject unsafe protocols, use the production canonical origin for site-relative assets and preserve approved HTTPS external assets only where intended. Regression-test raw HTML, JS-off, hydration and same-session navigation across route types, plus HTTP/image validity. The current audit draft **does not yet fix** production metadata.

### JavaScript — measured baseline, no giant refactor

First-party response bodies observed at desktop baseline:

| Route family | Decoded JS bytes | Recomputed gzip bytes |
|---|---:|---:|
| Nine legacy-route views | 1,207,185 each | 280,861 each |
| Independent trio comparison | 117,390 | 33,119 |

Mobile legacy snapshots ranged from **1,172,765 to 1,207,185 decoded bytes**, with 267,036–280,861 recomputed gzip bytes as optional enhancers settled. These are same-origin application JS bodies during the collector's settling window, not total network bytes, third-party Maps cost, measured wire compression, Core Web Vitals or conversion uplift. Gzip was computed from bodies for comparison; it is not a claim about Cloudflare's actual compression.

Largest observed homepage bodies: main **528,480 bytes**; site data **182,504**; market notes **167,735**; news data **125,523**. The later small enhancer chunks are not the principal weight. This supports narrow investigation of route-/interaction-specific data loading, not an unbounded main.ts rewrite.

First preserve the lightweight comparison/individual-plan boundary and lazy-load only the new concierge body. Then test one optional low-risk data/enhancement boundary at a time, after checking its actual render dependency and SPA navigation. Capture before/after browser request graphs. Do not defer synchronous request ownership/attribution or schema/H1 correctness. Do not remove public data by guessing it is unused. **Future Cesium/Three.js must remain outside the normal initial bundle**, with an explicit request-graph guard.

### Duplicate media — measured, deletion deferred

| Tree measured | Media files | Total bytes | Identical groups | Redundant copies | Redundant bytes |
|---|---:|---:|---:|---:|---:|
| Repository `public/` | 1,094 | 955,349,451 | 147 | 151 | 185,976,753 |
| Audit-built `dist/` | 979 | 654,510,210 | 133 | 137 | 181,896,682 |

`dist/` is a no-key build of the production application, not a dump of every live CDN object. Matching is SHA-256 byte identity for image/PDF/video/model extensions, not visual near-duplication. The roughly **181.90 MB** redundant build footprint is **not** an initial-visit transfer penalty or an automatically safe deletion budget.

Large pairs include Forte floor-plan PDFs under both approved `/assets/projects/...` paths and legacy `/projects/.../docs/floorplans/...` paths, followed by Mr. C and Ritz floor-plan PDFs. They can carry existing incoming links/source references. No broad deletion is authorized in this conversion batch. A future asset task must inventory references, preserve URL compatibility, verify redirects/content type/cache behavior and run strict asset/link checks before removing any path. Existing build pruning stays unchanged.

## 7. Proposed implementation sequence and review gates

The current draft is the audit/architecture checkpoint. Before any buyer-facing code work, refresh production main and the diff; begin controlled implementation from **then-current main**, not a stale Batch 5 branch. The intended next implementation branch is `p2-batch6-concierge-intents` (not created by this audit). Each independently reviewable slice must remain a draft until approved; no Batch 6 deployment is authorized here.

| Slice | Scope | Acceptance before review |
|---|---|---|
| **6A — shared request contract** | Pure five-intent registry and backward-compatible server normalization; exact context summaries; fix Olara/Maison form label/action mismatch; no new lead endpoint or unnecessary DB migration. | Browser → normalized server/storage/delivery agreement; all existing aliases accepted; same-session switching both directions; manual edits; first-touch; plan/shortlist identity; retry/race/double-click tests with mocks. |
| **6B — one concierge experience** | Shared lazily loaded Ask WPB component across shell families; grouped research/current-info/team actions; meaningful links; exact human handoffs; one mobile surface and accessible close/focus behavior. | All ten routes, individual-plan routes, desktop/mobile and keyboard; no fake AI/current-stock/booking claims; direct contextual CTA short paths retained; no heavy main import into lightweight entries. |
| **6C — central social metadata** | Shared absolute HTTPS resolver and approved raw/hydrated image consistency. May be a small independent draft branched from current main. | Raw/JS-off/hydrated/SPA route matrix; correct canonical origin; safe protocols; images resolve; one existing schema graph and semantic H1 unchanged. |
| **6D — measured loading opportunity** | At most one demonstrated low-risk lazy-loading boundary after usage analysis; otherwise retain baseline and defer. Duplicate deletion remains outside this work. | Before/after request graphs and bytes; no blank initial content, lost handlers or broken SPA navigation; complete keyed/no-key/Maps/SEO/asset/privacy gates. No claimed improvement without measurement. |

For 6A/6B, regression coverage must include availability → packet and reverse; Rosewood ↔ Maison; Olara plan A → C and reverse; project → corridor → shortlist → question/tour; manually changed project/interest; edit then refresh/back/forward; repeated explicit requests; unknown/invalid IDs; failed submission/retry/double-click; explicit shortlist versus viewed history; sanitization and no PII in analytics. Reuse and extend existing tests rather than replacing stronger contracts with weaker selectors.

Every implementation candidate requires typecheck/build, **complete `npm test`**, keyed/no-key verification, desktop/mobile inspection, same-session flows, accessibility/forms, SEO/schema/canonicals/assets/internal links/Agent Skills/gatekeeper/privacy, keyed production preflight and actual Maps, and the expected no-key deployment rejection. No automated production request reaches the real lead endpoint. Any workflow guard that permits selected new application files must be narrowed and reviewed; do not remove protected-surface checks wholesale.

## 8. Verification results and limitations

For exact harness SHA `e88d68857345a0e2a485654cad2e36c5e411c357`, workflow **`34411817616`** completed:

- Desktop inventory `102667847450`: SUCCESS.
- Mobile inventory `102667847741`: SUCCESS.
- Keyed candidate `102667847778`: SUCCESS.
- No-key candidate `102667847575`: SUCCESS.
- Aggregate review gate `102670051210`: SUCCESS.

Both candidates passed complete repository tests, typecheck/build, seven authorship source contracts, 48 authorship browser cases, existing contextual buyer journeys including Batch 4, standard/strict assets, SEO/internal-link and Agent Skill checks, gatekeeper/privacy, and the relevant Maps/preflight mode. Later commits that only record this audit/documentation are successors, not new buyer-facing implementations; PR checks must identify their own exact heads and outcomes. Passing regression tests establishes preserved contracts, not that proposed concierge work already exists or that no usability issue can remain.

**Not exercised or claimed:** real server Turnstile success, real email/database/CRM delivery, real duplicate-record outcomes, GA4 transport, lead quality, conversion uplift, real-phone/iOS Safari rendering, complete screen-reader behavior or performance field metrics. Desktop/mobile observations here use Chromium viewports; actual-device acceptance belongs in the later UI implementation review. The Ask keyword diagnosis is source-based; no generated-answer capability was tested.

`docs/BATCH4_MANUAL_PRODUCTION_LEAD_ACCEPTANCE.md` remains **unexecuted**, reserved for one deliberate Brooke test. PR #75 / GA4 stays **PARKED / NON-CRITICAL / NOT A DEPENDENCY**. Alba remains unpublished. 3D city maps and Three.js floor-plan models remain independent. Stable Person IDs and existing Brooke/Scott responsibility assignments are unchanged. No invented availability, pricing, fees, incentives, delivery dates, editorial desk or private contact data is added.
