# Authorized Asset Resize Workflow

This workflow is for a future asset agent that prepares web-ready derivatives from already-authorized building assets. It is intentionally bounded: this pass defines the plan and guardrails only, and does not generate images, resize files, publish assets, or change authorization statuses.

## Boundaries

- Source of truth: `research/source-material-review/image-caption-catalog.json`.
- Planning outputs: `research/source-material-review/authorized-asset-resize-plan.json` and `research/source-material-review/authorized-asset-resize-plan.md`.
- No source authorization edits: do not change `clearanceStatus`, `rightsStatus`, source URLs, or source/provider labels.
- No image generation in this planning pass.
- No writes outside `research/source-material-review/` unless a later human-approved implementation task explicitly opens a destination such as `public/projects/*/media/generated/`.

## Authorization Gate

The planner includes only assets with explicit positive clearance language such as `authorized`, `cleared`, `licensed`, `written permission`, `approved for publication`, or `approved for web`.

The planner blocks assets with unresolved language such as `rights review required`, `avoid marketing use`, `until replaced or cleared`, `confirm permission`, missing source/provider data, or unknown provenance.

If the plan returns zero authorized assets, that is a valid result. The future asset agent must not infer permission from official-source status alone.

## Future Command

Run this from the repository root:

```bash
node research/scripts/plan-authorized-asset-resize.mjs --write
```

For a dry run that prints counts without writing the plan:

```bash
node research/scripts/plan-authorized-asset-resize.mjs
```

## Future Asset-Agent Contract

1. Run the planner with `--write`.
2. Read `research/source-material-review/authorized-asset-resize-plan.json`.
3. Stop if `summary.authorizedAssets` is `0`.
4. For each listed asset, verify the input file still exists and the plan still carries explicit positive clearance.
5. Generate only the derivative paths listed in the plan.
6. Preserve the `credit`, `sourceUrl`, `sourcePage`, and `clearanceStatus` fields in any downstream manifest.
7. Do not process any asset from the `blocked` list.
8. Re-run caption/readiness QA after derivatives are generated.

## Planned Derivatives

- `hero`: 1920px wide WebP, quality 82.
- `card`: 960px wide WebP, quality 82.
- `thumb`: 480px wide WebP, quality 80.
- `og`: 1200x630 JPEG, quality 84.

The planner proposes output paths under `public/projects/<project-id>/media/generated/`, but this planning task does not create those directories or files.

## Credit Requirement

Every generated derivative must keep a visible or manifest-linked credit line. Use the planner's `credit` field as the canonical starting point. If a license requires more specific wording, update the upstream authorization record first, then re-run the planner.
