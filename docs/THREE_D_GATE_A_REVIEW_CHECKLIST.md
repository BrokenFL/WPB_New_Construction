# 3D Gate A Review Checklist

Use this checklist after Codex completes the local modeling/export kickoff. It is a review gate, not production authorization.

## A. Generic pipeline proof

Pass only if all are true:

- [ ] Blender version recorded.
- [ ] Workspace is on the intended external SSD and exact path is documented.
- [ ] Generic test asset is independently created from Blender primitives.
- [ ] Scene units are meters; unit scale documented.
- [ ] Local origin documented.
- [ ] Six named cameras exist: north, south, east, west, aerial-oblique, street-oblique.
- [ ] GLB exports successfully.
- [ ] Export reopens/validates successfully.
- [ ] GLB SHA-256 recorded.
- [ ] Poster render exists.
- [ ] Local manifest exists and passes required-field validation.
- [ ] No Google geometry, Google tile assets or unapproved third-party textures are embedded.
- [ ] No absolute local path leaks are found in publication candidates.

Failure here blocks all later architectural web-integration work.

## B. South Flagler House exterior readiness

Review as `building-exterior` only.

- [ ] Existing Blender master identified without destructive overwrite.
- [ ] Model dimensions and scene units recorded.
- [ ] Current origin documented.
- [ ] Object / mesh / material counts recorded.
- [ ] Texture inventory recorded.
- [ ] Geometry is independently owned/authorized for intended use.
- [ ] Material/texture rights are known or explicitly pending.
- [ ] Geographic coordinates are supported by an independent verified source.
- [ ] Heading is supported and documented.
- [ ] Elevation and vertical datum are documented; no guessed zero elevation.
- [ ] Site footprint / owned ground patch need is assessed.
- [ ] GLB export feasibility is assessed.
- [ ] Performance risks are identified before optimization.

Missing rights or required placement values block public map publication; they do not block local modeling cleanup.

## C. Olara Residence D interior readiness

Review as `floorplan-interior` only.

- [ ] Canonical project ID confirmed.
- [ ] Canonical plan identity / plan ID confirmed.
- [ ] Reviewed source drawing path recorded.
- [ ] Explicit source dimensions sufficient to establish scale, or limitations clearly documented.
- [ ] Printed room/area values separated from model-derived measurements.
- [ ] Door/window locations are source-supported.
- [ ] Ceiling/wall height source is verified OR conceptual treatment is explicitly disclosed.
- [ ] Furniture/finishes/views are not presented as verified facts unless separately sourced.
- [ ] Local origin rule documented.
- [ ] Named camera preset plan documented.
- [ ] Exact-plan inquiry context requirements understood before website integration.

If source geometry cannot support a defensible spatial model, stop rather than inventing dimensions.

## D. Website Map Gate A — future implementation branch

Do not begin until A passes and South Flagler readiness is sufficient for an authorized test.

- [ ] New implementation branch starts from then-current `main`.
- [ ] `/map/` unchanged during pilot.
- [ ] Private/noindex `/map-3d/` preview created.
- [ ] CesiumJS loaded only on 3D route / user intent.
- [ ] Google Photorealistic 3D Tiles streamed at runtime only; not downloaded/rehosted.
- [ ] Google attribution remains visible.
- [ ] Generic owned test GLB placed first.
- [ ] WGS84 placement, heading, elevation/datum and scale explicitly configured.
- [ ] Runtime clipping/site patch test has rollback behavior.
- [ ] Missing owned model does not leave destructive clipping active.
- [ ] Six repeatable viewpoints reviewed.
- [ ] Desktop review completed.
- [ ] Physical iPhone review completed.
- [ ] Provider request/cost observations recorded.
- [ ] Kill/disable switch tested.
- [ ] Existing map/list buyer journey remains functional under Cesium/WebGL/provider failure.

## E. Website Floor-plan Gate A — future implementation branch

Do not begin until A passes and Residence D readiness is sufficient.

- [ ] Canonical `/floorplans/olara/residence-d/` remains the only SEO/canonical page.
- [ ] Static drawing/facts/PDF remain fully useful without JavaScript.
- [ ] Static poster renders before viewer load.
- [ ] Three.js loads only after explicit 3D interaction.
- [ ] GLB loads from allowlisted model registry.
- [ ] Orbit/dollhouse interaction works.
- [ ] Reset camera works.
- [ ] Named camera presets work.
- [ ] Room-label toggle works if labels are approved.
- [ ] Keyboard/focus behavior reviewed.
- [ ] Reduced-motion path reviewed.
- [ ] WebGL/no-viewer fallback works.
- [ ] Desktop review completed.
- [ ] Physical iPhone review completed.
- [ ] Accuracy disclosure is clear and source-supported.
- [ ] `projectId` and exact Residence D identity survive viewer launch/exit and inquiry submission.
- [ ] No PII is introduced into analytics by viewer interactions.

## F. Public registry gate

No model is advertised as available merely because a file exists.

- [ ] Record exists in the site-owned allowlisted registry.
- [ ] Model kind is correct.
- [ ] Canonical project ID is correct.
- [ ] Plan ID is correct/null as required.
- [ ] Version is immutable and explicit.
- [ ] GLB URL is versioned.
- [ ] Poster URL is versioned.
- [ ] Rights status is approved.
- [ ] Review/source date is truthful.
- [ ] Required camera presets exist.
- [ ] Map models include verified geographic placement.
- [ ] No secrets, local paths or private provenance notes are exposed.
- [ ] Publication state is explicitly approved/published.

## G. Release rule

Passing a Gate A means the pilot is technically reviewable. It does **not** itself authorize production deployment.

Production release requires a separate explicit approval after review of:

- visual fidelity,
- spatial accuracy,
- rights/provenance,
- performance,
- mobile behavior,
- fallback behavior,
- inquiry-context preservation,
- provider-cost controls,
- and the exact tested revision.
