# Codex 3D First Task Prompt

Use this prompt as the first handoff to Codex on the Mac mini. This is a **local modeling/reconstruction setup task only**. It does not authorize website integration or production deployment.

---

You are taking over the local 3D modeling lane for WPBNewConstruction.com.

## Read first

Before changing anything, read these repository documents from `BrokenFL/WPB_New_Construction`:

1. `docs/THREE_D_PRODUCT_INTEGRATION_CONTRACT.md`
2. `WPB_3D_Map_Codex_Handoff.md` if present in the repository/workspace
3. `docs/AI_PROJECT_GUIDE.md`
4. `AGENTS.md`
5. `docs/ASSET_WORKFLOW.md`

The website production repository is not the home for Blender masters. Do not add `.blend` files, raw reconstruction references, Google 3D geometry, credentials, or unpublished model source material to the website repo.

## Goal

Create a reusable local Blender-first architectural modeling workspace capable of producing two separate artifact classes:

- `building-exterior`: independent/authorized building models intended to be georeferenced later in a browser-based CesiumJS city map.
- `floorplan-interior`: residence-specific conceptual spatial models intended to be exported later for Three.js viewing on canonical floor-plan pages.

These are separate geometry identities. Do not collapse them into one pipeline or one approval state.

## Workspace location

Inspect attached/external storage on the Mac mini and identify the appropriate external SSD already used for project work. Prefer an existing clearly named 3D/modeling root if one exists. Otherwise create a new root named:

`WPB_3D_Models`

Do not guess a mount path. Discover it first and report the exact path you select.

Inside the root create this structure:

```text
WPB_3D_Models/
  README.md
  standards/
    coordinate-system.md
    export-standard.md
    naming-standard.md
    source-rights-standard.md
  projects/
    south-flagler-house/
      source/
      references/
      blender/
      exports/
      posters/
      qa/
      manifests/
    olara/
      residence-d/
        source/
        references/
        blender/
        exports/
        posters/
        qa/
        manifests/
  tools/
    blender/
    validation/
  templates/
    building-exterior/
    floorplan-interior/
```

Do not populate `source/` or `references/` with third-party material until provenance/rights are known.

## Blender setup

Confirm Blender is installed and callable. Record exact version. Do not upgrade Blender unless required and approved.

Create a reusable Blender project/template convention with:

- units: meters
- unit scale: 1.0
- Z-up
- local modeling origin near the project geometry
- deterministic object/collection naming
- transforms applied before final web export where appropriate
- no embedded absolute local paths in exported assets
- clean collection separation for architecture, site patch, helper/reference geometry, cameras, lights, labels and export-only objects

Recommended collection names:

```text
ARCH
SITE
GLASS
DETAIL
REFERENCE
HELPERS
CAMERAS
LIGHTS
EXPORT
```

For floor-plan interiors also allow:

```text
ROOMS
DOORS
WINDOWS
FIXTURES
LABEL_ANCHORS
```

## Export standard

Draft and document a GLB export standard suitable for browser use. At minimum include:

- meters
- +Y/-Y convention explicitly documented after testing Blender -> glTF -> Three.js/Cesium orientation
- origin rule
- texture size policy
- material restrictions
- mesh naming
- transform policy
- optional Draco/Meshopt/KTX2 strategy, but do not introduce compression until the viewer compatibility path is proven
- no unpublished source images embedded by accident
- validation step after every export

Do not optimize destructively before establishing a clean baseline export.

## Manifest contract

For every export, create a local sidecar JSON manifest in the project `manifests/` directory. This local manifest may be richer than the future public website manifest.

Minimum fields:

```json
{
  "modelId": "",
  "kind": "building-exterior | floorplan-interior",
  "projectId": "",
  "planId": null,
  "version": "",
  "blenderVersion": "",
  "sourceFiles": [],
  "sourceRightsStatus": "pending",
  "sourceReviewDate": null,
  "units": "meters",
  "originDescription": "",
  "dimensionsMeters": null,
  "geographicPlacement": null,
  "cameraPresets": [],
  "exportFile": "",
  "exportSha256": "",
  "posterFiles": [],
  "qaStatus": "not-tested",
  "notes": []
}
```

For `floorplan-interior`, `planId` is required before a model can be considered integration-ready. For `building-exterior`, geographic placement can remain null during modeling but must not be guessed.

## First technical proof — generic test asset

Before touching South Flagler House or Olara Residence D geometry, create a very simple independently created generic building test asset entirely from primitives inside Blender. Purpose: prove the pipeline, not architectural fidelity.

Requirements:

- approximately 20 m x 30 m footprint
- approximately 60 m tall
- simple podium + tower massing
- one clearly asymmetric feature so heading/orientation is visually obvious
- local origin documented
- two materials maximum
- six named review cameras: `north`, `south`, `east`, `west`, `aerial-oblique`, `street-oblique`
- export to GLB
- generate one poster render
- create local manifest
- compute SHA-256 of GLB
- validate the GLB opens correctly after export

This test asset must contain no Google-derived geometry or textures and no developer-owned source material.

## South Flagler House preparation

After the generic export pipeline passes, inspect the existing South Flagler House local project/materials and report what already exists. Do not overwrite or rebuild the model yet.

Create an inventory report containing:

- exact local paths
- Blender file(s)
- source/reference folders
- current model dimensions
- current origin
- current unit settings
- object/mesh/material counts
- texture inventory and approximate resolutions
- known geographic coordinate/heading/elevation data, if any
- whether the model appears suitable for a clean GLB export
- obvious rights/provenance unknowns
- obvious performance risks

Do not infer missing placement coordinates from Google 3D Tiles or imagery.

## Olara Residence D preparation

Locate any existing Residence D source floor plan/material already present in approved local project files. Do not fetch new sources as part of this task unless explicitly authorized.

Create a source-readiness report:

- source drawing path
- printed dimensions/areas available in the drawing
- whether scale can be established from explicit dimensions
- room labels available
- door/window locations visually supported
- unknown ceiling heights
- unsupported finish/furniture/view assumptions that must not be modeled as facts
- recommended conceptual wall-height treatment if no verified height source exists

Do not begin the Residence D 3D reconstruction until this source-readiness report is complete.

## Validation tooling

Create a small local validation script or command workflow that can, at minimum:

- verify expected GLB file exists
- record file size
- compute SHA-256
- inspect basic glTF/GLB metadata if available using installed/local tooling
- fail if the exported path is outside the approved project `exports/` tree
- fail if the local manifest is missing required identifiers

Prefer simple maintainable tooling over a large new framework.

## Deliverables for this first task

When complete, stop and report:

1. exact external SSD workspace path
2. Blender version
3. created directory tree
4. generic test model `.blend` path
5. generic test GLB path + file size + SHA-256
6. poster path
7. local manifest path
8. validation result
9. South Flagler House inventory report path and findings
10. Olara Residence D source-readiness report path and findings
11. any blockers or rights/provenance unknowns
12. exact files/scripts you created or changed

Do **not** modify the production website, add Three.js/CesiumJS, publish GLBs, change `/map/`, deploy anything, or claim either South Flagler House or Olara Residence D is ready for public use.

The completion criterion is a clean, reproducible local modeling/export pipeline plus inventories/readiness reports — not a finished architectural model.
