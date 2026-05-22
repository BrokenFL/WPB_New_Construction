# Project Team Resource Imagery

This site should show developer, builder, architect, designer, landscape, brand, and sales-team context only when the source and usage rights are clear.

## Public Display Rules

- Show a real team image only after it is sourced from official project materials, the team website, or user-provided material and reviewed for public use.
- If no reviewed image exists, use a clean logo-style or team-profile placeholder.
- Do not use fake people, fake offices, or imagery that implies an affiliation beyond the sourced project data.
- Do not expose sourcing status words in the public interface.

## Data Source

Team imagery review records live in `src/data/projectTeamResources.ts`.

Each record supports `projectId`, `role`, `name`, optional `websiteUrl`, optional `imagePath`, `imageStatus`, optional `sourceUrl`, `caption`, and optional `notes`. Supported roles are Developer, Builder, Architect, Interior Designer, Landscape Architect, Brand Partner, Sales, and Other.

## Current Review Priorities

- Olara: confirm developer/team imagery and publication rights.
- Rosewood: confirm brand/developer/team imagery once public project materials mature.
- NORA House: source official developer or district imagery.
- South Flagler House: confirm architecture/design imagery that can be shown publicly.
