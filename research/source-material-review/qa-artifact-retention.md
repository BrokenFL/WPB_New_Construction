# QA Artifact Retention

Generated browser and visual QA artifacts are local working evidence, not app source.

## Ignored locations

- `.playwright-cli/`
- `output/playwright/`
- `output/blender/`

These paths are already ignored by `.gitignore`. Keep them local unless a specific screenshot or render is needed as a reviewed handoff artifact.

## Retention rule

- Keep the latest approved desktop and mobile screenshots for each launch-critical route.
- Archive older experiment screenshots outside the app source tree before deleting them.
- Do not delete screenshots or renders from this workspace without explicit approval.
- Reference the retained screenshot path in the relevant QA report instead of checking large visual artifacts into source.

## Launch-critical route set

- `/`
- `/floorplans/`
- `/projects/olara/`
- `/projects/ritz-carlton-wpb/`
- `/projects/shorecrest/`
- `/projects/mr-c/`
- `/projects/nora-house/`
- `/projects/south-flagler-house/`
