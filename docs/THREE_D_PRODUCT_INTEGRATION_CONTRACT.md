# 3D Product Integration Contract

**Status:** Planning contract only. No 3D implementation or production deployment is authorized by this document.  
**Baseline:** Production `main` after PR #79 (`589d2f43151d7e57af6c7a831fe4837b66cb5d3a`).  
**Approval rule:** Modeling completion, website integration readiness, and public publication are separate states. The existence of a GLB never authorizes site integration or deployment.

## 1. Responsibility split

### Codex / Blender owns

- Blender masters and source scene organization.
- Modeling and reconstruction.
- GLB export.
- Texture optimization for the approved web export.
- Model dimensions, units, axes and origins.
- Poster renders.
- Model/source provenance and confidence notes.
- Delivery of approved export metadata needed by the website manifest.

Blender masters, reconstruction references and internal provenance stay in the architectural-model workspace. They are not website public assets.

### Astra / site owns

- The public allowlisted model registry.
- Three.js and CesiumJS integration.
- Route/module-level lazy loading.
- Buyer-facing UI, controls and accuracy disclosures.
- Project and plan linking.
- Static and non-WebGL fallbacks.
- Desktop/mobile/browser testing.
- Inquiry integration and retention of exact project/plan context.
- Publication-state enforcement and rollback/disable controls.

Neither side may infer that the other side's completion state equals publication approval.

## 2. Model types

The product has two distinct geometry lanes.

### `building-exterior`

Purpose: independently owned/authorized exterior building geometry placed on the 3D city map.

Requirements include a documented ground-level origin, meter units, verified geographic placement, heading, elevation, scale and optional site footprint/patch metadata.

### `floorplan-interior`

Purpose: residence-specific floor-plan geometry embedded on canonical residence pages.

Requirements include a documented local origin, source-plan dimension controls, room/camera metadata and a clear model-accuracy disclosure.

**Hard rule:** Do not reuse one geometry type as the other. An exterior city-map model is not a residence interior model; a unit/floor-plan model is not a building-placement model. They may share tooling conventions, but not geometry identity or approval state.

## 3. 3D map placement

### Development pilot

Create a private, noindex `/map-3d/` route. Preserve the existing `/map/` route unchanged during Gate A.

The pilot must:

- Use CesiumJS as the browser renderer.
- Stream Google Photorealistic 3D Tiles at runtime using approved credentials.
- Overlay only owned/authorized GLB models.
- Never download, rehost, archive, trace, reconstruct from, or publish Google geometry as an owned asset.
- Keep required Google attribution visible and unobscured.
- Use verified WGS84 longitude/latitude plus explicit elevation/vertical-datum handling, heading and scale.
- Keep modeling near a local origin and perform geographic placement in the viewer transform.
- Demonstrate runtime site clipping plus an independently owned site/ground patch where needed.
- Prove one simple independently sourced test model before using a production architectural model.
- Use South Flagler House only after the test-model placement path succeeds and the currently approved South Flagler model phase is confirmed.
- Save six named camera bookmarks/observations for repeatable review.
- Review on desktop and a physical iPhone.
- Record provider request/cost observations and maintain a tested disable switch.
- Load one active owned building model at a time unless a later performance gate explicitly approves otherwise.

A failed own-model or site-patch load must not leave a destructive clip active. Failure must restore the normal backdrop or existing non-3D buyer path.

### After pilot approval

Only after a separate approval may the 3D map become a **secondary 3D mode** on `/map/`.

- The current 2D/list experience remains the default.
- Mobile remains list/gallery or lightweight-map first.
- 3D remains opt-in and lazy-loaded.
- The existing `/map/` buyer journey must remain fully usable if Cesium, Google tiles, WebGL or an owned GLB fails.

## 4. Floor-plan model placement

Embed an optional, lazy-loaded Three.js module **inside the canonical HTML floor-plan page**. Do not create a separate thin SEO page whose sole purpose is the viewer.

### Pilot

Canonical page: `/floorplans/olara/residence-d/`

Required page order:

1. Static drawing and verified facts.
2. Early current-availability action.
3. **Explore in 3D** module.
4. Comparison guidance.
5. Source notes and qualifications.

The existing static HTML and approved PDF remain canonical and fully useful without JavaScript/WebGL. Three.js and the GLB load only after explicit user interaction with the 3D module.

The module must provide:

- Static poster image before load and as fallback.
- Orbit/dollhouse interaction.
- Reset-camera control.
- Named camera presets.
- Room-label toggle.
- Keyboard-accessible controls and sensible focus behavior.
- Mobile/WebGL failure fallback.
- Reduced-motion behavior.
- A clear conceptual/model-accuracy disclosure.

The model and copy must not imply unsupported finishes, ceiling heights, furniture, views or dimensions. Values not supported by the reviewed source plan remain unknown rather than being visually asserted as facts.

The existing exact-plan inquiry behavior remains authoritative. Launching or exiting the viewer must not erase `projectId`, `planId`/plan identity, first-touch attribution or current exact-plan inquiry context.

## 5. Public model manifest

Create one site-owned allowlisted public registry. Internal research/manifests may be richer, but only approved public records enter the website registry.

Minimum logical record:

```ts
type PublicModelRecord = {
  modelId: string;
  kind: "building-exterior" | "floorplan-interior";
  projectId: string;
  planId: string | null;
  version: string;
  glbUrl: string;
  posterUrl: string;
  units: "meters";
  approvalState: "review" | "approved" | "published";
  sourceReviewDate: string | null;
  rightsStatus: "pending" | "approved" | "blocked";
  cameraPresets: Array<{
    id: string;
    label: string;
    position: unknown;
    target: unknown;
  }>;
  geographicPlacement: null | {
    longitude: number;
    latitude: number;
    elevationMeters: number;
    elevationDatum: string;
    headingDegrees: number;
    scale: number;
  };
  footprint: unknown | null;
};
```

Publication rules:

- `modelId`, `kind`, `projectId`, `version`, GLB URL, poster URL, meter units, approval/publication state, rights state and required camera information may not be invented.
- `planId` is required for `floorplan-interior` and must be `null` for a building exterior unless a later reviewed schema explicitly adds another use.
- Geographic placement/footprint may be `null` for floor-plan interiors.
- A building intended for the map may not publish with missing required placement values.
- Unknown values remain `null`; required unknowns block publication instead of defaulting to zero, guessed coordinates or guessed dimensions.
- The public registry contains no local filesystem paths, credentials, private source links, unpublished research notes or hold/review projects.
- Public model publication must be allowlisted separately from the project's ordinary public-page eligibility.

Recommended state rule: a model may be technically complete while still `review`; only an explicit publication approval can advance it to `published`.

## 6. Asset paths

Blender/source masters stay outside the website's public files and outside the site's normal public asset tree.

Publish only approved optimized web artifacts through the established asset pipeline, using versioned paths such as:

```text
public/models/{projectId}/{version}/map.glb
public/models/{projectId}/{planId}/{version}/unit.glb
```

Poster images should use equivalent deterministic/versioned placement or the established approved asset pipeline's canonical output path.

Never commit to the website repository:

- `.blend` masters.
- Google tiles or Google geometry.
- Local absolute paths.
- Unapproved source/reference textures.
- Internal reconstruction evidence that is not cleared for publication.
- Secrets or credential-bearing URLs.

Updating an owned web model should create a new versioned asset rather than silently replacing the provenance of an older approved version.

## 7. Performance and failure isolation

- Do not add CesiumJS or Three.js to the site's normal initial bundle.
- Use route-level/module-level dynamic loading.
- Do not request 3D assets before user opt-in where the experience is optional.
- Load one owned model at a time for the initial product contract.
- Use GLB compression and web-appropriate texture sizes/formats validated by measured browser behavior.
- Always provide static poster/fallback content.
- Destroy viewer/render-loop/WebGL/event resources when leaving the route or closing/unmounting the module.
- Test desktop browsers, physical-iPhone Mobile Safari, touch behavior, reduced motion and WebGL/context failure.
- A failed 3D viewer must never break the canonical project page, canonical floor-plan page, existing map, inquiry flow or normal navigation.
- Provider quota/session errors and missing GLBs must degrade to the existing buyer experience, not to a blank canvas.

## 8. Product connections

When — and only when — an approved/published model record exists:

- Project pages may show **3D available**.
- A selected city-map overlay opens the canonical project guide, not a duplicate model page.
- Eligible floor-plan pages may show **Explore in 3D**.
- Comparison pages may link to available models but must not embed multiple simultaneous viewers.
- Inquiry context must retain exact canonical `projectId` and, for floor-plan models, exact plan identity.

Do not create thin standalone SEO pages solely to host a 3D viewer. Canonical project/floor-plan content remains the discoverable buyer resource.

## 9. First approval gates

### Map Gate A

Deliver for review and stop before production deployment:

- Private/noindex map preview.
- One accurately placed independently sourced test model.
- One runtime clipping/site-patch demonstration with rollback behavior.
- Six named camera/viewpoint observations.
- Desktop result.
- Physical-iPhone result.
- Provider request/cost observations plus proposed operating controls/disable switch.
- Test results, unresolved accuracy/licensing/performance risks and exact changed-file list.

**No production deployment is authorized at Map Gate A.** South Flagler House does not become publishable merely because its GLB is complete.

### Floor-plan Gate A

Deliver for review and stop before production deployment:

- One Olara Residence D `floorplan-interior` model.
- Poster validation.
- GLB validation.
- Verified units/dimensions/origin against the source plan to the level the source actually supports.
- Desktop viewer result.
- Physical-iPhone/mobile viewer result.
- WebGL/no-viewer fallback result.
- Exact-plan inquiry path validation preserving Residence D context.
- Accuracy disclosure review.
- Test results and exact changed-file list.

**No production deployment is authorized at Floor-plan Gate A.**

## 10. Relationship to existing 3D map handoff

This contract extends — and does not supersede without explicit approval — `WPB_3D_Map_Codex_Handoff.md`.

The handoff already establishes the key map constraints: browser-side CesiumJS, live Google Photorealistic 3D Tiles, independently owned GLB overlays, preservation of `/map/`, a separate `/map-3d/` pilot, WGS84/elevation/orientation discipline, runtime clipping/site patching, six-view review, mobile review, cost controls and approval gates.

This document adds the missing **product-level split** between city-map exterior models and residence floor-plan interior models; a shared public allowlisted model registry; floor-plan Three.js rules; exact-plan inquiry requirements; and the explicit separation between modeling completion, integration approval and publication.

If a later implementation conflicts with either document, use the stricter non-publication / fail-closed interpretation until Brooke explicitly resolves the conflict.

## 11. Compatibility with current production architecture

Current production is a Vite/TypeScript site with an established `/map/` experience and canonical floor-plan pages. The Residence pages already set canonical metadata/schema, render useful static content, and preserve plan-specific inquiry attribution. 3D must be additive to those paths, not a replacement architecture.

Implementation implications:

- Keep the current router/site framework; do not introduce React, Next.js or another app framework merely for 3D.
- Add Cesium and Three.js only behind dynamic imports in future approved implementation branches.
- Keep `/map/` unchanged during the private pilot.
- Keep static floor-plan rendering and PDFs independent of viewer success.
- Reuse canonical project/plan identifiers and the existing lead-attribution bridge rather than creating a parallel inquiry system.
- Treat generated/public site data according to existing source-of-truth/generator rules; do not hand-edit generated files merely to expose model availability.

## 12. Conflicts and decisions requiring review

Comparison against `WPB_3D_Map_Codex_Handoff.md`, current project instructions and the production map/floor-plan architecture finds **no blocking conceptual conflict** with this contract. The following implementation decisions must nevertheless be resolved at the appropriate gate rather than guessed:

1. **Asset pipeline destination.** The contract specifies `public/models/...` as the public URL/file convention, while project instructions require approved assets to flow through the established asset pipeline and warn against hand-editing generated manifests. Implementation must identify the canonical source repo/publisher step for GLBs/posters before committing real model assets.
2. **Manifest source of truth.** The handoff proposed `src/map3d/modelRegistry.ts` / `publicManifest.schema.json`; the broader product now needs both map and floor-plan records. Before implementation, choose one source-of-truth location and generator/validation path so model state is not duplicated across map code, floor-plan code and generated site data.
3. **Approval-state vocabulary.** Existing project/public data has its own eligibility/status concepts. Model approval/publication state must remain a separate field/lane and must not silently inherit ordinary project publication status.
4. **Plan identifier naming.** Current floor-plan runtime carries canonical project identity plus plan slug/plan ID concepts. The manifest must bind to the existing canonical Residence D identity exactly; do not introduce a second competing plan identifier.
5. **Noindex/private pilot mechanism.** `/map-3d/` must be both operationally private/review-gated and excluded from index/sitemap discovery. The exact preview protection mechanism should follow the current deployment/preview architecture rather than relying only on a meta robots tag.
6. **Google credential/cost setup.** The handoff requires restricted development credentials, quotas/cost monitoring and a disable switch. No current production credential should be rotated or repurposed merely to satisfy the pilot.
7. **Physical-iPhone evidence.** Automated mobile emulation is not a substitute for the required physical-iPhone Gate A observation.
8. **Source-supported interior height.** A 3D floor-plan requires wall/door/camera geometry to render, while many plan drawings do not establish ceiling heights. The pilot must use an explicitly disclosed conceptual visualization treatment or obtain a reviewed height source; it may not present an assumed height as a verified property fact.
9. **Poster/model rights.** Publication is blocked unless rights status covers the source textures/materials used in both GLB and poster. A clean GLB export is not itself a rights approval.
10. **3D availability UI.** Project/plan pages may advertise 3D only from the allowlisted published registry. A file discovered at a public path is insufficient evidence of availability.

## 13. Non-authorization statement

This planning contract does **not** authorize:

- Adding CesiumJS, Three.js or 3D routes to production.
- Publishing any GLB/poster/model registry entry.
- Deploying South Flagler House or Olara Residence D in 3D.
- Changing the production `/map/` experience.
- Importing or storing Google 3D geometry.
- Advancing a Blender reconstruction phase.
- Treating an available GLB as an approved public product.

A future 3D implementation must begin on its own approved branch from the then-current production baseline and stop at the applicable Gate A for review.